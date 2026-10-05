from pydantic import BaseModel, Field


class SkillGap(BaseModel):
    skill: str
    severity: str
    recommendation: str


class LanguageStat(BaseModel):
    name: str
    percentage: int


class PinnedRepo(BaseModel):
    name: str
    stars: int
    language: str


class GitHubAnalyzeRequest(BaseModel):
    username: str = Field(min_length=1, description="GitHub username or profile URL")


class GitHubResult(BaseModel):
    analysisId: str
    username: str
    name: str
    overallScore: int
    stats: dict[str, int]
    topLanguages: list[LanguageStat]
    skillGaps: list[SkillGap]
    pinnedRepos: list[PinnedRepo]
