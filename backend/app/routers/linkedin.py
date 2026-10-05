import sys
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from linkedin_analyzer.backend.schemas import LinkedInAnalyzeRequest, LinkedInResult
from linkedin_analyzer.backend.service import analyze_linkedin_pdf, analyze_linkedin_profile
from app.services.store import get_linkedin_result, save_linkedin_result

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


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

    save_linkedin_result(result)
    return result


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
