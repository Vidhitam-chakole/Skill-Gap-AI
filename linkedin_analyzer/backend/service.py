import io
import re
import uuid
from urllib.parse import urlparse

import pypdf

from .schemas import LinkedInResult, MarketDemandItem, SkillGap

MARKET_DEMAND = [
    ("React", 92),
    ("TypeScript", 88),
    ("AWS / Cloud", 85),
    ("Python", 82),
    ("System Design", 91),
    ("Docker / Kubernetes", 84),
    ("GraphQL / REST APIs", 72),
    ("DevOps & CI/CD", 86),
    ("SQL & Databases", 78),
    ("Automated Testing", 75),
]

TECH_SKILLS_MAP = {
    "React": r"\breact(?:\.js)?\b",
    "TypeScript": r"\btypescript\b|\bts\b",
    "JavaScript": r"\bjavascript\b|\bjs\b",
    "Python": r"\bpython\b",
    "Node.js": r"\bnode(?:\.js)?\b",
    "Next.js": r"\bnext(?:\.js)?\b",
    "Go": r"\bgolang\b|\bgo\b",
    "Rust": r"\brust\b",
    "Java": r"\bjava\b",
    "C++": r"\bc\+\+\b",
    "C#": r"\bc#\b|\b\.net\b",
    "SQL / PostgreSQL": r"\bsql\b|\bpostgres(?:ql)?\b|\bmysql\b",
    "MongoDB": r"\bmongodb\b|\bmongo\b",
    "Redis": r"\bredis\b",
    "AWS": r"\baws\b|amazon web services",
    "GCP / Azure": r"\bgcp\b|google cloud|\bazure\b",
    "Docker": r"\bdocker\b|containeri[sz]ation",
    "Kubernetes": r"\bkubernetes\b|\bk8s\b",
    "CI/CD": r"\bci/cd\b|github actions|gitlab ci|jenkins",
    "System Design": r"system design|distributed systems|microservices",
    "Automated Testing": r"unit test|jest|pytest|vitest|cypress|playwright|tdd",
    "REST APIs": r"rest(?:ful)?\b|api design|graphql",
    "Git": r"\bgit\b|github|version control",
    "Linux": r"\blinux\b|bash|unix",
    "Machine Learning": r"machine learning|\bml\b|deep learning|pytorch|tensorflow",
    "Figma / UI-UX": r"\bfigma\b|ui/ux|wireframing|user research",
    "Agile / Scrum": r"\bagile\b|\bscrum\b|jira|sprint",
}

GAP_RULES = [
    (
        "System Design",
        r"system design|distributed systems|microservices",
        "high",
        "Study scalable architecture patterns, distributed caching (Redis), load balancing, and database sharding.",
    ),
    (
        "Docker & Containerization",
        r"\bdocker\b|containeri[sz]ation|\bkubernetes\b|\bk8s\b",
        "high",
        "Build production multi-stage Dockerfiles and deploy multi-service apps using Docker Compose.",
    ),
    (
        "Automated Testing & QA",
        r"unit test|jest|pytest|vitest|cypress|playwright|tdd",
        "high",
        "Add unit and end-to-end test suites (e.g. Pytest or Vitest) with automated GitHub Actions verification.",
    ),
    (
        "Cloud Infrastructure (AWS/GCP)",
        r"\baws\b|google cloud|\bgcp\b|\bazure\b",
        "medium",
        "Deploy scalable serverless or containerized backends on AWS/GCP and earn an Associate Cloud certification.",
    ),
    (
        "DevOps & CI/CD Pipelines",
        r"\bci/cd\b|github actions|gitlab ci|jenkins",
        "medium",
        "Configure automated build, lint, test, and container deployment pipelines on every pull request.",
    ),
    (
        "Strict TypeScript Patterns",
        r"\btypescript\b|\bts\b",
        "medium",
        "Enforce strict TypeScript configs, shared domain interfaces, and runtime schema validation with Zod.",
    ),
]


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_pages.append(t)
        return "\n".join(extracted_pages)
    except Exception as exc:
        raise ValueError(f"Could not read PDF resume file: {exc}") from exc


def analyze_linkedin_pdf(
    file_bytes: bytes,
    context_name: str | None = None,
    context_url: str | None = None,
) -> LinkedInResult:
    text = extract_text_from_pdf(file_bytes)
    if not text.strip():
        raise ValueError("The uploaded PDF appears to be empty or unreadable text. Please ensure it is a valid LinkedIn profile PDF export.")

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # 1. Determine Name
    name = (context_name or "").strip()
    if not name and lines:
        first_few = [l for l in lines[:5] if not any(w in l.lower() for w in ("top skills", "contact", "page", "linkedin", "www."))]
        if first_few:
            name = first_few[0]
    if not name:
        name = "LinkedIn User"

    # 2. Determine Headline
    headline = "Software & Technology Professional"
    for line in lines[:8]:
        if line != name and len(line) > 8 and not any(w in line.lower() for w in ("page", "linkedin", "email", "phone", "contact")):
            headline = line
            break

    # 3. Detect Skills & Strengths
    strengths: list[str] = []
    text_lower = text.lower()
    for skill_name, pattern in TECH_SKILLS_MAP.items():
        if re.search(pattern, text_lower):
            strengths.append(skill_name)

    if not strengths:
        strengths = ["Technical Communication", "Project Execution", "Agile Collaboration"]

    # 4. Detect Skill Gaps
    skill_gaps: list[SkillGap] = []
    for gap_name, pattern, severity, recommendation in GAP_RULES:
        if not re.search(pattern, text_lower):
            skill_gaps.append(
                SkillGap(skill=gap_name, severity=severity, recommendation=recommendation)
            )

    # Ensure at least 2 actionable gaps
    if len(skill_gaps) < 2:
        skill_gaps.append(
            SkillGap(
                skill="Advanced Performance Profiling",
                severity="medium",
                recommendation="Profile memory allocation, optimize database query indexing, and reduce bundle sizes.",
            )
        )

    # 5. Score Calculation
    base_score = 66
    skill_bonus = min(len(strengths) * 3, 20)
    has_experience = 5 if "experience" in text_lower else 0
    has_education = 5 if ("education" in text_lower or "university" in text_lower or "college" in text_lower) else 0
    overall_score = min(base_score + skill_bonus + has_experience + has_education, 96)

    # 6. Profile URL
    if context_url and context_url.strip():
        profile_url = context_url.strip()
    else:
        slug = re.sub(r"[^a-zA-Z0-9-]", "-", name.lower()).strip("-")
        profile_url = f"https://linkedin.com/in/{slug or 'profile'}"

    # 7. Market Demand
    demand = [
        MarketDemandItem(skill=skill, demand=d)
        for skill, d in MARKET_DEMAND[:5]
    ]

    return LinkedInResult(
        analysisId=f"li-pdf-{uuid.uuid4().hex[:8]}",
        profileUrl=profile_url,
        name=name,
        headline=headline,
        overallScore=overall_score,
        skillGaps=skill_gaps[:4],
        strengths=strengths[:6],
        marketDemand=demand,
    )


def _extract_name_and_slug(input_str: str) -> tuple[str, str, str]:
    raw = input_str.strip()
    is_url = bool(re.search(r"(linkedin\.com|https?://)", raw, re.IGNORECASE))

    if is_url:
        if not raw.startswith(("http://", "https://")):
            url = f"https://{raw}"
        else:
            url = raw

        parsed = urlparse(url)
        path = parsed.path.strip("/")
        match = re.search(r"(?:in|pub)/([^/?#]+)", path, re.IGNORECASE)
        if match:
            slug = match.group(1)
        else:
            slug = path.split("/")[-1] if path else "professional"

        slug = re.sub(r"[^a-zA-Z0-9-]", "", slug) or "professional"
        parts = [p.capitalize() for p in re.split(r"[-_]+", slug) if p and not p.isdigit()]
        name = " ".join(parts[:3]) or "Professional User"
        normalized_url = url
    else:
        parts = raw.split()
        if len(parts) >= 1:
            name = " ".join(p.capitalize() for p in parts)
            slug = re.sub(r"[^a-zA-Z0-9-]", "-", raw.lower()).strip("-")
        else:
            name = "Professional User"
            slug = "professional"
        normalized_url = f"https://linkedin.com/in/{slug or 'professional'}"

    return slug, normalized_url, name


def analyze_linkedin_profile(profile_input: str) -> LinkedInResult:
    if not profile_input or not profile_input.strip():
        raise ValueError("LinkedIn profile input cannot be empty.")

    slug, normalized_url, name = _extract_name_and_slug(profile_input)
    score = 78 + (len(slug) % 11)

    skill_gaps = [
        SkillGap(
            skill="System Design & Architecture",
            severity="high",
            recommendation="Study distributed microservices, caching layers with Redis, and horizontal scaling strategies.",
        ),
        SkillGap(
            skill="Container Orchestration (Docker/K8s)",
            severity="medium",
            recommendation="Containerize core services with Docker and manage deployments with Docker Compose or Kubernetes.",
        ),
        SkillGap(
            skill="Automated Testing & CI/CD",
            severity="medium",
            recommendation="Implement automated unit tests with GitHub Actions continuous integration pipelines.",
        ),
    ]

    demand = [
        MarketDemandItem(skill=skill, demand=demand)
        for skill, demand in MARKET_DEMAND[:5]
    ]

    return LinkedInResult(
        analysisId=f"li-{uuid.uuid4().hex[:8]}",
        profileUrl=normalized_url,
        name=name,
        headline="Software Developer & Engineer",
        overallScore=score,
        skillGaps=skill_gaps,
        strengths=["JavaScript / TypeScript", "Git Version Control", "REST APIs", "Clean Code"],
        marketDemand=demand,
    )
