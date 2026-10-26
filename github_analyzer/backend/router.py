from fastapi import APIRouter, HTTPException, Query

from .schemas import GitHubAnalyzeRequest, GitHubResult, GitHubSearchUsersResponse
from .service import analyze_github_user, search_github_users

router = APIRouter(prefix="/github", tags=["github"])


@router.get("/search-users", response_model=GitHubSearchUsersResponse)
async def search_users(
    q: str = Query(..., min_length=1, description="GitHub username search query"),
    limit: int = Query(6, ge=1, le=15),
) -> GitHubSearchUsersResponse:
    try:
        users = await search_github_users(q, limit=limit)
        return GitHubSearchUsersResponse(users=users)
    except ValueError as exc:
        raise HTTPException(status_code=429 if "rate limit" in str(exc).lower() else 400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"User search failed: {exc}") from exc


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
