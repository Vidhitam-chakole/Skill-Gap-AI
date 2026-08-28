import re
import uuid
from urllib.parse import urlparse

from app.schemas import LinkedInResult, MarketDemandItem, SkillGap

MARKET_DEMAND = [
    ("React", 92),
    ("TypeScript", 88),
    ("AWS", 85),
    ("Python", 79),
    ("System Design", 91),
    ("Kubernetes", 82),
    ("GraphQL", 71),
    ("DevOps", 84),
]

ROLE_PROFILES = {
    "developer": {
        "headline": "Software Developer",
        "strengths": ["JavaScript", "Problem Solving", "Git", "Collaboration"],
        "gaps": [
            ("System Design", "high", "Study distributed systems and scalable architecture patterns"),
            ("Cloud (AWS/GCP)", "medium", "Complete a cloud fundamentals certification"),
            ("DevOps / CI-CD", "medium", "Learn Docker, Kubernetes, and GitHub Actions"),
        ],
    },
    "designer": {
        "headline": "Product Designer",
        "strengths": ["UI/UX", "Figma", "Visual Design", "User Research"],
        "gaps": [
            ("Design Systems", "medium", "Build a component library with documented tokens"),
            ("Prototyping", "low", "Practice interactive prototypes in Figma or Framer"),
            ("Front-end Basics", "medium", "Learn HTML/CSS to collaborate better with engineers"),
        ],
    },
    "manager": {
        "headline": "Engineering Manager",
        "strengths": ["Leadership", "Agile", "Stakeholder Management", "Team Building"],
        "gaps": [
            ("Technical Depth", "medium", "Stay current with your team's core stack"),
            ("Data-Driven Decisions", "medium", "Learn basic analytics and OKR tracking"),
            ("Mentorship", "low", "Create structured 1:1 and growth plans for reports"),
        ],
    },
    "data": {
        "headline": "Data Professional",
        "strengths": ["Python", "SQL", "Analytics", "Statistics"],
        "gaps": [
            ("Machine Learning Ops", "high", "Learn model deployment and monitoring pipelines"),
            ("Cloud Data Platforms", "medium", "Explore Snowflake, BigQuery, or Redshift"),
            ("Data Visualization", "low", "Build dashboards with modern BI tools"),
        ],
    },
}

DEFAULT_PROFILE = {
    "headline": "Professional",
    "strengths": ["Communication", "Adaptability", "Teamwork", "Critical Thinking"],
    "gaps": [
        ("Technical Upskilling", "medium", "Identify high-demand skills in your target role"),
        ("Certifications", "low", "Pursue one industry-recognized credential this quarter"),
        ("Portfolio Visibility", "medium", "Showcase projects on LinkedIn and GitHub"),
    ],
}


def _extract_slug(profile_url: str) -> tuple[str, str]:
    url = profile_url.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    parsed = urlparse(url)
    path = parsed.path.strip("/")
    match = re.search(r"(?:in|pub)/([^/?#]+)", path, re.IGNORECASE)
    slug = match.group(1) if match else path.split("/")[-1] or "professional"
    slug = re.sub(r"[^a-zA-Z0-9-]", "", slug)
    return slug, url


def _name_from_slug(slug: str) -> str:
    parts = re.split(r"[-_]+", slug)
    filtered = [part for part in parts if part and not part.isdigit()]
    if not filtered:
        return "Professional User"
    return " ".join(word.capitalize() for word in filtered[:3])


def _pick_profile(slug: str, profile_url: str) -> dict:
    haystack = f"{slug} {profile_url}".lower()
    if any(keyword in haystack for keyword in ("design", "ux", "ui", "creative")):
        return ROLE_PROFILES["designer"]
    if any(keyword in haystack for keyword in ("data", "analyst", "ml", "ai")):
        return ROLE_PROFILES["data"]
    if any(keyword in haystack for keyword in ("manager", "lead", "director", "head")):
        return ROLE_PROFILES["manager"]
    if any(keyword in haystack for keyword in ("dev", "engineer", "software", "fullstack", "frontend", "backend")):
        return ROLE_PROFILES["developer"]
    return DEFAULT_PROFILE


def _score_from_profile(profile: dict, slug: str) -> int:
    base = 68 + (len(slug) % 17)
    bonus = min(len(profile["strengths"]) * 2, 10)
    return min(base + bonus, 94)


def analyze_linkedin_profile(profile_url: str) -> LinkedInResult:
    slug, normalized_url = _extract_slug(profile_url)
    profile = _pick_profile(slug, normalized_url)
    score = _score_from_profile(profile, slug)

    skill_gaps = [
        SkillGap(skill=skill, severity=severity, recommendation=recommendation)
        for skill, severity, recommendation in profile["gaps"]
    ]

    demand = [
        MarketDemandItem(skill=skill, demand=demand)
        for skill, demand in MARKET_DEMAND[:4]
    ]

    return LinkedInResult(
        analysisId=f"li-{uuid.uuid4().hex[:8]}",
        profileUrl=normalized_url,
        name=_name_from_slug(slug),
        headline=profile["headline"],
        overallScore=score,
        skillGaps=skill_gaps,
        strengths=profile["strengths"],
        marketDemand=demand,
    )
