import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from roadmap.backend.schemas import RoadmapRequest, RoadmapResult
from roadmap.backend.service import build_personalized_roadmap
from app.services.store import (
    get_github_result,
    get_linkedin_result,
    get_roadmap_result,
    save_roadmap_result,
)

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.post("/build", response_model=RoadmapResult)
async def build_plan(body: RoadmapRequest) -> RoadmapResult:
    linkedin = get_linkedin_result(body.linkedinAnalysisId) if body.linkedinAnalysisId else None
    github = get_github_result(body.githubAnalysisId) if body.githubAnalysisId else None

    try:
        result = build_personalized_roadmap(linkedin, github)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    save_roadmap_result(result)
    return result


@router.get("/{roadmap_id}", response_model=RoadmapResult)
async def get_roadmap(roadmap_id: str) -> RoadmapResult:
    result = get_roadmap_result(roadmap_id)
    if not result:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return result
