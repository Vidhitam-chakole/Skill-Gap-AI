import re
import uuid

import httpx

from app.config import settings
from app.schemas import GitHubResult, LinkedInResult
from app.services.store import append_chat, get_chat_history, get_github_result, get_linkedin_result

FALLBACK_RESPONSES = [
    "Based on your profile, I'd recommend focusing on cloud architecture skills — they're in high demand right now!",
    "Great question! Strong frontend skills pair well with backend projects to become full-stack.",
    "Developers who learn System Design often see meaningful salary growth within 12–18 months.",
    "Try building a project that uses Docker and Kubernetes. It fills a major gap for many profiles.",
]

KEYWORD_RESPONSES: list[tuple[list[str], str]] = [
    (
        ["linkedin", "profile", "resume", "cv"],
        "Use the LinkedIn Analyzer with your profile URL. It highlights skill gaps, strengths, and market demand tailored to your headline.",
    ),
    (
        ["github", "repo", "repository", "code", "commit"],
        "Run the GitHub Analyzer with your username. It inspects languages, repos, stars, and suggests developer-focused improvements.",
    ),
    (
        ["roadmap", "learn", "learning", "course", "study", "path"],
        "Start with one high-severity gap, ship a small project applying it, then move to cloud or system design for maximum career impact.",
    ),
    (
        ["salary", "job", "career", "hire", "interview"],
        "Prioritize skills with high market demand: TypeScript, cloud platforms, and system design consistently rank among top differentiators.",
    ),
    (
        ["typescript", "react", "javascript", "python", "aws", "docker", "kubernetes"],
        "That skill is trending upward. Pair it with a portfolio project and document outcomes in your README and LinkedIn featured section.",
    ),
    (
        ["hello", "hi", "hey", "help"],
        "Hey! Ask me about skill gaps, career paths, or how to use the LinkedIn and GitHub analyzers on this page.",
    ),
]


def _context_reply(message: str, linkedin: LinkedInResult | None, github: GitHubResult | None) -> str | None:
    if not linkedin and not github:
        return None

    lowered = message.lower()
    gaps = []
    if linkedin:
        gaps.extend(linkedin.skillGaps)
    if github:
        gaps.extend(github.skillGaps)
    high = [gap.skill for gap in gaps if gap.severity == "high"]
    names = linkedin.name if linkedin else (github.name if github else "you")

    if any(word in lowered for word in ("gap", "missing", "weak", "improve", "roadmap", "next")):
        lead = high[0] if high else (gaps[0].skill if gaps else "portfolio visibility")
        extra = f" GitHub shows {', '.join(lang.name for lang in github.topLanguages[:3])}." if github else ""
        return (
            f"{names}, the fastest win is {lead}. "
            f"Treat high-severity gaps first, then ship something public this month.{extra}"
        )

    if linkedin and any(word in lowered for word in ("linkedin", "headline", "profile")):
        return (
            f"Your LinkedIn read as {linkedin.headline} with score {linkedin.overallScore}. "
            f"Lean on {', '.join(linkedin.strengths[:3])} while closing {linkedin.skillGaps[0].skill}."
        )

    if github and any(word in lowered for word in ("github", "repo", "language")):
        langs = ", ".join(f"{lang.name} {lang.percentage}%" for lang in github.topLanguages[:3])
        return (
            f"@{github.username} scores {github.overallScore}. Top languages: {langs}. "
            f"Next: {github.skillGaps[0].recommendation}"
        )

    return None


def _rule_based_reply(message: str, linkedin: LinkedInResult | None, github: GitHubResult | None) -> str:
    contextual = _context_reply(message, linkedin, github)
    if contextual:
        return contextual

    lowered = message.lower()
    for keywords, reply in KEYWORD_RESPONSES:
        if any(keyword in lowered for keyword in keywords):
            return reply

    if "gap" in lowered or "skill" in lowered:
        return "Skill gaps are best tackled in priority order: fix high-severity items first, then broaden into cloud, testing, and system design."

    return FALLBACK_RESPONSES[len(re.findall(r"\w+", lowered)) % len(FALLBACK_RESPONSES)]


def _analysis_blurb(linkedin: LinkedInResult | None, github: GitHubResult | None) -> str:
    parts: list[str] = []
    if linkedin:
        gaps = "; ".join(f"{gap.skill} ({gap.severity})" for gap in linkedin.skillGaps)
        parts.append(
            f"LinkedIn: {linkedin.name}, {linkedin.headline}, score {linkedin.overallScore}. "
            f"Strengths: {', '.join(linkedin.strengths)}. Gaps: {gaps}."
        )
    if github:
        langs = ", ".join(f"{lang.name} {lang.percentage}%" for lang in github.topLanguages)
        gaps = "; ".join(f"{gap.skill} ({gap.severity})" for gap in github.skillGaps)
        parts.append(
            f"GitHub: @{github.username}, score {github.overallScore}, languages {langs}. Gaps: {gaps}."
        )
    return " ".join(parts)


async def _openai_reply(
    message: str,
    history: list[dict[str, str]],
    linkedin: LinkedInResult | None,
    github: GitHubResult | None,
) -> str | None:
    if not settings.openai_api_key:
        return None

    system = (
        "You are SkillGap AI, a concise career assistant. Help users understand skill gaps, "
        "LinkedIn/GitHub analysis, and learning roadmaps. Keep answers under 120 words."
    )
    blurb = _analysis_blurb(linkedin, github)
    if blurb:
        system += f" Current analysis context: {blurb}"

    messages = [{"role": "system", "content": system}]

    for item in history[-6:]:
        role = "assistant" if item["role"] == "bot" else "user"
        messages.append({"role": role, "content": item["text"]})
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.7},
        )
        response.raise_for_status()
        payload = response.json()

    return payload["choices"][0]["message"]["content"].strip()


async def generate_chat_reply(
    message: str,
    conversation_id: str | None,
    linkedin_analysis_id: str | None = None,
    github_analysis_id: str | None = None,
) -> tuple[str, str]:
    conv_id = conversation_id or f"chat-{uuid.uuid4().hex[:8]}"
    history = get_chat_history(conv_id)
    linkedin = get_linkedin_result(linkedin_analysis_id) if linkedin_analysis_id else None
    github = get_github_result(github_analysis_id) if github_analysis_id else None

    append_chat(conv_id, "user", message)

    try:
        reply = await _openai_reply(message, history, linkedin, github)
    except Exception:
        reply = None

    if not reply:
        reply = _rule_based_reply(message, linkedin, github)

    append_chat(conv_id, "bot", reply)
    return reply, conv_id
