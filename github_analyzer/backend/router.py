from fastapi import APIRouter, HTTPException

from .schemas import GitHubAnalyzeRequest, GitHubResult
from .service import analyze_github_user

router = APIRouter(prefix="/github", tags=["github"])

_github_cache: dict[str, GitHubResult] = {}


def get_cached_github_result(analysis_id: str) -> GitHubResult | None:
    return _github_cache.get(analysis_id)


def cache_github_result(result: GitHubResult) -> None:
    _github_cache[result.analysisId] = result


@router.post("/analyze", response_model=GitHubResult)
async def analyze_user(body: GitHubAnalyzeRequest) -> GitHubResult:
    try:
        result = await analyze_github_user(body.username)
    except ValueError as exc:
        raise HTTPException(status_code=404 if "not found" in str(exc).lower() else 400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"GitHub connection failed: {exc}") from exc

    cache_github_result(result)
    return result


@router.get("/results/{analysis_id}", response_model=GitHubResult)
async def get_results(analysis_id: str) -> GitHubResult:
    result = get_cached_github_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="GitHub analysis not found.")
    return result
