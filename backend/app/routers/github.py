from fastapi import APIRouter, HTTPException

from app.schemas import GitHubAnalyzeRequest, GitHubResult
from app.services.github_service import analyze_github_user
from app.services.store import get_github_result, save_github_result

router = APIRouter(prefix="/github", tags=["github"])


@router.post("/analyze", response_model=GitHubResult)
async def analyze_profile(body: GitHubAnalyzeRequest) -> GitHubResult:
    try:
        result = await analyze_github_user(body.username)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"GitHub analysis failed: {exc}") from exc

    save_github_result(result)
    return result


@router.get("/results/{analysis_id}", response_model=GitHubResult)
async def get_results(analysis_id: str) -> GitHubResult:
    result = get_github_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
