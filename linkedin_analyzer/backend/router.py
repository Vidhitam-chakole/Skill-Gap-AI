from fastapi import APIRouter, HTTPException

from .schemas import LinkedInAnalyzeRequest, LinkedInResult
from .service import analyze_linkedin_profile

router = APIRouter(prefix="/linkedin", tags=["linkedin"])

# In-memory store for LinkedIn results within module (with sync hook to global store)
_linkedin_cache: dict[str, LinkedInResult] = {}


def get_cached_linkedin_result(analysis_id: str) -> LinkedInResult | None:
    return _linkedin_cache.get(analysis_id)


def cache_linkedin_result(result: LinkedInResult) -> None:
    _linkedin_cache[result.analysisId] = result


@router.post("/analyze", response_model=LinkedInResult)
async def analyze_profile(body: LinkedInAnalyzeRequest) -> LinkedInResult:
    try:
        result = analyze_linkedin_profile(body.profileUrl)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    cache_linkedin_result(result)
    return result


@router.get("/results/{analysis_id}", response_model=LinkedInResult)
async def get_results(analysis_id: str) -> LinkedInResult:
    result = get_cached_linkedin_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="LinkedIn analysis not found.")
    return result
