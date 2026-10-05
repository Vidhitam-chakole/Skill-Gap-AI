import re
import uuid
from urllib.parse import urlparse

from .schemas import LinkedInResult, MarketDemandItem, SkillGap

MARKET_DEMAND = [
    ("React", 92),
    ("TypeScript", 88),
    ("AWS / Cloud", 85),
    ("Python", 82),
    ("System Design", 91),
    ("Kubernetes / Docker", 84),
    ("GraphQL", 72),
    ("CI/CD & DevOps", 86),
    ("SQL & Databases", 78),
    ("Product Strategy", 74),
]

ROLE_PROFILES = {
    "developer": {
        "headline": "Software Developer & Engineer",
        "strengths": ["Clean Code", "JavaScript / TypeScript", "Git Version Control", "Problem Solving", "REST APIs"],
        "gaps": [
            ("System Design", "high", "Study distributed systems, caching strategies, and scalable architectural patterns"),
            ("Cloud Architecture (AWS/GCP)", "medium", "Attain an AWS Solutions Architect or GCP Associate certification"),
            ("DevOps & CI/CD", "medium", "Implement automated GitHub Actions workflows, Docker containers, and test pipelines"),
            ("Advanced Testing", "low", "Write end-to-end integration and unit tests across services"),
        ],
    },
    "designer": {
        "headline": "Product & UI/UX Designer",
        "strengths": ["UI/UX Design", "Figma Prototyping", "User Research", "Visual Systems", "Design Systems"],
        "gaps": [
            ("Design Systems & Tokens", "medium", "Build and publish a comprehensive component library with documented tokens"),
            ("Interactive Prototyping", "low", "Master micro-interactions and high-fidelity transitions in Figma/Framer"),
            ("Front-end Fundamentals", "medium", "Learn core HTML/CSS/DOM principles to collaborate smoothly with engineers"),
        ],
    },
    "manager": {
        "headline": "Engineering Manager & Technical Lead",
        "strengths": ["Engineering Leadership", "Agile & Scrum", "Cross-Functional Collaboration", "Team Mentorship"],
        "gaps": [
            ("Technical Depth Maintenance", "medium", "Keep hands-on understanding of your team's modern cloud & AI stack"),
            ("Data-Driven Metrics", "medium", "Institute automated cycle-time metrics and OKR tracking dashboards"),
            ("Strategic Roadmapping", "low", "Align architectural milestones directly with quarterly business outcomes"),
        ],
    },
    "data": {
        "headline": "Data Scientist & AI Specialist",
        "strengths": ["Python", "SQL & Query Optimization", "Data Modeling", "Statistical Analysis", "Machine Learning"],
        "gaps": [
            ("MLOps & Production Serving", "high", "Learn model deployment, drift monitoring, and FastAPI model inference pipelines"),
            ("Cloud Data Warehouses", "medium", "Master Snowflake, BigQuery, or Redshift query and schema design"),
            ("Data Storytelling", "low", "Create interactive executive dashboards using Streamlit, Grafana, or Metabase"),
        ],
    },
}

DEFAULT_PROFILE = {
    "headline": "Technology & Product Professional",
    "strengths": ["Technical Communication", "Project Execution", "Cross-Team Collaboration", "Agile Delivery"],
    "gaps": [
        ("High-Demand Tech Stack", "high", "Identify high-demand frameworks in your target role and build a public case study"),
        ("Industry Certifications", "medium", "Earn an industry-recognized cloud or domain credential this quarter"),
        ("Public Portfolio Visibility", "low", "Showcase impactful case studies and repositories on LinkedIn and GitHub"),
    ],
}


def _extract_name_and_slug(input_str: str) -> tuple[str, str, str]:
    """
    Parses LinkedIn input which can be:
    - Full URL: https://linkedin.com/in/alex-rivera
    - Domain URL: linkedin.com/in/alex-rivera
    - Slug: alex-rivera
    - Full Name: Alex Rivera
    Returns: (slug, normalized_url, extracted_name)
    """
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

        # Sanitize slug
        slug = re.sub(r"[^a-zA-Z0-9-]", "", slug) or "professional"
        parts = [p.capitalize() for p in re.split(r"[-_]+", slug) if p and not p.isdigit()]
        name = " ".join(parts[:3]) or "Professional User"
        normalized_url = url
    else:
        # Plain name or username provided (e.g. "Alex Rivera", "vidhitam chakole")
        parts = raw.split()
        if len(parts) >= 1:
            name = " ".join(p.capitalize() for p in parts)
            slug = re.sub(r"[^a-zA-Z0-9-]", "-", raw.lower()).strip("-")
        else:
            name = "Professional User"
            slug = "professional"
        normalized_url = f"https://linkedin.com/in/{slug or 'professional'}"

    return slug, normalized_url, name


def _detect_profile(slug: str, raw_input: str) -> dict:
    haystack = f"{slug} {raw_input}".lower()
    if any(k in haystack for k in ("design", "ux", "ui", "creative", "product design", "figma")):
        return ROLE_PROFILES["designer"]
    if any(k in haystack for k in ("data", "analyst", "analytics", "ml", "ai", "machine learning", "deep learning")):
        return ROLE_PROFILES["data"]
    if any(k in haystack for k in ("manager", "lead", "director", "head", "vp", "scrum master")):
        return ROLE_PROFILES["manager"]
    if any(k in haystack for k in ("dev", "engineer", "software", "fullstack", "frontend", "backend", "web", "coder", "programmer")):
        return ROLE_PROFILES["developer"]
    return DEFAULT_PROFILE


def _calculate_score(profile: dict, slug: str, name: str) -> int:
    base = 72 + ((len(slug) + len(name)) % 13)
    bonus = min(len(profile["strengths"]) * 2, 10)
    return min(base + bonus, 94)


def analyze_linkedin_profile(profile_input: str) -> LinkedInResult:
    if not profile_input or not profile_input.strip():
        raise ValueError("LinkedIn profile input cannot be empty.")

    slug, normalized_url, name = _extract_name_and_slug(profile_input)
    profile = _detect_profile(slug, profile_input)
    score = _calculate_score(profile, slug, name)

    skill_gaps = [
        SkillGap(skill=skill, severity=severity, recommendation=recommendation)
        for skill, severity, recommendation in profile["gaps"]
    ]

    demand = [
        MarketDemandItem(skill=skill, demand=demand)
        for skill, demand in MARKET_DEMAND[:5]
    ]

    return LinkedInResult(
        analysisId=f"li-{uuid.uuid4().hex[:8]}",
        profileUrl=normalized_url,
        name=name,
        headline=profile["headline"],
        overallScore=score,
        skillGaps=skill_gaps,
        strengths=profile["strengths"],
        marketDemand=demand,
    )
