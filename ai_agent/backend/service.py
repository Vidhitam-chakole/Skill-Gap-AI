import os
import re
import uuid

import httpx
from dotenv import load_dotenv

from .schemas import ChatMessageResponse

# Ensure environment variables are loaded
ROOT_ENV = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
BACKEND_ENV = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", ".env")


def _refresh_env() -> None:
    if os.path.exists(ROOT_ENV):
        load_dotenv(ROOT_ENV, override=True)
    if os.path.exists(BACKEND_ENV):
        load_dotenv(BACKEND_ENV, override=True)


_refresh_env()

GROQ_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()


def is_groq_configured() -> bool:
    _refresh_env()
    return bool(os.getenv("GROQ_API_KEY", "").strip())


def get_groq_model() -> str:
    _refresh_env()
    return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

# In-memory chat storage for conversation histories with Supabase integration
_conversations: dict[str, list[dict[str, str]]] = {}

try:
    from app.services.store import _supabase_chat_history, _supabase_append_chat
except Exception:
    _supabase_chat_history = lambda cid: []
    _supabase_append_chat = lambda cid, r, t: False


def get_history(conversation_id: str) -> list[dict[str, str]]:
    if conversation_id in _conversations and _conversations[conversation_id]:
        return _conversations[conversation_id]
    try:
        sb_history = _supabase_chat_history(conversation_id)
        if sb_history:
            _conversations[conversation_id] = sb_history
            return sb_history
    except Exception:
        pass
    return _conversations.get(conversation_id, [])


def append_message(conversation_id: str, role: str, text: str) -> None:
    if conversation_id not in _conversations:
        _conversations[conversation_id] = []
    _conversations[conversation_id].append({"role": role, "text": text})
    try:
        _supabase_append_chat(conversation_id, role, text)
    except Exception:
        pass


def _get_lang_name(l) -> str:
    if isinstance(l, dict):
        return l.get("name", "Code")
    return getattr(l, "name", "Code")


def _get_lang_pct(l) -> int:
    if isinstance(l, dict):
        return l.get("percentage", 0)
    return getattr(l, "percentage", 0)


def _build_contextual_reply(message: str, linkedin_result, github_result) -> str | None:
    lowered = message.lower()

    li_name = getattr(linkedin_result, "name", None) or (linkedin_result.get("name") if isinstance(linkedin_result, dict) else None)
    li_headline = getattr(linkedin_result, "headline", None) or (linkedin_result.get("headline") if isinstance(linkedin_result, dict) else None)
    li_score = getattr(linkedin_result, "overallScore", None) or (linkedin_result.get("overallScore") if isinstance(linkedin_result, dict) else None)
    li_strengths = getattr(linkedin_result, "strengths", []) or (linkedin_result.get("strengths") if isinstance(linkedin_result, dict) else [])
    li_gaps = getattr(linkedin_result, "skillGaps", []) or (linkedin_result.get("skillGaps") if isinstance(linkedin_result, dict) else [])

    gh_user = getattr(github_result, "username", None) or (github_result.get("username") if isinstance(github_result, dict) else None)
    gh_name = getattr(github_result, "name", None) or (github_result.get("name") if isinstance(github_result, dict) else None)
    gh_score = getattr(github_result, "overallScore", None) or (github_result.get("overallScore") if isinstance(github_result, dict) else None)
    gh_langs = getattr(github_result, "topLanguages", []) or (github_result.get("topLanguages") if isinstance(github_result, dict) else [])
    gh_stats = getattr(github_result, "stats", {}) or (github_result.get("stats") if isinstance(github_result, dict) else {})
    gh_gaps = getattr(github_result, "skillGaps", []) or (github_result.get("skillGaps") if isinstance(github_result, dict) else [])

    user_name = li_name or gh_name or "Developer"

    def get_gap_skill(g):
        return getattr(g, "skill", g.get("skill") if isinstance(g, dict) else str(g))

    def get_gap_rec(g):
        return getattr(g, "recommendation", g.get("recommendation") if isinstance(g, dict) else "")

    def get_gap_sev(g):
        return getattr(g, "severity", g.get("severity") if isinstance(g, dict) else "medium")

    # Intent 1: GitHub specific inquiry
    wants_gh = any(w in lowered for w in ("github", "repo", "commit", "repositories", "codebase", "pull request", "git"))
    wants_li = any(w in lowered for w in ("linkedin", "headline", "resume", "experience"))

    if wants_gh and not wants_li and github_result:
        lang_str = ", ".join(f"{_get_lang_name(l)} ({_get_lang_pct(l)}%)" for l in gh_langs[:3])
        primary_gap = get_gap_rec(gh_gaps[0]) if gh_gaps else "Add automated test coverage and documentation."
        repos_count = gh_stats.get("repos", 0)
        stars_count = gh_stats.get("stars", 0)
        return (
            f"GitHub Review for @{gh_user}: Overall developer score is {gh_score}/100 with {repos_count} public repos and {stars_count} stars. "
            f"Your primary stack is {lang_str}. "
            f"Top technical recommendation: {primary_gap}"
        )

    # Intent 2: LinkedIn specific inquiry
    if wants_li and not wants_gh and linkedin_result:
        top_str = ", ".join(str(s) for s in li_strengths[:3])
        top_gap = get_gap_skill(li_gaps[0]) if li_gaps else "System Design"
        top_rec = get_gap_rec(li_gaps[0]) if li_gaps else "Focus on scalable architecture patterns."
        return (
            f"LinkedIn Review for {li_name}: Target profile aligns with '{li_headline}' with a score of {li_score}/100. "
            f"Key strengths: {top_str}. "
            f"Primary skill gap to close is {top_gap}: {top_rec}"
        )

    # Intent 3: Comprehensive Review of both profiles
    if any(w in lowered for w in ("review", "summary", "analysis", "overall", "how am i", "overview", "score", "audit")):
        if linkedin_result and github_result:
            avg_score = round((li_score + gh_score) / 2)
            gh_lang_names = ", ".join(_get_lang_name(l) for l in gh_langs[:2])
            top_blocker = get_gap_skill(gh_gaps[0]) if gh_gaps else (get_gap_skill(li_gaps[0]) if li_gaps else "System Design")
            return (
                f"Combined Profile Review for {user_name}:\n"
                f"• Overall Career Score: {avg_score}/100 (LinkedIn: {li_score}, GitHub: {gh_score}).\n"
                f"• Strengths: Solid grounding in {', '.join(li_strengths[:2])} with active coding in {gh_lang_names}.\n"
                f"• Critical Skill Gap: {top_blocker}. Check your dynamic roadmap below to systematically close this gap."
            )
        elif linkedin_result:
            gap_msg = f"Top gap to address: {get_gap_skill(li_gaps[0])}." if li_gaps else "Profile verified with solid competencies."
            return (
                f"LinkedIn Review for {li_name} ({li_headline}): Score {li_score}/100. "
                f"Strengths: {', '.join(li_strengths[:3])}. {gap_msg}"
            )
        elif github_result:
            return (
                f"GitHub Review for @{gh_user}: Score {gh_score}/100 across {gh_stats.get('repos', 0)} repos. "
                f"Top gap: {get_gap_skill(gh_gaps[0])} - {get_gap_rec(gh_gaps[0])}"
            )

    # Intent 4: Roadmap & Next Steps
    if any(w in lowered for w in ("roadmap", "next", "what next", "week", "plan", "start", "guide", "learn", "schedule", "sprint")):
        high_gaps = [get_gap_skill(g) for g in (li_gaps + gh_gaps) if get_gap_sev(g) == "high"]
        lead_priority = high_gaps[0] if high_gaps else "Hands-on project development"
        return (
            f"For your next steps, {user_name}, begin Sprint 01 by tackling '{lead_priority}'. "
            f"Ship a working proof-of-concept repository, write unit tests, and document the architecture. "
            f"Refer to the dynamic roadmap section right above for your adaptive sprint milestones."
        )

    # Intent 5: Strengths inquiry
    if any(w in lowered for w in ("strength", "good at", "stand out", "positives")):
        all_strengths = list(li_strengths)
        if gh_langs:
            all_strengths.extend([f"Expertise in {_get_lang_name(l)}" for l in gh_langs[:2]])
        return (
            f"Based on your profile data, your standout strengths include: {', '.join(all_strengths[:4])}. "
            f"Highlight these prominently at the top of your resume and GitHub pinned repos."
        )

    # Intent 6: Specific high-demand skills
    if "system design" in lowered:
        return "System Design is a top market differentiator. Focus on: Load Balancing, Caching (Redis), SQL vs NoSQL trade-offs, Message Queues (Kafka/RabbitMQ), and API rate limiting."
    if "docker" in lowered or "container" in lowered or "kubernetes" in lowered:
        return "Containerization is crucial for production readiness. Build a multi-stage Dockerfile for one of your GitHub projects, create a docker-compose.yml file, and deploy it to a cloud VPS or container service."
    if "test" in lowered or "jest" in lowered or "vitest" in lowered or "pytest" in lowered:
        return "Automated testing boosts your GitHub profile credibility. Aim for at least 70% branch coverage on your core business logic and configure GitHub Actions to run tests automatically on every PR."
    if "salary" in lowered or "job" in lowered or "interview" in lowered:
        return "To maximize interview callbacks, align your GitHub projects with real-world business domains. Include architectural diagrams in your READMEs and be prepared to discuss trade-offs made in your code."

    return None


def _fallback_ai_reply(message: str) -> str:
    lowered = message.lower()
    if any(w in lowered for w in ("hello", "hi", "hey", "start")):
        return "Hello! I am your SkillGap Local AI Career Agent. I analyze your LinkedIn review, GitHub code activity, and dynamic roadmap to give you personalized career advice. What would you like to explore?"
    if any(w in lowered for w in ("help", "what can you do")):
        return "You can ask me to review your LinkedIn profile, evaluate your GitHub repositories, explain your dynamic roadmap, or guide you on mastering any specific skill gap!"
    return (
        "Focus on high-severity skill gaps first: ship one public, well-tested project this month that proves your "
        "competence in cloud, testing, or system design, then feature it prominently on LinkedIn and GitHub."
    )


async def _call_groq_if_configured(
    message: str,
    history: list[dict[str, str]],
    linkedin_result,
    github_result,
    api_key_override: str | None = None,
    model_override: str | None = None,
) -> tuple[str | None, str | None]:
    """Calls Groq API (GroqCloud OpenAI-compatible endpoint) if key is provided.
    Returns (reply_text, model_used) or (None, None).
    """
    _refresh_env()
    api_key = (
        api_key_override
        or os.getenv("GROQ_API_KEY", "")
    ).strip()

    if not api_key:
        return None, None

    model = (
        model_override
        or os.getenv("GROQ_MODEL", "")
        or GROQ_MODEL
        or "llama-3.3-70b-versatile"
    ).strip()

    # Build rich context from LinkedIn and GitHub analyses
    context_parts = []
    if linkedin_result:
        li_name = getattr(linkedin_result, "name", None) or (linkedin_result.get("name") if isinstance(linkedin_result, dict) else "User")
        li_headline = getattr(linkedin_result, "headline", None) or (linkedin_result.get("headline") if isinstance(linkedin_result, dict) else "")
        li_score = getattr(linkedin_result, "overallScore", 0) or (linkedin_result.get("overallScore") if isinstance(linkedin_result, dict) else 0)
        li_strengths = getattr(linkedin_result, "strengths", []) or (linkedin_result.get("strengths") if isinstance(linkedin_result, dict) else [])
        li_gaps = getattr(linkedin_result, "skillGaps", []) or (linkedin_result.get("skillGaps") if isinstance(linkedin_result, dict) else [])

        gaps_summary = []
        for g in li_gaps[:4]:
            skill = getattr(g, "skill", g.get("skill") if isinstance(g, dict) else str(g))
            rec = getattr(g, "recommendation", g.get("recommendation") if isinstance(g, dict) else "")
            gaps_summary.append(f"{skill} ({rec})" if rec else skill)

        context_parts.append(
            f"LinkedIn Analysis -> Candidate: {li_name}, Headline: '{li_headline}', Score: {li_score}/100. "
            f"Strengths: {', '.join(str(s) for s in li_strengths[:4])}. "
            f"Skill Gaps: {', '.join(gaps_summary)}."
        )

    if github_result:
        gh_user = getattr(github_result, "username", None) or (github_result.get("username") if isinstance(github_result, dict) else "Developer")
        gh_score = getattr(github_result, "overallScore", 0) or (github_result.get("overallScore") if isinstance(github_result, dict) else 0)
        gh_langs = getattr(github_result, "topLanguages", []) or (github_result.get("topLanguages") if isinstance(github_result, dict) else [])
        gh_stats = getattr(github_result, "stats", {}) or (github_result.get("stats") if isinstance(github_result, dict) else {})
        gh_gaps = getattr(github_result, "skillGaps", []) or (github_result.get("skillGaps") if isinstance(github_result, dict) else [])

        lang_str = ", ".join(f"{_get_lang_name(l)} ({_get_lang_pct(l)}%)" for l in gh_langs[:4])
        repos_count = gh_stats.get("repos", 0) if isinstance(gh_stats, dict) else 0
        stars_count = gh_stats.get("stars", 0) if isinstance(gh_stats, dict) else 0

        gh_gap_names = [getattr(g, "skill", g.get("skill") if isinstance(g, dict) else str(g)) for g in gh_gaps[:3]]
        context_parts.append(
            f"GitHub Analysis -> User: @{gh_user}, Score: {gh_score}/100, Repos: {repos_count}, Stars: {stars_count}. "
            f"Languages: {lang_str}. Identified Technical Gaps: {', '.join(gh_gap_names)}."
        )

    context_str = "\n".join(context_parts) if context_parts else "No specific profile analysis loaded yet."

    system_prompt = (
        "You are SkillGap AI Career Assistant, powered by Groq high-speed LPU inference. "
        "You are an expert technical career mentor, senior software architect, and technical interview coach.\n\n"
        f"Verified Candidate Context:\n{context_str}\n\n"
        "Guidelines:\n"
        "- Answer the candidate's questions clearly, accurately, and actionably.\n"
        "- When asked about profile reviews, skill gaps, or learning roadmaps, synthesize their verified analysis metrics.\n"
        "- When asked coding, technical, or interview questions, provide senior-level engineering explanations with code snippets where helpful.\n"
        "- Keep responses direct and engaging (under 180 words unless the user explicitly requests a detailed guide or complete code).\n"
        "- If the user asks common or predefined questions (e.g., 'Explain my dynamic roadmap', 'What are my LinkedIn strengths?'), provide an insightful, customized answer based on their profile."
    )

    messages = [{"role": "system", "content": system_prompt}]
    for item in history[-8:]:
        r = "assistant" if item.get("role") in ("bot", "assistant") else "user"
        messages.append({"role": r, "content": item.get("text", "")})
    messages.append({"role": "user", "content": message})

    models_to_try = [model]
    for fallback_model in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]:
        if fallback_model not in models_to_try:
            models_to_try.append(fallback_model)

    async with httpx.AsyncClient(timeout=25.0) as client:
        last_error = None
        for m in models_to_try:
            try:
                res = await client.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": m,
                        "messages": messages,
                        "temperature": 0.6,
                        "max_tokens": 1024,
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    if content:
                        return content.strip(), m
                elif res.status_code in (400, 404):
                    last_error = res.text
                    continue
                else:
                    res.raise_for_status()
            except Exception as e:
                last_error = e
                if isinstance(e, httpx.HTTPStatusError) and e.response.status_code == 401:
                    print(f"[Groq AI] Authentication error (401). Invalid GROQ_API_KEY: {e}")
                    return None, None
                continue

    if last_error:
        print(f"[Groq AI] Groq API notice: {last_error}")
    return None, None


async def _call_openai_if_configured(
    message: str,
    history: list[dict[str, str]],
    linkedin_result,
    github_result,
) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY", OPENAI_API_KEY).strip()
    if not api_key:
        return None

    context_str = ""
    if linkedin_result:
        li_name = getattr(linkedin_result, "name", "User")
        li_headline = getattr(linkedin_result, "headline", "")
        li_score = getattr(linkedin_result, "overallScore", 0)
        context_str += f"LinkedIn Review: {li_name}, Headline: {li_headline}, Score: {li_score}. "
    if github_result:
        gh_user = getattr(github_result, "username", "User")
        gh_score = getattr(github_result, "overallScore", 0)
        context_str += f"GitHub Review: @{gh_user}, Score: {gh_score}. "

    system_prompt = (
        "You are SkillGap Local AI Agent, an expert technical career mentor. "
        "Answer concisely (under 120 words), direct and actionable. "
        f"Context from profile analysis: {context_str}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for item in history[-6:]:
        r = "assistant" if item.get("role") == "bot" else "user"
        messages.append({"role": r, "content": item.get("text", "")})
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.6},
        )
        res.raise_for_status()
        data = res.json()
        return data["choices"][0]["message"]["content"].strip()


# Hook to look up analyses from parent store or cache
_analysis_resolver = None


def set_analysis_resolver(resolver_fn):
    global _analysis_resolver
    _analysis_resolver = resolver_fn


async def generate_agent_reply(
    message: str,
    conversation_id: str | None = None,
    linkedin_analysis_id: str | None = None,
    github_analysis_id: str | None = None,
    api_key: str | None = None,
    mode: str | None = None,
) -> tuple[str, str, dict]:
    conv_id = conversation_id or f"chat-{uuid.uuid4().hex[:8]}"
    history = get_history(conv_id)

    linkedin_result = None
    github_result = None
    if _analysis_resolver:
        linkedin_result, github_result = _analysis_resolver(linkedin_analysis_id, github_analysis_id)

    append_message(conv_id, "user", message)

    reply = None
    source = "predefined"
    model_used = None

    # If mode is not forced to 'predefined', try Groq API first
    if mode != "predefined":
        # 1. Try Groq AI (LPU inference)
        try:
            groq_reply, model_name = await _call_groq_if_configured(
                message=message,
                history=history,
                linkedin_result=linkedin_result,
                github_result=github_result,
                api_key_override=api_key,
            )
            if groq_reply:
                reply = groq_reply
                source = "groq"
                model_used = model_name
        except Exception as e:
            print(f"[ChatBot] Groq error, falling back to local engine: {e}")
            reply = None

        # 2. Try OpenAI as fallback if configured
        if not reply:
            try:
                reply = await _call_openai_if_configured(message, history, linkedin_result, github_result)
                if reply:
                    source = "openai"
                    model_used = "gpt-4o-mini"
            except Exception:
                reply = None

    # 3. Local intelligent contextual AI engine (Predefined Questions)
    if not reply:
        reply = _build_contextual_reply(message, linkedin_result, github_result)
        source = "predefined"
        model_used = "local-rules"

    # 4. Fallback predefined replies
    if not reply:
        reply = _fallback_ai_reply(message)
        source = "predefined"
        model_used = "local-rules"

    append_message(conv_id, "bot", reply)
    return reply, conv_id, {"source": source, "model": model_used}
