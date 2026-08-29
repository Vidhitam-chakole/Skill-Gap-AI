"""
LinkedIn Resume Analyzer Service

Accepts a PDF resume file, extracts text, and detects skills,
sections, certifications, and contact info. Maps the output to
the existing LinkedInResult schema used by the frontend.
"""

from __future__ import annotations

import re
import uuid
from typing import BinaryIO

from pypdf import PdfReader

from app.schemas import LinkedInResult, MarketDemandItem, SkillGap

# Skills to detect in the resume text
SKILLS_MAP = {
    "Python": (r"\bpython\b", "high", "Add advanced Python projects with async, testing, and packaging"),
    "JavaScript": (r"\bjavascript\b|\bjs\b", "medium", "Strengthen JS with ES modules, closures, and async patterns"),
    "TypeScript": (r"\btypescript\b|\bts\b", "medium", "Use strict mode and shared domain types across repos"),
    "React": (r"\breact(?:\.js)?\b", "low", "Build production-grade apps with state management and testing"),
    "Node.js": (r"\bnode(?:\.js)?\b", "medium", "Learn event loop internals, streams, and production monitoring"),
    "SQL": (r"\bsql\b|postgres(?:ql)?|mysql", "medium", "Practice complex queries, indexing, and query optimization"),
    "Git": (r"\bgit(?:hub|lab)?\b", "low", "Contribute to open source repos and master branching strategies"),
    "REST APIs": (r"\brest(?:ful)?\b|api development", "medium", "Design RESTful APIs with proper error handling and versioning"),
    "Docker": (r"\bdocker\b|containeri[sz]ation", "high", "Build multi-stage Dockerfiles and orchestrate with Compose"),
    "AWS": (r"\baws\b|amazon web services", "high", "Complete AWS Solutions Architect certification"),
    "Figma": (r"\bfigma\b", "low", "Create a design system with documented tokens and components"),
}

# Market demand scores for common skills
MARKET_DEMAND = [
    ("React", 92),
    ("TypeScript", 88),
    ("AWS", 85),
    ("Python", 79),
    ("System Design", 91),
    ("Kubernetes", 82),
    ("GraphQL", 71),
    ("DevOps", 84),
    ("Docker", 80),
    ("SQL", 75),
    ("Git", 70),
    ("REST APIs", 73),
    ("Node.js", 77),
    ("Figma", 65),
]

SECTION_ALIASES = {
    "About": ["about", "summary", "profile", "objective"],
    "Experience": ["experience", "employment", "work history"],
    "Education": ["education", "academic", "qualification"],
    "Certifications": ["certifications", "certificates", "licenses"],
    "Projects": ["projects", "portfolio"],
    "Skills": ["skills", "technical skills", "competencies"],
}


def extract_text(pdf_file: BinaryIO) -> str:
    """Extract selectable text from a PDF file."""
    reader = PdfReader(pdf_file)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    if not text.strip():
        raise ValueError("The PDF does not contain selectable text")
    return re.sub(r"[ \t]+", " ", text).strip()


def _section_status(text: str, aliases: list[str]) -> bool:
    return any(
        re.search(rf"(?im)^\s*{re.escape(alias)}\s*:?\s*$", text)
        for alias in aliases
    )


def _certifications(text: str) -> list[str]:
    found = []
    for line in text.splitlines():
        clean = line.strip(" -*\t")
        if re.search(r"certified|certificate|certification|credential", clean, re.I):
            found.append(clean[:120])
        if len(found) >= 3:
            break
    return found


def _detect_years(text: str) -> int:
    years = [int(v) for v in re.findall(r"(?:19|20)\d{2}", text)]
    if len(years) >= 2:
        return max(0, min(40, max(years) - min(years)))
    return 0


def _compute_score(
    skills_found: list[str],
    sections_found: list[str],
    has_email: bool,
    has_linkedin: bool,
    has_phone: bool,
) -> int:
    score = 35
    score += len(sections_found) * 8
    score += len(skills_found) * 2
    score += 10 if has_email else 0
    score += 5 if has_linkedin else 0
    score += 3 if has_phone else 0
    return min(100, score)


def analyze_resume(pdf_file: BinaryIO, filename: str) -> LinkedInResult:
    """
    Analyze a PDF resume and return a LinkedInResult matching
    the schema the Skill+ frontend expects.
    """
    text = extract_text(pdf_file)
    lowered = text.lower()

    # Detect skills
    detected_skills = [
        name for name, (pattern, _, _) in SKILLS_MAP.items()
        if re.search(pattern, lowered)
    ]

    # Detect sections
    found_sections = [
        name for name, aliases in SECTION_ALIASES.items()
        if _section_status(text, aliases)
    ]

    # Detect contact info
    has_email = bool(re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text))
    has_phone = bool(re.search(r"(?:\+?\d[\d ()-]{7,}\d)", text))
    has_linkedin = "linkedin.com" in lowered

    experience_years = _detect_years(text)
    certifications = _certifications(text)
    score = _compute_score(detected_skills, found_sections, has_email, has_linkedin, has_phone)

    # Build strengths from detected skills + sections
    strengths = list(detected_skills[:6])
    if "Experience" in found_sections:
        strengths.append(f"{experience_years}+ years experience" if experience_years > 0 else "Professional experience")
    if certifications:
        strengths.append(f"{len(certifications)} certification(s)")
    if not strengths:
        strengths = ["PDF Resume", "Documented Background"]

    # Build skill gaps from detected skills (areas to improve)
    skill_gaps: list[SkillGap] = []
    for skill in detected_skills:
        if skill in SKILLS_MAP:
            _, severity, recommendation = SKILLS_MAP[skill]
            # Only create a gap if there's room to improve
            if severity in ("high", "medium"):
                skill_gaps.append(SkillGap(
                    skill=f"{skill} (Advanced)",
                    severity=severity,
                    recommendation=recommendation,
                ))
    # Always suggest at least one general gap
    if not skill_gaps:
        skill_gaps.append(SkillGap(
            skill="Portfolio Visibility",
            severity="medium",
            recommendation="Showcase projects on LinkedIn and GitHub with links",
        ))

    # Market demand (only show skills the user has)
    demand = [
        MarketDemandItem(skill=skill, demand=demand)
        for skill, demand in MARKET_DEMAND
        if skill in detected_skills
    ][:6]
    # Add a few market-demand skills the user doesn't have yet as recommendations
    if len(demand) < 4:
        for skill, demand_score in MARKET_DEMAND:
            if skill not in detected_skills:
                demand.append(MarketDemandItem(skill=f"{skill} (recommended)", demand=demand_score))
                if len(demand) >= 6:
                    break

    # Build a human-readable name from filename
    name = filename.rsplit(".", 1)[0] if "." in filename else filename
    name = re.sub(r"[_-]+", " ", name).strip().title()

    # Build headline from detected info
    headline_parts = []
    if detected_skills:
        headline_parts.append(", ".join(detected_skills[:3]))
    if experience_years > 0:
        headline_parts.append(f"{experience_years}y experience")
    headline = " · ".join(headline_parts) if headline_parts else "Resume Analysis"

    return LinkedInResult(
        analysisId=f"li-{uuid.uuid4().hex[:8]}",
        profileUrl=f"resume:{filename}",
        name=name,
        headline=headline,
        overallScore=score,
        skillGaps=skill_gaps,
        strengths=strengths,
        marketDemand=demand,
    )
