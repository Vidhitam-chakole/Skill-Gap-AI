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

from skill_verifier.backend.question_bank import QUESTION_BANK, get_questions_for_language
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
        {"id": "c", "name": "C Programming", "category": "Systems & Embedded"},
        {"id": "python", "name": "Python", "category": "Backend & AI/ML"},
        {"id": "javascript", "name": "JavaScript", "category": "Frontend & Full Stack"},
        {"id": "cpp", "name": "C++", "category": "Systems & Performance"},
        {"id": "typescript", "name": "TypeScript", "category": "Full Stack Architecture"},
        {"id": "java", "name": "Java", "category": "Enterprise Backend"},
    ]


def generate_quiz(language: str, github_analysis_id: Optional[str] = None) -> GenerateQuizResponse:
    """
    Generates 10 targeted questions for the specified language.
    Checks GitHub analysis context if available to identify claimed languages.
    """
    detected_languages: list[str] = []

    if github_analysis_id and _github_resolver:
        try:
            gh_data = _github_resolver(github_analysis_id)
            if gh_data:
                # Extract top languages
                top_langs = getattr(gh_data, "topLanguages", []) or gh_data.get("topLanguages", [])
                for item in top_langs:
                    name = getattr(item, "name", None) or (item.get("name") if isinstance(item, dict) else None)
                    if name:
                        detected_languages.append(name)
        except Exception:
            pass

    # Fetch 10 questions for the language
    raw_questions = get_questions_for_language(language, count=10)

    quiz_id = str(uuid.uuid4())
    internal_questions: list[QuizQuestionInternal] = []
    public_questions: list[QuizQuestionPublic] = []

    for i, raw in enumerate(raw_questions, start=1):
        options = [QuizOption(id=opt_idx, text=opt_text) for opt_idx, opt_text in enumerate(raw["options"])]

        pub = QuizQuestionPublic(
            id=i,
            language=language,
            difficulty=raw["difficulty"],
            concept=raw["concept"],
            question=raw["question"],
            codeSnippet=raw.get("codeSnippet"),
            options=options,
        )
        public_questions.append(pub)

        internal = QuizQuestionInternal(
            **pub.model_dump(),
            correctIndex=raw["correctIndex"],
            explanation=raw["explanation"],
        )
        internal_questions.append(internal)

    _active_quizzes[quiz_id] = internal_questions

    # Persist session to disk
    cached = _load_json(_QUIZ_CACHE_FILE)
    cached[quiz_id] = [q.model_dump() for q in internal_questions]
    _save_json(_QUIZ_CACHE_FILE, cached)

    return GenerateQuizResponse(
        quizId=quiz_id,
        language=language,
        totalQuestions=len(public_questions),
        questions=public_questions,
        detectedLanguages=detected_languages,
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

    # Forensic Authenticity Status
    if percentage >= 80:
        authenticity_status = "VERIFIED_AUTHENTIC"
        authenticity_label = "Verified Human Mastery"
        badge = f"Verified {language} Engineer"
        summary = (
            f"Strong human intuition confirmed! Your score of {score}/{total} ({percentage}%) demonstrates "
            f"genuine grasp of {language} core mechanics (memory layout, execution semantics, and edge cases). "
            f"Your GitHub repositories reflect authentic technical competence."
        )
        insight = (
            "You passed the edge-case and sequence-point traps that AI code generators output blindly. "
            "You demonstrated real debugging intuition that cannot be faked via copy-pasting."
        )
        recommendations = [
            f"Your {language} knowledge is solid. Highlight this verified badge on your resume and LinkedIn profile.",
            "Consider contributing to open-source systems libraries or writing technical deep-dives.",
            "Focus on advanced concurrency and distributed systems to reach senior level.",
        ]
    elif percentage >= 50:
        authenticity_status = "LIKELY_AI_AUGMENTED"
        authenticity_label = "AI-Augmented / Emerging Knowledge"
        badge = f"Developing {language} Practitioner"
        summary = (
            f"Partial competence detected. Score: {score}/{total} ({percentage}%). While you recognize standard syntax, "
            f"critical gaps in underlying mechanics (pointers, lifetime, sequence points, or memory hazards) suggest you "
            f"may rely heavily on AI to write your {language} code without fully understanding what the compiler does."
        )
        insight = (
            "AI tools easily generate working boilerplate, but when bugs arise in memory management or scope, "
            "developers with this score profile struggle in live technical interviews."
        )
        recommendations = [
            f"Review the failed questions below, specifically focusing on {', '.join(k for k, v in concept_stats.items() if v['correct'] < v['total'])}.",
            f"Build a small, standalone project in {language} from scratch WITHOUT using ChatGPT or Copilot.",
            "Use debugging tools like GDB, Valgrind, or AddressSanitizer to inspect memory directly.",
        ]
    else:
        authenticity_status = "UNVERIFIED_SUSPECT_AI"
        authenticity_label = "Suspect AI-Generated Code / Skill Gap Detected"
        badge = f"Unverified {language} Profile"
        summary = (
            f"Significant gap identified! Score: {score}/{total} ({percentage}%). Although your GitHub profile reports "
            f"{language} as a primary language, your answers reveal critical gaps in fundamental mechanics. "
            f"This strongly indicates that the code on your GitHub was generated by AI or copied without conceptual understanding."
        )
        insight = (
            "Modern recruiters and technical interviewers instantly spot this mismatch: repos look impressive on GitHub, "
            "but the candidate cannot explain pointer arithmetic, stack frames, or object lifecycles."
        )
        recommendations = [
            f"Do not claim {language} as a 'Strong Language' in technical interviews until core fundamentals are mastered.",
            "Dedicate 2 weeks to studying memory hierarchy, compiler phases, and foundational data structures.",
            "Practice writing code manually on a whiteboard or plain text editor without AI auto-complete.",
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

    # Persist results
    cached_res = _load_json(_RESULT_CACHE_FILE)
    cached_res[quiz_id] = result.model_dump()
    _save_json(_RESULT_CACHE_FILE, cached_res)

    return result


def get_quiz_result(quiz_id: str) -> Optional[QuizEvaluationResult]:
    """Retrieve previously saved quiz evaluation result."""
    if quiz_id in _saved_results:
        return _saved_results[quiz_id]
    cached = _load_json(_RESULT_CACHE_FILE)
    raw = cached.get(quiz_id)
    if raw:
        res = QuizEvaluationResult.model_validate(raw)
        _saved_results[quiz_id] = res
        return res
    return None
