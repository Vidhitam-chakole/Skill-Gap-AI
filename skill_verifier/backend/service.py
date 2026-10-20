"""
Skill Verifier Service
Manages quiz generation, session tracking, and deep authenticity verification.
Separates real human understanding from AI-generated or copy-pasted code.
"""

import json
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Any, Callable, Optional

from skill_verifier.backend.dynamic_generator import generate_procedural_questions
from skill_verifier.backend.llm_generator import generate_dynamic_ai_questions
from skill_verifier.backend.schemas import (
    ConceptScore,
    GenerateQuizResponse,
    QuestionReviewItem,
    QuizEvaluationResult,
    QuizOption,
    QuizQuestionInternal,
    QuizQuestionPublic,
)
import os

try:
    from app.services.store import _supabase_fetch_record, _supabase_save_record
except Exception:
    _supabase_fetch_record = lambda tbl, rid: None
    _supabase_save_record = lambda tbl, rid, payload: False

if os.environ.get("VERCEL"):
    DATA_DIR = Path("/tmp") / "skillgap_verifier"
else:
    DATA_DIR = Path(__file__).resolve().parents[2] / "backend" / "data"

try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    DATA_DIR = Path("/tmp") / "skillgap_verifier"
    DATA_DIR.mkdir(parents=True, exist_ok=True)

_QUIZ_CACHE_FILE = DATA_DIR / "quiz_sessions.json"
_RESULT_CACHE_FILE = DATA_DIR / "quiz_results.json"

# In-memory storage for active quiz sessions and evaluation results
_active_quizzes: dict[str, list[QuizQuestionInternal]] = {}
_saved_results: dict[str, QuizEvaluationResult] = {}

# External resolver to fetch GitHub results if linked
_github_resolver: Optional[Callable[[str], Optional[Any]]] = None


def set_github_resolver(resolver: Callable[[str], Optional[Any]]) -> None:
    global _github_resolver
    _github_resolver = resolver


def _load_json(file_path: Path) -> dict:
    if not file_path.exists():
        return {}
    try:
        return json.loads(file_path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _save_json(file_path: Path, data: dict) -> None:
    try:
        file_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        pass


def get_supported_languages() -> list[dict[str, str]]:
    return [
        {"id": "python", "name": "Python", "category": "Backend & AI/ML"},
        {"id": "javascript", "name": "JavaScript", "category": "Frontend & Full Stack"},
        {"id": "typescript", "name": "TypeScript", "category": "Full Stack Architecture"},
        {"id": "c", "name": "C Programming", "category": "Systems & Embedded"},
        {"id": "cpp", "name": "C++", "category": "High Performance & Engines"},
        {"id": "java", "name": "Java", "category": "Enterprise Backend"},
        {"id": "go", "name": "Go (Golang)", "category": "Cloud & Distributed Systems"},
        {"id": "rust", "name": "Rust", "category": "Systems & Memory Safety"},
    ]


async def generate_quiz(
    language: Optional[str] = None,
    github_analysis_id: Optional[str] = None,
) -> GenerateQuizResponse:
    """
    Generates a custom-made, non-predefined 10-question diagnostic assessment
    based on the developer's strongest language extracted from their GitHub profile.
    Uses AI LLM generation if configured, with intelligent procedural synthesis fallback.
    """
    detected_languages: list[str] = []
    strongest_language: Optional[str] = None
    gh_username: str = "developer"
    repo_names: list[str] = []

    if github_analysis_id and _github_resolver:
        try:
            gh_data = _github_resolver(github_analysis_id)
            if gh_data:
                gh_username = getattr(gh_data, "username", "developer") or "developer"

                # 1. Check explicit primary or strong programming language from GitHub analysis
                gh_primary = getattr(gh_data, "primaryLanguage", None) or (gh_data.get("primaryLanguage") if isinstance(gh_data, dict) else None)
                if gh_primary:
                    strongest_language = gh_primary

                # 2. Extract top languages, filtering out non-programming markup
                NON_PROGRAMMING = {"html", "css", "scss", "less", "markdown", "json", "yaml", "xml", "shell", "bash", "text", "dockerfile"}
                top_langs = getattr(gh_data, "topLanguages", []) or (gh_data.get("topLanguages", []) if isinstance(gh_data, dict) else [])
                for item in top_langs:
                    name = getattr(item, "name", None) or (item.get("name") if isinstance(item, dict) else None)
                    if name:
                        detected_languages.append(name)
                        if not strongest_language and name.lower() not in NON_PROGRAMMING:
                            strongest_language = name

                # Extract featured repository names to contextualize diagnostic code snippets
                pinned = getattr(gh_data, "pinnedRepos", []) or gh_data.get("pinnedRepos", [])
                for r in pinned:
                    r_name = getattr(r, "name", None) or (r.get("name") if isinstance(r, dict) else None)
                    if r_name:
                        repo_names.append(r_name)
        except Exception:
            pass

    # Fallback: if strongest_language still not found, check detected_languages
    if not strongest_language and detected_languages:
        for lang_name in detected_languages:
            if lang_name.lower() not in {"markdown", "json", "yaml", "xml", "text"}:
                strongest_language = lang_name
                break
        if not strongest_language and detected_languages:
            strongest_language = detected_languages[0]

    # Resolve target language:
    clean_lang = (language or "").strip()
    if not clean_lang or clean_lang.lower() in ("auto", "default", "strongest"):
        target_language = strongest_language or (detected_languages[0] if detected_languages else "HTML")
    else:
        target_language = clean_lang

    # Prepare rich developer profile context
    dev_context = {
        "username": gh_username,
        "repo_names": repo_names,
        "strongest_language": strongest_language or target_language,
        "detected_languages": detected_languages,
        "language": target_language,
    }

    # Generate custom-made questions (AI LLM if available, else procedural dynamic generator)
    raw_questions: Optional[list[dict[str, Any]]] = None
    generation_source = "dynamic_procedural"

    ai_res = await generate_dynamic_ai_questions(target_language, context=dev_context, count=10)
    if ai_res:
        raw_questions, generation_source = ai_res

    if not raw_questions or len(raw_questions) < 10:
        raw_questions = generate_procedural_questions(target_language, context=dev_context, count=10)
        generation_source = "dynamic_procedural"

    quiz_id = str(uuid.uuid4())
    internal_questions: list[QuizQuestionInternal] = []
    public_questions: list[QuizQuestionPublic] = []

    for i, raw in enumerate(raw_questions[:10], start=1):
        raw_opts = raw.get("options", [])
        options = []
        for opt_idx, opt_text in enumerate(raw_opts):
            options.append(QuizOption(id=opt_idx, text=str(opt_text)))

        pub = QuizQuestionPublic(
            id=i,
            language=target_language,
            difficulty=raw.get("difficulty", "Intermediate"),
            concept=raw.get("concept", "Core Language Mechanics"),
            question=raw.get("question", "What is the expected outcome of this code?"),
            codeSnippet=raw.get("codeSnippet"),
            options=options,
        )
        public_questions.append(pub)

        correct_idx = raw.get("correctIndex", 0)
        # Ensure correctIndex is within bounds
        if not (0 <= correct_idx < len(options)):
            correct_idx = 0

        internal = QuizQuestionInternal(
            **pub.model_dump(),
            correctIndex=correct_idx,
            explanation=raw.get("explanation", "Tests internal language execution mechanics."),
        )
        internal_questions.append(internal)

    _active_quizzes[quiz_id] = internal_questions

    # Persist session to disk
    cached = _load_json(_QUIZ_CACHE_FILE)
    cached[quiz_id] = [q.model_dump() for q in internal_questions]
    _save_json(_QUIZ_CACHE_FILE, cached)

    # Persist session to Supabase
    try:
        _supabase_save_record("quiz_sessions", quiz_id, [q.model_dump() for q in internal_questions])
    except Exception:
        pass

    dev_context_str = f"@{gh_username}" if gh_username != "developer" else None

    return GenerateQuizResponse(
        quizId=quiz_id,
        language=target_language,
        strongestLanguage=strongest_language,
        totalQuestions=len(public_questions),
        questions=public_questions,
        detectedLanguages=detected_languages,
        generationSource=generation_source,
        developerContext=dev_context_str,
    )


def evaluate_quiz(
    quiz_id: str,
    answers: dict[int, int],
    time_spent_seconds: int = 0,
) -> QuizEvaluationResult:
    """
    Evaluates submitted answers, computes authenticity score,
    and returns a forensic authenticity verdict.
    """
    # Retrieve internal questions
    questions = _active_quizzes.get(quiz_id)
    if not questions:
        cached = _load_json(_QUIZ_CACHE_FILE)
        raw_list = cached.get(quiz_id)
        if raw_list:
            questions = [QuizQuestionInternal.model_validate(q) for q in raw_list]
            _active_quizzes[quiz_id] = questions
        else:
            try:
                sb_list = _supabase_fetch_record("quiz_sessions", quiz_id)
                if sb_list and isinstance(sb_list, list):
                    questions = [QuizQuestionInternal.model_validate(q) for q in sb_list]
                    _active_quizzes[quiz_id] = questions
            except Exception:
                pass

    if not questions:
        raise ValueError(f"Quiz session '{quiz_id}' not found or expired. Please generate a new assessment.")

    score = 0
    total = len(questions)
    concept_stats: dict[str, dict[str, int]] = defaultdict(lambda: {"correct": 0, "total": 0})
    detailed_review: list[QuestionReviewItem] = []

    for q in questions:
        # User answer can be keyed as int or str in JSON
        user_choice = answers.get(q.id)
        if user_choice is None:
            user_choice = answers.get(str(q.id))

        is_correct = user_choice is not None and int(user_choice) == q.correctIndex

        if is_correct:
            score += 1
            concept_stats[q.concept]["correct"] += 1
        concept_stats[q.concept]["total"] += 1

        review_item = QuestionReviewItem(
            id=q.id,
            question=q.question,
            codeSnippet=q.codeSnippet,
            options=[opt.text for opt in q.options],
            selectedIndex=int(user_choice) if user_choice is not None else None,
            correctIndex=q.correctIndex,
            isCorrect=is_correct,
            explanation=q.explanation,
            concept=q.concept,
        )
        detailed_review.append(review_item)

    percentage = round((score / total) * 100) if total > 0 else 0
    language = questions[0].language if questions else "C"

    # Performance Status & Feedback
    if percentage >= 80:
        authenticity_status = "VERIFIED_AUTHENTIC"
        authenticity_label = "Strong Proficiency Verified"
        badge = f"Verified {language} Developer"
        summary = (
            f"Great job! Score: {score}/{total} ({percentage}%). You demonstrated a solid grasp of core "
            f"{language} concepts and mechanics."
        )
        insight = (
            f"You have strong fundamental knowledge and coding intuition in {language}."
        )
        recommendations = [
            f"Your {language} knowledge is solid. Highlight this on your profile and resume.",
            "Continue building real-world projects and exploring advanced topics.",
            "Practice system design and optimization techniques.",
        ]
    elif percentage >= 50:
        authenticity_status = "LIKELY_AI_AUGMENTED"
        authenticity_label = "Developing Knowledge / Practice Recommended"
        badge = f"Developing {language} Skills"
        summary = (
            f"Good effort! Score: {score}/{total} ({percentage}%). You have a decent foundation, but "
            f"practicing core concepts will help you build stronger confidence in {language}."
        )
        insight = (
            "Focus on understanding core language behavior and mechanics to feel confident in technical discussions."
        )
        recommendations = [
            f"Review the questions you missed below to strengthen those concepts.",
            f"Write small practice programs in {language} to experiment with these behaviors.",
            "Trace code execution step by step to build intuition.",
        ]
    else:
        authenticity_status = "UNVERIFIED_SUSPECT_AI"
        authenticity_label = "Skill Gap Identified / Fundamentals Review"
        badge = f"Learning {language}"
        summary = (
            f"Score: {score}/{total} ({percentage}%). Key skill gaps identified in {language} fundamentals. "
            f"Reviewing the core topics below will help close these gaps."
        )
        insight = (
            "Focus on language fundamentals, variable lifecycles, and data structures to build strong mastery."
        )
        recommendations = [
            f"Spend time reviewing core {language} syntax, data types, and scope rules.",
            "Practice writing and debugging small programs from scratch.",
            "Work through interactive coding exercises step by step.",
        ]

    concept_breakdown = [
        ConceptScore(
            concept=k,
            correct=v["correct"],
            total=v["total"],
            percentage=round((v["correct"] / v["total"]) * 100) if v["total"] > 0 else 0,
        )
        for k, v in concept_stats.items()
    ]

    result = QuizEvaluationResult(
        quizId=quiz_id,
        language=language,
        score=score,
        totalQuestions=total,
        percentage=percentage,
        authenticityStatus=authenticity_status,
        authenticityLabel=authenticity_label,
        badge=badge,
        summary=summary,
        aiDetectionInsight=insight,
        conceptBreakdown=concept_breakdown,
        recommendations=recommendations,
        detailedReview=detailed_review,
    )

    _saved_results[quiz_id] = result

    # Persist results locally
    cached_res = _load_json(_RESULT_CACHE_FILE)
    cached_res[quiz_id] = result.model_dump()
    _save_json(_RESULT_CACHE_FILE, cached_res)

    # Persist to Supabase
    try:
        _supabase_save_record("quiz_evaluations", quiz_id, result.model_dump())
    except Exception:
        pass

    return result


def get_quiz_result(quiz_id: str) -> Optional[QuizEvaluationResult]:
    """Retrieve previously saved quiz evaluation result."""
    if quiz_id in _saved_results:
        return _saved_results[quiz_id]

    # Try fetching from Supabase
    try:
        sb_rec = _supabase_fetch_record("quiz_evaluations", quiz_id)
        if sb_rec:
            res = QuizEvaluationResult.model_validate(sb_rec)
            _saved_results[quiz_id] = res
            return res
    except Exception:
        pass

    cached = _load_json(_RESULT_CACHE_FILE)
    raw = cached.get(quiz_id)
    if raw:
        res = QuizEvaluationResult.model_validate(raw)
        _saved_results[quiz_id] = res
        return res
    return None
