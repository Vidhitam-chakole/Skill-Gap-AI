from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .schemas import LinkedInAnalyzeRequest, LinkedInResult
from .service import analyze_linkedin_pdf, analyze_linkedin_profile

router = APIRouter(prefix="/linkedin", tags=["linkedin"])

_linkedin_cache: dict[str, LinkedInResult] = {}


def get_cached_linkedin_result(analysis_id: str) -> LinkedInResult | None:
    return _linkedin_cache.get(analysis_id)


def cache_linkedin_result(result: LinkedInResult) -> None:
    _linkedin_cache[result.analysisId] = result


@router.post("/analyze-pdf", response_model=LinkedInResult)
async def analyze_pdf(
    file: UploadFile = File(...),
    name: str = Form(None),
    profileUrl: str = Form(None),
) -> LinkedInResult:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a PDF document.")

    try:
        file_bytes = await file.read()
        result = analyze_linkedin_pdf(
            file_bytes=file_bytes,
            context_name=name,
            context_url=profileUrl,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    cache_linkedin_result(result)
    return result


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
