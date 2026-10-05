"""
Skill Verifier API Router
Exposes endpoints for quiz generation, language support, and authenticity submission.
"""

from fastapi import APIRouter, HTTPException

from skill_verifier.backend.schemas import (
    GenerateQuizRequest,
    GenerateQuizResponse,
    QuizEvaluationResult,
    SubmitQuizRequest,
)
from skill_verifier.backend.service import (
    evaluate_quiz,
    generate_quiz,
    get_quiz_result,
    get_supported_languages,
)

router = APIRouter(prefix="/skill-verifier", tags=["skill-verifier"])


@router.get("/languages")
async def list_languages() -> list[dict[str, str]]:
    """Return all supported test languages and categories."""
    return get_supported_languages()


@router.post("/generate", response_model=GenerateQuizResponse)
async def create_quiz(body: GenerateQuizRequest) -> GenerateQuizResponse:
    """Generate 10 technical questions targeted at the specified language."""
    try:
        return generate_quiz(body.language, body.githubAnalysisId)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate assessment: {exc}") from exc


@router.post("/submit", response_model=QuizEvaluationResult)
async def submit_assessment(body: SubmitQuizRequest) -> QuizEvaluationResult:
    """Evaluate submitted quiz answers and return AI code authenticity score."""
    try:
        return evaluate_quiz(body.quizId, body.answers, body.timeSpentSeconds or 0)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}") from exc


@router.get("/result/{quiz_id}", response_model=QuizEvaluationResult)
async def get_result(quiz_id: str) -> QuizEvaluationResult:
    """Retrieve saved evaluation result for a quiz."""
    result = get_quiz_result(quiz_id)
    if not result:
        raise HTTPException(status_code=404, detail="Assessment result not found")
    return result
