from fastapi import APIRouter, HTTPException

from app.schemas import RoadmapRequest, RoadmapResult
from app.services.roadmap_service import build_roadmap
from app.services.store import get_github_result, get_linkedin_result, get_roadmap_result, save_roadmap_result

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.post("/build", response_model=RoadmapResult)
async def create_roadmap(body: RoadmapRequest) -> RoadmapResult:
    linkedin = get_linkedin_result(body.linkedinAnalysisId) if body.linkedinAnalysisId else None
    github = get_github_result(body.githubAnalysisId) if body.githubAnalysisId else None

    if body.linkedinAnalysisId and not linkedin:
        raise HTTPException(status_code=404, detail="LinkedIn analysis not found")
    if body.githubAnalysisId and not github:
        raise HTTPException(status_code=404, detail="GitHub analysis not found")

    try:
        result = build_roadmap(linkedin, github)
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
