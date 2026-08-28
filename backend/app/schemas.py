from pydantic import BaseModel, Field


class LinkedInAnalyzeRequest(BaseModel):
    profileUrl: str = Field(min_length=1)


class GitHubAnalyzeRequest(BaseModel):
    username: str = Field(min_length=1)


class ChatMessageRequest(BaseModel):
    message: str = Field(min_length=1)
    conversationId: str | None = None
    linkedinAnalysisId: str | None = None
    githubAnalysisId: str | None = None


class SkillGap(BaseModel):
    skill: str
    severity: str
    recommendation: str


class MarketDemandItem(BaseModel):
    skill: str
    demand: int


class LinkedInResult(BaseModel):
    analysisId: str
    profileUrl: str
    name: str
    headline: str
    overallScore: int
    skillGaps: list[SkillGap]
    strengths: list[str]
    marketDemand: list[MarketDemandItem]


class LanguageStat(BaseModel):
    name: str
    percentage: int


class PinnedRepo(BaseModel):
    name: str
    stars: int
    language: str


class GitHubResult(BaseModel):
    analysisId: str
    username: str
    name: str
    overallScore: int
    stats: dict[str, int]
    topLanguages: list[LanguageStat]
    skillGaps: list[SkillGap]
    pinnedRepos: list[PinnedRepo]


class ChatMessageResponse(BaseModel):
    reply: str
    conversationId: str


class ChatHistoryResponse(BaseModel):
    conversationId: str
    messages: list[dict[str, str]]


class RoadmapRequest(BaseModel):
    linkedinAnalysisId: str | None = None
    githubAnalysisId: str | None = None


class RoadmapWeek(BaseModel):
    week: int
    focus: str
    tasks: list[str]


class RoadmapPriority(BaseModel):
    skill: str
    severity: str
    source: str
    recommendation: str


class RoadmapResult(BaseModel):
    roadmapId: str
    combinedScore: int
    summary: str
    priorities: list[RoadmapPriority]
    weeks: list[RoadmapWeek]
    nextActions: list[str]
