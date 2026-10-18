from pydantic import BaseModel, Field


class SkillGap(BaseModel):
    skill: str
    severity: str = "medium"  # "high" | "medium" | "low"
    recommendation: str = ""


class MarketDemandItem(BaseModel):
    skill: str
    demand: int = 80  # 0 - 100


class LinkedInAnalyzeRequest(BaseModel):
    profileUrl: str = Field(min_length=1, description="LinkedIn profile URL or full name / handle")


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
    skills: list[str] = []
    certifications: list[CertificationItem] = []
    experience: list[ExperienceItem] = []
    education: list[EducationItem] = []
    # Backwards compatibility fields for roadmap, chatbot, and store:
    overallScore: int = 85
    strengths: list[str] = []
    skillGaps: list[SkillGap] = []
    marketDemand: list[MarketDemandItem] = []
