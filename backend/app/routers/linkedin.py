from fastapi import APIRouter, HTTPException

from app.schemas import LinkedInAnalyzeRequest, LinkedInResult
from app.services.linkedin_service import analyze_linkedin_profile
from app.services.store import get_linkedin_result, save_linkedin_result

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


@router.post("/analyze", response_model=LinkedInResult)
async def analyze_profile(body: LinkedInAnalyzeRequest) -> LinkedInResult:
    try:
        result = analyze_linkedin_profile(body.profileUrl)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    save_linkedin_result(result)
    return result


@router.get("/results/{analysis_id}", response_model=LinkedInResult)
async def get_results(analysis_id: str) -> LinkedInResult:
    result = get_linkedin_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
