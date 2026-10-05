from fastapi import APIRouter, HTTPException

from .schemas import RoadmapRequest, RoadmapResult
from .service import build_personalized_roadmap

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

_roadmap_cache: dict[str, RoadmapResult] = {}


def get_cached_roadmap(roadmap_id: str) -> RoadmapResult | None:
    return _roadmap_cache.get(roadmap_id)


def cache_roadmap(roadmap: RoadmapResult) -> None:
    _roadmap_cache[roadmap.roadmapId] = roadmap


# Lookup hook for fetching linkedin & github analyses from main store or module caches
_result_resolver = None


def set_result_resolver(resolver_fn):
    global _result_resolver
    _result_resolver = resolver_fn


@router.post("/build", response_model=RoadmapResult)
async def create_roadmap(body: RoadmapRequest) -> RoadmapResult:
    linkedin_result = None
    github_result = None

    if _result_resolver:
        linkedin_result, github_result = _result_resolver(
            body.linkedinAnalysisId, body.githubAnalysisId
        )

    try:
        roadmap = build_personalized_roadmap(linkedin_result, github_result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    cache_roadmap(roadmap)
    return roadmap


@router.get("/{roadmap_id}", response_model=RoadmapResult)
async def get_roadmap_by_id(roadmap_id: str) -> RoadmapResult:
    result = get_cached_roadmap(roadmap_id)
    if not result:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
    return result
