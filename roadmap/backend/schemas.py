from pydantic import BaseModel, ConfigDict


class RoadmapRequest(BaseModel):
    linkedinAnalysisId: str | None = None
    githubAnalysisId: str | None = None


class RoadmapWeek(BaseModel):
    model_config = ConfigDict(extra="ignore")

    week: int  # Milestone / Sprint index: 1, 2, 3...
    milestoneNumber: int = 1
    phase: str = ""
    title: str = ""
    focus: str
    duration: str = "1-2 Weeks"
    languageContext: str = ""
    severity: str = "medium"
    deliverable: str = ""
    tasks: list[str]


class RoadmapPriority(BaseModel):
    model_config = ConfigDict(extra="ignore")

    skill: str
    severity: str  # "high" | "medium" | "low"
    source: str    # "linkedin" | "github" | "both"
    recommendation: str


class RoadmapResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    roadmapId: str
    combinedScore: int
    summary: str
    strongLanguages: list[str] = []
    primaryLanguage: str = ""
    totalMilestones: int = 0
    estimatedTotalDuration: str = ""
    priorities: list[RoadmapPriority]
    weeks: list[RoadmapWeek]
    nextActions: list[str]
