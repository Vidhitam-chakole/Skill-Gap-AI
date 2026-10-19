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
    apiKey: str | None = None
    mode: str | None = None  # "auto", "groq", "predefined"


class SkillGap(BaseModel):
    skill: str
    severity: str = "medium"
    recommendation: str = ""


class MarketDemandItem(BaseModel):
    skill: str
    demand: int = 80


class ContactInfo(BaseModel):
    email: str | None = None
    phone: str | None = None
    linkedinUrl: str | None = None
    location: str | None = None


class ExperienceItem(BaseModel):
    title: str
    company: str
    duration: str = ""
    description: str = ""


class EducationItem(BaseModel):
    degree: str
    institution: str
    year: str = ""
    fieldOfStudy: str = ""


class CertificationItem(BaseModel):
    name: str
    issuer: str = ""
    issueDate: str = ""


class LinkedInResult(BaseModel):
    analysisId: str
    profileUrl: str = ""
    name: str
    headline: str
    summary: str = ""
    contact: ContactInfo = Field(default_factory=ContactInfo)
    skills: list[str] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    overallScore: int = 85
    skillGaps: list[SkillGap] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    marketDemand: list[MarketDemandItem] = Field(default_factory=list)



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
    strongLanguages: list[str] = []
    primaryLanguage: str | None = None
    skillGaps: list[SkillGap]
    pinnedRepos: list[PinnedRepo]


class ChatMessageResponse(BaseModel):
    reply: str
    conversationId: str
    source: str | None = "predefined"  # "groq", "openai", "predefined"
    model: str | None = None


class ChatConfigResponse(BaseModel):
    groqConfigured: bool
    model: str
    supportedModels: list[str]


class ChatHistoryResponse(BaseModel):
    conversationId: str
    messages: list[dict[str, str]]


class UserProfileCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    githubUsername: str | None = None
    linkedinUrl: str | None = None
    email: str | None = None


class UserProfileResponse(BaseModel):
    userId: str
    name: str
    githubUsername: str | None = None
    linkedinUrl: str | None = None
    email: str | None = None
    createdAt: str


class RoadmapRequest(BaseModel):
    linkedinAnalysisId: str | None = None
    githubAnalysisId: str | None = None


class RoadmapWeek(BaseModel):
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
    skill: str
    severity: str
    source: str
    recommendation: str


class RoadmapResult(BaseModel):
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
