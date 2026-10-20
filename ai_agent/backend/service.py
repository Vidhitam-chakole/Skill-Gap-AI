import os
import re
import uuid

import httpx
from dotenv import dotenv_values, load_dotenv

from .schemas import ChatMessageResponse

from pathlib import Path

# Ensure environment variables are loaded from root .env or backend .env
ROOT_DIR = Path(__file__).resolve().parents[2]
ROOT_ENV = ROOT_DIR / ".env"
BACKEND_ENV = ROOT_DIR / "backend" / ".env"


def _refresh_env() -> None:
    for env_path in [ROOT_ENV, BACKEND_ENV]:
        if env_path.is_file():
            for k, v in dotenv_values(str(env_path)).items():
                if v and v.strip():
                    os.environ[k] = v.strip()


_refresh_env()

GROQ_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()


def is_groq_configured() -> bool:
    _refresh_env()
    key = os.getenv("GROQ_API_KEY", "").strip()
    return bool(key and key.lower() not in ("none", "false", "null", ""))


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
    lowered = message.lower().strip()
    clean = re.sub(r"[^\w\s]", "", lowered)

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

    # Predefined 1: Platform explanation ("How does SkillGap AI work?")
    if any(p in lowered for p in ("how does skillgap", "how does this work", "how it works", "what is skillgap", "about skillgap")):
        return (
            "SkillGap AI is an end-to-end engineering career intelligence platform:\n\n"
            "1. 📄 **LinkedIn Analyzer**: Extracts your profile credentials, benchmarks role qualifications, and identifies market skill gaps.\n"
            "2. 💻 **GitHub Analyzer**: Forensically inspects public repositories, code hygiene, top languages, and calculates your developer score.\n"
            "3. 🛡️ **Anti-AI Code Verifier**: Generates 10 dynamic, non-predefined diagnostic questions directly from your codebase to verify authentic comprehension.\n"
            "4. 🗺️ **Adaptive Roadmap**: Creates a customized 4-sprint execution plan targeting your high-priority skill gaps.\n"
            "5. ⚡ **AI Assistant**: Gives instant answers to predefined career questions, and uses Groq LPU inference for any custom engineering or coding queries."
        )

    # Predefined 2: System Design ("Why is System Design important?")
    if "system design" in lowered:
        return (
            "System Design is a primary differentiator between junior and senior engineers. It demonstrates your ability to make architectural trade-offs around scale, availability, and resilience.\n\n"
            "Key pillars to master:\n"
            "- **Load Balancing**: Nginx, Envoy, round-robin & weighted algorithms\n"
            "- **Caching**: Redis, Memcached, cache-aside, write-through, TTL invalidation\n"
            "- **Databases**: SQL vs NoSQL, B-Trees, sharding, read-replicas, and ACID transactions\n"
            "- **Message Queues**: Kafka, RabbitMQ for asynchronous event-driven decoupling\n"
            "- **Fault Tolerance**: Circuit breakers, retry backoff, and API rate limiting"
        )

    # Predefined 3: Market demand skills ("What skills have highest market demand?")
    if any(p in lowered for p in ("market demand", "highest demand", "trending skills", "top skills", "highest market demand")):
        return (
            "Highest-demand engineering competencies in current tech hiring:\n\n"
            "1. **Cloud Native & Containers**: Docker multi-stage builds, Kubernetes pod orchestration, Terraform IaC\n"
            "2. **Distributed Backend Systems**: High-throughput REST & gRPC APIs, concurrent services in Go/Python/Node\n"
            "3. **Database Architecture & Caching**: PostgreSQL schema optimization, query indexing, Redis caching layers\n"
            "4. **AI & LLM Integration**: Vector search (pgvector), RAG pipelines, fast model inference (Groq/Ollama)\n"
            "5. **Production Quality**: Automated unit & integration testing (70%+ coverage) and CI/CD GitHub Actions"
        )

    # Predefined 4: Improve GitHub score ("How can I improve my GitHub score?")
    if ("improve" in lowered or "boost" in lowered or "increase" in lowered) and ("github" in lowered or "score" in lowered):
        return (
            "To boost your GitHub developer score:\n\n"
            "1. **Architecture Documentation**: Include high-level diagrams, setup steps, and environment config in every repo README.\n"
            "2. **Automated Testing**: Add unit and integration tests (aim for 70%+ branch coverage with pytest, vitest, or jest).\n"
            "3. **Continuous Integration**: Configure GitHub Actions to automatically run tests and linters on each pull request.\n"
            "4. **Commit Hygiene**: Commit frequently with clear conventional commit messages (`feat:`, `fix:`, `refactor:`).\n"
            "5. **Security & Cleanliness**: Add proper `.gitignore`, license, and never commit secrets or vendor folders."
        )

    # Predefined 5: Code Verifier ("What is the Code Verifier?")
    if any(p in lowered for p in ("verifier", "code verification", "authenticity test", "anti-ai")):
        return (
            "The **Anti-AI Code Verifier** generates a 10-question diagnostic assessment built dynamically on the fly based directly on your GitHub codebase and claimed skills.\n\n"
            "Unlike static quizzes, tests include:\n"
            "- Execution path and return value deduction\n"
            "- Concurrency & asynchronous order gotchas\n"
            "- Framework-specific anti-patterns and memory leaks\n"
            "- Edge-case boundary challenges"
        )

    # Predefined 6: GitHub specific review ("How is my GitHub profile?")
    wants_gh = any(w in lowered for w in ("github", "repo", "commit", "repositories", "codebase", "pull request", "git score"))
    wants_li = any(w in lowered for w in ("linkedin", "headline", "resume"))

    if wants_gh and not wants_li:
        if github_result:
            lang_str = ", ".join(f"{_get_lang_name(l)} ({_get_lang_pct(l)}%)" for l in gh_langs[:3])
            primary_gap = get_gap_rec(gh_gaps[0]) if gh_gaps else "Add automated test coverage and documentation."
            repos_count = gh_stats.get("repos", 0)
            stars_count = gh_stats.get("stars", 0)
            return (
                f"GitHub Review for @{gh_user}: Overall developer score is {gh_score}/100 across {repos_count} public repos and {stars_count} stars.\n\n"
                f"- **Primary Stack**: {lang_str}\n"
                f"- **Technical Recommendation**: {primary_gap}\n"
                f"- **Code Verification**: Scroll up to test your code authenticity with the 10Q Verifier."
            )
        else:
            return "To review your GitHub profile, please enter your GitHub username in the GitHub Analyzer section above! Once scanned, I'll audit your repository code quality, commit hygiene, top languages, and calculate your developer score."

    # Predefined 7: LinkedIn specific review ("What are my LinkedIn strengths?")
    if wants_li and not wants_gh:
        if linkedin_result:
            top_str = ", ".join(str(s) for s in li_strengths[:3])
            top_gap = get_gap_skill(li_gaps[0]) if li_gaps else "System Design"
            top_rec = get_gap_rec(li_gaps[0]) if li_gaps else "Focus on scalable architecture patterns."
            return (
                f"LinkedIn Review for {li_name}: Target profile aligns with '{li_headline}' with a score of {li_score}/100.\n\n"
                f"- **Verified Strengths**: {top_str}\n"
                f"- **Priority Skill Gap**: {top_gap} — {top_rec}"
            )
        else:
            return "To review your LinkedIn profile, please upload your profile PDF in the LinkedIn Analyzer section above! I'll extract your qualifications, detect high-priority skill gaps, and compute your readiness score."

    # Predefined 8: Comprehensive Review ("Review my overall profile")
    if any(w in lowered for w in ("review", "summary", "analysis", "overall", "how am i", "overview", "audit", "career score")):
        if linkedin_result and github_result:
            avg_score = round((li_score + gh_score) / 2)
            gh_lang_names = ", ".join(_get_lang_name(l) for l in gh_langs[:2])
            top_blocker = get_gap_skill(gh_gaps[0]) if gh_gaps else (get_gap_skill(li_gaps[0]) if li_gaps else "System Design")
            return (
                f"Combined Profile Review for {user_name}:\n\n"
                f"- **Overall Career Score**: {avg_score}/100 (LinkedIn: {li_score}, GitHub: {gh_score})\n"
                f"- **Key Strengths**: Solid grounding in {', '.join(li_strengths[:2])} with active coding in {gh_lang_names}\n"
                f"- **Critical Skill Gap**: {top_blocker}\n"
                f"- **Next Action**: Check your dynamic roadmap below to systematically close this gap."
            )
        elif linkedin_result:
            gap_msg = f"Top gap to address: {get_gap_skill(li_gaps[0])}." if li_gaps else "Profile verified with solid competencies."
            return f"LinkedIn Review for {li_name} ({li_headline}): Score {li_score}/100. Strengths: {', '.join(li_strengths[:3])}. {gap_msg}"
        elif github_result:
            return f"GitHub Review for @{gh_user}: Score {gh_score}/100 across {gh_stats.get('repos', 0)} repos. Top gap: {get_gap_skill(gh_gaps[0])} - {get_gap_rec(gh_gaps[0])}"
        else:
            return "You haven't run an analysis yet! Run either the LinkedIn or GitHub scan above, and I'll immediately generate a unified forensic career review and customized gap report."

    # Predefined 9: Roadmap & Next Steps ("Explain my dynamic roadmap" / "What should I build first?")
    if any(w in lowered for w in ("roadmap", "what next", "what should i build", "build first", "week 1", "sprint", "learning path", "next step", "plan")):
        high_gaps = [get_gap_skill(g) for g in (li_gaps + gh_gaps) if get_gap_sev(g) == "high"]
        lead_priority = high_gaps[0] if high_gaps else "Hands-on cloud & testing architecture"
        return (
            f"For your next steps, {user_name}, begin Sprint 01 by tackling '{lead_priority}':\n\n"
            f"- Build a working proof-of-concept repository addressing this gap.\n"
            f"- Write automated unit & integration tests with GitHub Actions CI.\n"
            f"- Check the dynamic roadmap section right above for your complete 4-sprint milestone plan."
        )

    # Predefined 10: Strengths inquiry
    if any(w in lowered for w in ("strength", "good at", "stand out", "positives")):
        all_strengths = list(li_strengths)
        if gh_langs:
            all_strengths.extend([f"Active codebase in {_get_lang_name(l)}" for l in gh_langs[:2]])
        if all_strengths:
            return f"Based on your profile data, your standout strengths include: {', '.join(all_strengths[:4])}. Highlight these prominently at the top of your resume and GitHub pinned repos."
        return "Analyze your LinkedIn or GitHub profile above to extract and verify your core engineering strengths!"

    # Predefined 11: Greetings & Help
    greeting_words = {"hello", "hi", "hey", "hola", "greetings"}
    clean_words = set(clean.split())
    if clean_words and clean_words.issubset(greeting_words | {"there", "skillgap", "ai", "bot"}):
        return "Hey! I'm your SkillGap AI Career Assistant. Click any of the predefined questions below for instant insights into your profile, or ask any custom coding, system design, or engineering question and I'll answer it with Groq AI!"

    if clean in ("help", "what can you do", "commands", "menu"):
        return "I can help you review your LinkedIn profile, audit your GitHub code activity, explain your personalized roadmap, or answer any custom engineering, coding, or career question with Groq AI!"

    # If it does not match any predefined question/topic, return None so Groq API handles it!
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

    # 1. First, check if the question matches a predefined question or topic
    predefined_reply = _build_contextual_reply(message, linkedin_result, github_result)
    if predefined_reply:
        reply = predefined_reply
        source = "predefined"
        model_used = "predefined-intelligence"
    else:
        # 2. Other questions than predefined -> Use Groq API (LPU inference)
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
            print(f"[ChatBot] Groq error on custom query: {e}")
            reply = None

        # 3. Fallback to OpenAI if configured
        if not reply:
            try:
                reply = await _call_openai_if_configured(message, history, linkedin_result, github_result)
                if reply:
                    source = "openai"
                    model_used = "gpt-4o-mini"
            except Exception:
                reply = None

        # 4. If no external API answered the custom question, guide the user cleanly
        if not reply:
            reply = (
                "I can answer predefined questions and profile reviews right away! "
                "For custom open-ended questions, please ensure your GROQ_API_KEY is configured in your server environment variables or .env file."
            )
            source = "ai-prompt"
            model_used = "info"

    append_message(conv_id, "bot", reply)
    return reply, conv_id, {"source": source, "model": model_used}
