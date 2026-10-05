from pydantic import BaseModel, Field


class SkillGap(BaseModel):
    skill: str
    severity: str  # "high" | "medium" | "low"
    recommendation: str


class MarketDemandItem(BaseModel):
    skill: str
    demand: int  # 0 - 100


class LinkedInAnalyzeRequest(BaseModel):
    profileUrl: str = Field(min_length=1, description="LinkedIn profile URL or full name / handle")


class LinkedInResult(BaseModel):
    analysisId: str
    profileUrl: str
    name: str
    headline: str
    overallScore: int
    skillGaps: list[SkillGap]
    strengths: list[str]
    marketDemand: list[MarketDemandItem]
