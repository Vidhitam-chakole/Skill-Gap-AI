import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from github_analyzer.backend.schemas import GitHubAnalyzeRequest, GitHubResult
from github_analyzer.backend.service import analyze_github_user
from app.services.store import get_github_result, save_github_result

# Router connects real repository tree analyzer
router = APIRouter(prefix="/github", tags=["github"])


@router.post("/analyze", response_model=GitHubResult)
async def analyze_user(body: GitHubAnalyzeRequest) -> GitHubResult:
    try:
        result = await analyze_github_user(body.username)
    except ValueError as exc:
        raise HTTPException(status_code=404 if "not found" in str(exc).lower() else 400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"GitHub connection failed: {exc}") from exc

    save_github_result(result)
    return result


@router.get("/results/{analysis_id}", response_model=GitHubResult)
async def get_results(analysis_id: str) -> GitHubResult:
    result = get_github_result(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
