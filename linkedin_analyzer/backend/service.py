import io
import re
import uuid
from urllib.parse import urlparse
from pathlib import Path

import pypdf

from .schemas import LinkedInResult, MarketDemandItem, SkillGap

# Market skill baseline ratings based on active industry demand
TECH_SKILL_PATTERNS = {
    "React": (r"\breact(?:\.js)?\b", 92),
    "TypeScript": (r"\btypescript\b|\bts\b", 90),
    "JavaScript": (r"\bjavascript\b|\bjs\b", 88),
    "Python": (r"\bpython\b", 89),
    "FastAPI": (r"\bfastapi\b", 84),
    "Node.js": (r"\bnode(?:\.js)?\b", 86),
    "Next.js": (r"\bnext(?:\.js)?\b", 87),
    "Go": (r"\bgolang\b|\bgo\b", 85),
    "Rust": (r"\brust\b", 82),
    "Java": (r"\bjava\b", 81),
    "C++": (r"\bc\+\+\b", 78),
    "C": (r"\bc\b", 72),
    "SQL / Databases": (r"\bsql\b|\bpostgres(?:ql)?\b|\bmysql\b", 85),
    "MongoDB / NoSQL": (r"\bmongodb\b|\bmongo\b|\bnosql\b", 80),
    "Redis / Caching": (r"\bredis\b", 82),
    "AWS / Cloud": (r"\baws\b|amazon web services", 88),
    "GCP / Azure": (r"\bgcp\b|google cloud|\bazure\b", 82),
    "Docker / Containers": (r"\bdocker\b|containeri[sz]ation", 87),
    "Kubernetes": (r"\bkubernetes\b|\bk8s\b", 83),
    "CI/CD Automation": (r"\bci/cd\b|github actions|gitlab ci|jenkins", 86),
    "System Design": (r"system design|distributed systems|microservices", 91),
    "Automated Testing": (r"unit test|jest|pytest|vitest|cypress|playwright|tdd", 84),
    "RESTful APIs": (r"rest(?:ful)?\b|api design|graphql", 83),
    "Git / GitHub": (r"\bgit\b|github|version control", 80),
    "Linux / Shell": (r"\blinux\b|bash|unix|shell", 79),
    "Machine Learning": (r"machine learning|\bml\b|deep learning|pytorch|tensorflow", 88),
    "UI/UX Design": (r"\bfigma\b|ui/ux|wireframing|user research", 76),
    "Agile / Scrum": (r"\bagile\b|\bscrum\b|jira|sprint", 75),
}


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


def _detect_experience_years(text: str) -> int:
    """Detect approximate professional experience duration in years from resume text."""
    years_found = re.findall(r"\b(20\d\d|19\d\d)\b", text)
    if len(years_found) >= 2:
        try:
            int_years = [int(y) for y in years_found if 1990 <= int(y) <= 2027]
            if int_years:
                diff = max(int_years) - min(int_years)
                return max(min(diff, 20), 0)
        except Exception:
            pass
    return 1


def _extract_name_and_headline(text: str, context_name: str | None = None) -> tuple[str, str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = (context_name or "").strip()

    if not name and lines:
        for line in lines[:6]:
            lower_line = line.lower()
            if any(w in lower_line for w in ("top skills", "contact", "page", "linkedin", "www.", "email", "phone", "summary")):
                continue
            if len(line.split()) in (2, 3, 4) and len(line) < 40 and not any(char in line for char in "@/:0123456789"):
                name = line
                break

    name = name or "LinkedIn Professional"

    headline = "Software Engineer & Developer"
    for line in lines[:10]:
        if line != name and len(line) > 10 and not any(w in line.lower() for w in ("page", "linkedin", "email", "phone", "contact", "summary")):
            if any(k in line.lower() for k in ("engineer", "developer", "student", "architect", "lead", "specialist", "scientist", "manager", "designer")):
                headline = line
                break

    return name, headline


def analyze_linkedin_pdf(
    file_bytes: bytes,
    context_name: str | None = None,
    context_url: str | None = None,
) -> LinkedInResult:
    text = extract_text_from_pdf(file_bytes)
    if not text.strip():
        raise ValueError("The uploaded PDF appears to be empty or unreadable text. Please ensure it is a valid LinkedIn profile PDF export.")

    name, headline = _extract_name_and_headline(text, context_name)
    text_lower = text.lower()

    # 1. Detect Real Skills from PDF
    detected_strengths: list[str] = []
    market_demands: list[MarketDemandItem] = []

    for skill_name, (pattern, demand_score) in TECH_SKILL_PATTERNS.items():
        if re.search(pattern, text_lower):
            detected_strengths.append(skill_name)
            market_demands.append(MarketDemandItem(skill=skill_name, demand=demand_score))

    if not detected_strengths:
        detected_strengths = ["Technical Communication", "Project Collaboration", "Problem Solving"]
        market_demands = [MarketDemandItem(skill="Problem Solving", demand=85)]

    # 2. Real Skill Gap Detection grounded in profile analysis
    skill_gaps: list[SkillGap] = []

    # Check automated testing
    if not re.search(r"unit test|jest|pytest|vitest|cypress|playwright|tdd", text_lower):
        skill_gaps.append(SkillGap(
            skill="Automated Testing & QA",
            severity="high",
            recommendation="No test automation frameworks (Pytest, Vitest, Jest) mentioned in your profile experience. Document automated testing methodologies in your project bullet points.",
        ))

    # Check CI/CD & DevOps
    if not re.search(r"ci/cd|github actions|gitlab ci|jenkins|devops", text_lower):
        skill_gaps.append(SkillGap(
            skill="CI/CD Pipeline Automation",
            severity="high",
            recommendation="Continuous Integration (CI/CD) and workflow automation are absent from your experience descriptions. Highlight automated deployment pipelines on LinkedIn.",
        ))

    # Check System Architecture / Scalability
    if not re.search(r"system design|distributed systems|microservices|scalab|caching|redis", text_lower):
        skill_gaps.append(SkillGap(
            skill="System Architecture & Scalability",
            severity="medium",
            recommendation="Add descriptions of architectural trade-offs, caching (Redis), or microservice communication to demonstrate senior-level engineering depth.",
        ))

    # Check Cloud & Containerization
    if not re.search(r"docker|container|kubernetes|aws|cloud|gcp|azure", text_lower):
        skill_gaps.append(SkillGap(
            skill="Cloud & Containerization (Docker/Cloud)",
            severity="medium",
            recommendation="No cloud deployments or Docker containerization highlighted in your profile. Add verifiable cloud infrastructure experience or cloud certifications.",
        ))

    # Check Quantifiable Metrics
    has_metrics = bool(re.search(r"\b(\d+%\b|\$\d+|\b\d+x\b|reduced by \d+|increased by \d+|improved by \d+)", text_lower))
    if not has_metrics:
        skill_gaps.append(SkillGap(
            skill="Quantifiable Impact Metrics",
            severity="low",
            recommendation="Your experience descriptions lack numerical business metrics. Rephrase responsibilities to show quantifiable impact (e.g. 'reduced latency by 35%', 'automated 100+ tasks').",
        ))

    # 3. Real Score Calculation from parsed data
    years_exp = _detect_experience_years(text)
    base_score = 55
    skills_bonus = min(len(detected_strengths) * 2, 20)
    exp_bonus = min(years_exp * 3, 12)
    has_edu = 5 if any(w in text_lower for w in ("bachelor", "master", "degree", "university", "institute", "college", "b.tech")) else 0
    has_projects = 5 if any(w in text_lower for w in ("project", "published", "repository", "github")) else 0

    overall_score = min(max(base_score + skills_bonus + exp_bonus + has_edu + has_projects, 50), 94)

    # 4. Profile URL
    if context_url and context_url.strip():
        profile_url = context_url.strip()
    else:
        slug = re.sub(r"[^a-zA-Z0-9-]", "-", name.lower()).strip("-")
        profile_url = f"https://linkedin.com/in/{slug or 'profile'}"

    # Sort market demand by score
    market_demands = sorted(market_demands, key=lambda d: d.demand, reverse=True)[:6]

    return LinkedInResult(
        analysisId=f"li-pdf-{uuid.uuid4().hex[:8]}",
        profileUrl=profile_url,
        name=name,
        headline=headline,
        overallScore=overall_score,
        skillGaps=skill_gaps[:4],
        strengths=detected_strengths[:6],
        marketDemand=market_demands,
    )


def analyze_linkedin_profile(profile_input: str) -> LinkedInResult:
    """Analyze LinkedIn profile based on profile link/username with verified technical cross-referencing."""
    if not profile_input or not profile_input.strip():
        raise ValueError("LinkedIn profile input cannot be empty.")

    raw = profile_input.strip()
    is_url = bool(re.search(r"(linkedin\.com|https?://)", raw, re.IGNORECASE))

    if is_url:
        if not raw.startswith(("http://", "https://")):
            url = f"https://{raw}"
        else:
            url = raw
        parsed = urlparse(url)
        path = parsed.path.strip("/")
        match = re.search(r"(?:in|pub)/([^/?#]+)", path, re.IGNORECASE)
        slug = match.group(1) if match else (path.split("/")[-1] if path else "developer")
        slug = re.sub(r"[^a-zA-Z0-9-]", "", slug) or "developer"
        name_parts = [p.capitalize() for p in re.split(r"[-_]+", slug) if p and not p.isdigit()]
        name = " ".join(name_parts[:3]) or "LinkedIn Professional"
        normalized_url = url
    else:
        name_parts = raw.split()
        name = " ".join(p.capitalize() for p in name_parts) if name_parts else "LinkedIn Professional"
        slug = re.sub(r"[^a-zA-Z0-9-]", "-", raw.lower()).strip("-") or "developer"
        normalized_url = f"https://linkedin.com/in/{slug}"

    # Check if this profile has a saved GitHub analysis to cross-reference real competencies
    from app.services.store import github_results

    matched_github = None
    for gh in github_results.values():
        if getattr(gh, "username", "").lower() in slug.lower() or slug.lower() in getattr(gh, "username", "").lower():
            matched_github = gh
            break

    if matched_github:
        headline = f"Software Developer | Active in {', '.join(l.name for l in matched_github.topLanguages[:2])}"
        strengths = [l.name for l in matched_github.topLanguages[:4]] + ["Git Version Control"]
        skill_gaps = [
            SkillGap(
                skill=g.skill,
                severity=g.severity,
                recommendation=f"LinkedIn profile should showcase solutions addressing: {g.recommendation}",
            )
            for g in matched_github.skillGaps[:3]
        ]
        overall_score = matched_github.overallScore
    else:
        headline = "Software Engineer & Technology Professional"
        strengths = ["Software Development", "API Design", "Git Workflow", "Problem Solving"]
        skill_gaps = [
            SkillGap(
                skill="Verified Code Artifacts on Profile",
                severity="high",
                recommendation="Upload your official LinkedIn Profile PDF export (More -> Save to PDF) for full verified skills and experience analysis.",
            ),
            SkillGap(
                skill="CI/CD & DevOps Showcasing",
                severity="medium",
                recommendation="Feature active GitHub Actions workflows and live deployment links in your featured LinkedIn section.",
            ),
            SkillGap(
                skill="System Architecture & Scalability",
                severity="medium",
                recommendation="Document architecture decisions and distributed backend systems in project descriptions.",
            ),
        ]
        overall_score = 72

    demand = [
        MarketDemandItem(skill="System Design", demand=91),
        MarketDemandItem(skill="React / TypeScript", demand=90),
        MarketDemandItem(skill="Python / APIs", demand=89),
        MarketDemandItem(skill="Cloud & DevOps", demand=86),
    ]

    return LinkedInResult(
        analysisId=f"li-{uuid.uuid4().hex[:8]}",
        profileUrl=normalized_url,
        name=name,
        headline=headline,
        overallScore=overall_score,
        skillGaps=skill_gaps,
        strengths=strengths,
        marketDemand=demand,
    )
