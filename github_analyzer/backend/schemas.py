from typing import Any
from pydantic import BaseModel, Field


class SkillGap(BaseModel):
    skill: str
    severity: str = "medium"
    recommendation: str = ""


class LanguageStat(BaseModel):
    name: str
    percentage: int
    bytes: int = 0
    color: str = "#00e5ff"


class PinnedRepo(BaseModel):
    name: str
    stars: int = 0
    language: str = "Code"
    description: str | None = None
    forks: int = 0
    htmlUrl: str = ""


class UserProfileMeta(BaseModel):
    login: str
    name: str | None = None
    avatarUrl: str = ""
    htmlUrl: str = ""
    bio: str | None = None
    company: str | None = None
    blog: str | None = None
    location: str | None = None
    email: str | None = None
    hireable: bool | None = None
    twitterUsername: str | None = None
    publicRepos: int = 0
    publicGists: int = 0
    followers: int = 0
    following: int = 0
    createdAt: str | None = ""
    updatedAt: str | None = ""
    accountAgeYears: float = 0.0


class RepoItem(BaseModel):
    name: str
    fullName: str = ""
    description: str | None = None
    htmlUrl: str = ""
    homepage: str | None = None
    stars: int = 0
    forks: int = 0
    openIssues: int = 0
    watchers: int = 0
    language: str | None = None
    sizeKb: int = 0
    license: str | None = None
    isFork: bool = False
    isArchived: bool = False
    topics: list[str] = Field(default_factory=list)
    createdAt: str | None = ""
    updatedAt: str | None = ""
    pushedAt: str | None = ""
    defaultBranch: str = "main"
    hasReadme: bool = False
    hasTests: bool = False
    hasCi: bool = False
    hasDocker: bool = False
    hasTypeScript: bool = False
    architecturePattern: str = "Standard Repository"
    detectedStack: list[str] = Field(default_factory=list)
    rootFiles: list[str] = Field(default_factory=list)


class TechStackSummary(BaseModel):
    languages: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    backend: list[str] = Field(default_factory=list)
    frontend: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    devops: list[str] = Field(default_factory=list)
    testing: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)


class DependencyItem(BaseModel):
    repo: str
    name: str
    version: str = ""
    depType: str = "dependency"  # dependency | devDependency
    category: str = "Library"


class ActivityAnalytics(BaseModel):
    totalRecentEvents: int = 0
    recentPushes: int = 0
    recentPullRequests: int = 0
    recentReviews: int = 0
    recentIssues: int = 0
    dayOfWeekDistribution: dict[str, int] = Field(default_factory=dict)
    timeOfDayDistribution: dict[str, int] = Field(default_factory=dict)
    recentCommitMessages: list[str] = Field(default_factory=list)
    velocityPerWeek: float = 0.0
    codingHabitVerdict: str = "Balanced Developer"


class ContributionDay(BaseModel):
    date: str
    count: int = 0
    level: int = 0


class ContributionSummary(BaseModel):
    totalLastYear: int = 0
    currentStreak: int = 0
    longestStreak: int = 0
    activeDaysCount: int = 0
    calendar: list[ContributionDay] = Field(default_factory=list)
    monthlyTrends: list[dict[str, Any]] = Field(default_factory=list)


class CollaborationSummary(BaseModel):
    prsOpened: int = 0
    prsMerged: int = 0
    reviewsGiven: int = 0
    issuesCreated: int = 0
    issueComments: int = 0
    collaborationIndex: str = "Active Contributor"


class OrganizationItem(BaseModel):
    login: str
    avatarUrl: str = ""
    description: str | None = None
    htmlUrl: str = ""


class GistItem(BaseModel):
    id: str
    description: str | None = None
    language: str | None = None
    filesCount: int = 1
    commentsCount: int = 0
    createdAt: str = ""
    htmlUrl: str = ""


class CommunityUser(BaseModel):
    login: str
    avatarUrl: str = ""
    htmlUrl: str = ""


class SkillEvidenceItem(BaseModel):
    skill: str
    category: str = "Language"
    repoCount: int = 1
    repos: list[str] = Field(default_factory=list)
    evidenceSnippet: str = ""


class EngineeringAudit(BaseModel):
    testAdoptionRate: int = 0
    ciCdAdoptionRate: int = 0
    dockerAdoptionRate: int = 0
    typeSafetyRate: int = 0
    lintingConfigRate: int = 0
    documentationHealthRate: int = 0
    detectedPatterns: list[str] = Field(default_factory=list)


class SecurityAudit(BaseModel):
    exposedSecretsFound: bool = False
    exposedFiles: list[str] = Field(default_factory=list)
    dependabotEnabled: bool = False
    securityPolicyPresent: bool = False
    riskLevel: str = "Low"
    statusMessage: str = "No exposed secrets detected in public files."


class DataProvenance(BaseModel):
    verifiedLiveMetrics: list[str] = Field(default_factory=list)
    inferredInsights: list[str] = Field(default_factory=list)
    unavailableData: list[str] = Field(default_factory=list)
    rateLimitRemaining: int = 5000


class GitHubAnalyzeRequest(BaseModel):
    username: str = Field(min_length=1, description="GitHub username or profile URL")


class GitHubResult(BaseModel):
    analysisId: str
    username: str
    name: str
    overallScore: int
    stats: dict[str, int]
    topLanguages: list[LanguageStat]
    strongLanguages: list[str] = Field(default_factory=list)
    primaryLanguage: str | None = None
    skillGaps: list[SkillGap] = Field(default_factory=list)
    pinnedRepos: list[PinnedRepo] = Field(default_factory=list)

    # Detailed extractions
    profile: UserProfileMeta | None = None
    allRepositories: list[RepoItem] = Field(default_factory=list)
    techStack: TechStackSummary = Field(default_factory=TechStackSummary)
    dependencies: list[DependencyItem] = Field(default_factory=list)
    activity: ActivityAnalytics = Field(default_factory=ActivityAnalytics)
    contributions: ContributionSummary = Field(default_factory=ContributionSummary)
    collaboration: CollaborationSummary = Field(default_factory=CollaborationSummary)
    organizations: list[OrganizationItem] = Field(default_factory=list)
    gists: list[GistItem] = Field(default_factory=list)
    followersSample: list[CommunityUser] = Field(default_factory=list)
    followingSample: list[CommunityUser] = Field(default_factory=list)
    evidenceMap: list[SkillEvidenceItem] = Field(default_factory=list)
    engineeringAudit: EngineeringAudit = Field(default_factory=EngineeringAudit)
    securityAudit: SecurityAudit = Field(default_factory=SecurityAudit)
    dataProvenance: DataProvenance = Field(default_factory=DataProvenance)


class GitHubUserSuggestion(BaseModel):
    username: str
    name: str | None = None
    avatar_url: str
    bio: str | None = None
    html_url: str = ""


class GitHubSearchUsersResponse(BaseModel):
    users: list[GitHubUserSuggestion]
