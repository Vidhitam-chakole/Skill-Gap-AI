from pydantic import BaseModel


class RoadmapRequest(BaseModel):
    linkedinAnalysisId: str | None = None
    githubAnalysisId: str | None = None


class RoadmapWeek(BaseModel):
    week: int
    focus: str
    tasks: list[str]


class RoadmapPriority(BaseModel):
    skill: str
    severity: str  # "high" | "medium" | "low"
    source: str    # "linkedin" | "github" | "both"
    recommendation: str


class RoadmapResult(BaseModel):
    roadmapId: str
    combinedScore: int
    summary: str
    priorities: list[RoadmapPriority]
    weeks: list[RoadmapWeek]
    nextActions: list[str]
