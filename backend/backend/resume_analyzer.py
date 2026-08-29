from __future__ import annotations

import re
from typing import BinaryIO

from pypdf import PdfReader


SKILLS = {
    "Python": r"\bpython\b",
    "JavaScript": r"\bjavascript\b|\bjs\b",
    "TypeScript": r"\btypescript\b|\bts\b",
    "React": r"\breact(?:\.js)?\b",
    "Node.js": r"\bnode(?:\.js)?\b",
    "SQL": r"\bsql\b|postgres(?:ql)?|mysql",
    "Git": r"\bgit(?:hub|lab)?\b",
    "REST APIs": r"\brest(?:ful)?\b|api development",
    "Docker": r"\bdocker\b|containeri[sz]ation",
    "AWS": r"\baws\b|amazon web services",
    "Figma": r"\bfigma\b",
}

SECTION_ALIASES = {
    "About": ["about", "summary", "profile", "objective"],
    "Experience": ["experience", "employment", "work history"],
    "Education": ["education", "academic", "qualification"],
    "Certifications": ["certifications", "certificates", "licenses"],
    "Projects": ["projects", "portfolio"],
}


def extract_text(pdf_file: BinaryIO) -> str:
    reader = PdfReader(pdf_file)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    if not text.strip():
        raise ValueError("The PDF does not contain selectable text")
    return re.sub(r"[ \t]+", " ", text).strip()


def _section_status(text: str, aliases: list[str]) -> bool:
    return any(re.search(rf"(?im)^\s*{re.escape(alias)}\s*:?\s*$", text) for alias in aliases)


def _certifications(text: str) -> list[str]:
    for line in text.splitlines():
        clean = line.strip(" -*\t")
        if re.search(r"certified|certificate|certification|credential", clean, re.I):
            return [clean[:120]]
    return []


def analyze_resume(pdf_file: BinaryIO, filename: str) -> dict:
    text = extract_text(pdf_file)
    lowered = text.lower()
    skills = [name for name, pattern in SKILLS.items() if re.search(pattern, lowered)]
    found_sections = [name for name, aliases in SECTION_ALIASES.items() if _section_status(text, aliases)]
    has_email = bool(re.search(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+", text))
    has_phone = bool(re.search(r"(?:\\+?\\d[\\d ()-]{7,}\\d)", text))
    has_linkedin = "linkedin.com" in lowered
    years = [int(value) for value in re.findall(r"(?:19|20)\\d{2}", text)]
    experience_years = max(0, min(40, max(years) - min(years))) if len(years) >= 2 else 0
    certifications = _certifications(text)
    score = min(100, 35 + len(found_sections) * 8 + len(skills) * 2 + (10 if has_email else 0) + (5 if has_linkedin else 0))

    return {
        "filename": filename,
        "profile_rating": score,
        "sections_found": found_sections,
        "experience_years": experience_years,
        "skills": skills,
        "certifications": certifications,
        "education_detected": "Education" in found_sections,
        "social_activity": {
            "linkedin_url_detected": has_linkedin,
            "activity_score": 20 if has_linkedin else 0,
            "note": "A resume cannot reliably prove posting cadence or engagement."
        },
        "contact_details": {
            "email_detected": has_email,
            "phone_detected": has_phone,
        },
        "text_characters": len(text),
    }
