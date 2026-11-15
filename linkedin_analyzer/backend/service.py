import io
import re
import uuid
from pathlib import Path
from urllib.parse import urlparse

import pypdf

from .schemas import (
    CertificationItem,
    ContactInfo,
    EducationItem,
    ExperienceItem,
    LinkedInResult,
    MarketDemandItem,
    SkillGap,
)

# Common technical keywords to identify real engineering proficiencies from resume text
TECH_KEYWORDS = [
    "Python", "FastAPI", "Django", "Flask", "JavaScript", "TypeScript", "React", "React.js",
    "Next.js", "Node.js", "Express.js", "Vue.js", "Angular", "HTML", "HTML5", "CSS", "CSS3",
    "Tailwind CSS", "Bootstrap", "C", "C++", "C#", ".NET", "Java", "Spring Boot", "Go",
    "Golang", "Rust", "PHP", "Ruby", "Ruby on Rails", "Swift", "Kotlin", "SQL", "PostgreSQL",
    "MySQL", "SQLite", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Firebase", "Supabase",
    "Docker", "Kubernetes", "AWS", "Amazon Web Services", "Microsoft Azure", "Google Cloud",
    "GCP", "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Git", "GitHub", "Linux",
    "Unix", "Bash", "Shell Scripting", "REST APIs", "GraphQL", "gRPC", "Microservices",
    "System Design", "Distributed Systems", "Machine Learning", "Deep Learning", "Artificial Intelligence",
    "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "OpenCV", "NLP",
    "Computer Vision", "Automated Testing", "Unit Testing", "Jest", "Vitest", "Pytest",
    "Cypress", "Playwright", "Selenium", "Kafka", "RabbitMQ", "Celery", "WebSockets",
    "OAuth", "JWT", "Elasticsearch", "Figma", "UI/UX Design", "Agile", "Scrum",
    "Wireshark", "Network Security", "Firewalls"
]

KNOWN_ISSUERS = [
    "Red Hat", "Microsoft", "Google", "AWS", "Amazon Web Services", "Coursera", "Udemy",
    "edX", "Cisco", "Oracle", "IBM", "Meta", "HackerRank", "LinkedIn", "FreeCodeCamp",
    "CompTIA", "Docker", "Kubernetes", "Linux Foundation", "Stanford", "Harvard",
    "DeepLearning.AI", "Kaggle", "Salesforce", "Postman", "Alibaba Cloud", "Databricks"
]

SECTION_HEADERS = {
    "contact", "contact info", "top skills", "skills", "technical skills", "certifications",
    "licenses & certifications", "summary", "about", "professional summary", "profile",
    "experience", "work experience", "professional experience", "education", "academic background",
    "projects", "personal projects", "academic projects", "key projects",
    "languages", "honors", "awards", "publications", "patents", "organizations", "volunteering", "volunteer"
}

CONTINUATION_SUFFIXES = ("-", "–", ":", "in", "for", "of", "to", "with", "and", "&", "on", "at")


def _is_valid_location(line: str) -> bool:
    cleaned = line.strip()
    if not cleaned or len(cleaned) > 60:
        return False
    lower = cleaned.lower()
    if any(char in cleaned for char in "@:0123456789") or "linkedin.com" in lower or "page " in lower:
        return False
    if any(w in lower for w in ("area", "city", "state", "india", "united states", "usa", "uk", "canada", "germany", "france", "australia")):
        return True
    if "," in cleaned and len(cleaned.split(",")) in (2, 3, 4):
        return True
    return False


def _is_continuation(line: str) -> bool:
    r = line.rstrip()
    return any(r.endswith(s) for s in CONTINUATION_SUFFIXES) or any(r.lower().endswith(" " + s) for s in CONTINUATION_SUFFIXES)


def _is_likely_issuer(text: str) -> bool:
    cleaned = text.strip()
    if not cleaned or len(cleaned) > 50 or _is_continuation(cleaned):
        return False
    lower = cleaned.lower()
    words = set(re.findall(r"[a-zA-Z]+", lower))
    if words & {"certified", "specialist", "fundamentals", "training", "engineer", "development", "associate"}:
        return False
    for iss in KNOWN_ISSUERS:
        if iss.lower() == lower:
            return True
        if lower.startswith(iss.lower()) and len(lower) <= len(iss) + 12:
            return True
    if any(k in lower for k in ("university", "institute", "college", "academy", "school", "foundation")):
        return True
    return False


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all readable text across all pages of an uploaded PDF."""
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


def _extract_contact(text: str, context_url: str | None = None) -> ContactInfo:
    """Extract email, phone, location, and LinkedIn profile URL from PDF text."""
    # Email
    email_match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b", text)
    email = email_match.group(0) if email_match else None

    # LinkedIn URL
    li_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_\-]+)", text, re.IGNORECASE)
    slug = li_match.group(1).rstrip("/") if li_match else None
    if slug:
        linkedin_url = f"https://www.linkedin.com/in/{slug}"
    else:
        linkedin_url = context_url.strip() if context_url and context_url.strip() else None

    # Blocked patterns (LinkedIn slugs/URLs) to ensure URL digits are never mistaken for a contact number
    blocked_patterns: list[str] = []
    if slug:
        blocked_patterns.append(slug.lower())
    if context_url:
        ctx_m = re.search(r"linkedin\.com/in/([a-zA-Z0-9_\-]+)", context_url, re.IGNORECASE)
        if ctx_m:
            blocked_patterns.append(ctx_m.group(1).rstrip("/").lower())

    def is_valid_phone(cand: str, is_labeled: bool = False) -> bool:
        cand_clean = cand.strip(" ,;:-|()")
        digits = re.sub(r"\D", "", cand_clean)

        # Phone numbers must have at least 10 digits unless explicitly labeled
        if is_labeled:
            if not (7 <= len(digits) <= 15):
                return False
        else:
            if not (10 <= len(digits) <= 15):
                return False

        # Reject date ranges (e.g. 2018-2022, 1999 - 2003)
        if len(digits) == 8:
            d1, d2 = int(digits[:4]), int(digits[4:])
            if 1950 <= d1 <= 2050 and 1950 <= d2 <= 2050:
                return False

        # Reject single year or zip codes if not labeled
        if len(digits) <= 5 and 1950 <= int(digits) <= 2050:
            return False

        # Reject all repeated digits (e.g. 0000000000)
        if len(set(digits)) <= 1:
            return False

        # Ensure candidate does not originate from LinkedIn URL slug or its numeric ID
        cand_lower = cand_clean.lower()
        for b in blocked_patterns:
            if cand_lower in b or b in cand_lower:
                return False
            b_digits = re.sub(r"\D", "", b)
            if b_digits and (digits == b_digits or digits in b_digits or (len(b_digits) >= 6 and b_digits in digits)):
                return False

        return True

    # Phone extraction
    phone = None

    # 1. Check for explicit LinkedIn PDF mobile/home/work phone tag:
    # e.g. "+1 555-123-4567 (Mobile)" or "9876543210 (Mobile)"
    li_phone_match = re.search(r"(?i)([+\d][\d\s().-]{6,20})\s*\((?:Mobile|Home|Work|Cell)\)", text)
    if li_phone_match:
        cand = li_phone_match.group(1).strip()
        if is_valid_phone(cand, is_labeled=True):
            phone = cand

    # 2. Check for explicit resume phone labels:
    # e.g. "Phone: +1 555-123-4567", "Tel: (555) 123-4567", "Mobile: 9876543210"
    if not phone:
        label_match = re.search(r"(?i)(?:phone|tel|telephone|mobile|cell)\s*[:#.-]?\s*([+\d][\d\s().-]{6,22})", text)
        if label_match:
            cand = label_match.group(1).strip()
            if is_valid_phone(cand, is_labeled=True):
                phone = cand

    # 3. If not found, sanitize text by removing URLs and email addresses so their digits/IDs are never matched
    if not phone:
        cleaned = text
        # Remove LinkedIn URLs, (LinkedIn) tag, and slugs
        cleaned = re.sub(r"(?i)[^\s()|]*linkedin\.com/[^\s()|]+", " ", cleaned)
        cleaned = re.sub(r"(?i)\S+\s*\(LinkedIn\)", " ", cleaned)
        cleaned = re.sub(r"(?i)\(LinkedIn\)", " ", cleaned)
        if slug:
            cleaned = re.sub(re.escape(slug), " ", cleaned, flags=re.IGNORECASE)

        # Remove other URLs and emails
        cleaned = re.sub(r"https?://\S+", " ", cleaned)
        cleaned = re.sub(r"(?i)\b(?:www\.)[a-z0-9.-]+\.[a-z]{2,}(?:/[^\s()|]*)?", " ", cleaned)
        cleaned = re.sub(r"(?i)\b[a-z0-9.-]+(?:github|gitlab|behance|medium)\.com/[^\s()|]*", " ", cleaned)
        cleaned = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b", " ", cleaned)

        # Contact info on resumes resides in top header section (top 35 lines)
        header_lines = [l.strip() for l in cleaned.splitlines() if l.strip()][:35]
        header_text = "\n".join(header_lines)

        # Pattern a: International formatted number (+1 555-123-4567, +91 98765 43210, +44 7123 456789)
        intl_match = re.search(r"\+(?:[0-9]{1,3})[\s.-]?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}\b", header_text)
        if intl_match:
            cand = intl_match.group(0).strip()
            if is_valid_phone(cand):
                phone = cand

        # Pattern b: Standard US / formatted phone ((555) 123-4567, 555-123-4567, 555.123.4567)
        if not phone:
            std_match = re.search(r"(?:\(?\d{3}\)?[\s.-])\d{3}[\s.-]\d{4}\b", header_text)
            if std_match:
                cand = std_match.group(0).strip()
                if is_valid_phone(cand):
                    phone = cand

        # Pattern c: 10-digit mobile number (standard in India, UK, etc. starting with 6,7,8,9)
        if not phone:
            mob_match = re.search(r"\b[6-9]\d{9}\b", header_text)
            if mob_match:
                cand = mob_match.group(0).strip()
                if is_valid_phone(cand):
                    phone = cand

    # Location heuristic (searches near Summary/Experience first, then top lines)
    location = None
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    summary_idx = -1
    for i, line in enumerate(lines):
        if line.lower() in ("summary", "about", "professional summary", "profile", "experience", "work experience"):
            summary_idx = i
            break

    if summary_idx > 0:
        for line in reversed(lines[max(0, summary_idx - 6) : summary_idx]):
            if _is_valid_location(line):
                location = line
                break

    if not location:
        for line in lines[:40]:
            if _is_valid_location(line):
                location = line
                break

    return ContactInfo(
        email=email,
        phone=phone,
        linkedinUrl=linkedin_url,
        location=location,
    )


def _extract_name_and_headline(
    text: str,
    context_name: str | None = None,
    slug: str | None = None,
    email: str | None = None,
) -> tuple[str, str]:
    """Extract candidate full name and professional headline from PDF text."""
    raw_lines = [l.strip() for l in text.splitlines() if l.strip()]
    name = (context_name or "").strip()
    headline = ""

    # 1. LinkedIn Multi-page Running Header e.g. "Name - page 2"
    if not name:
        for line in raw_lines:
            m = re.search(r"^([A-Za-z\s.'-]{2,40}?)\s*[-–]\s*page\s*\d+", line, re.IGNORECASE)
            if m:
                cand = m.group(1).strip()
                if 2 <= len(cand.split()) <= 4 and cand.lower() not in SECTION_HEADERS:
                    name = cand
                    break

    # 2. Extract tokens from email / slug to help match candidate name
    slug_tokens = set(re.findall(r"[a-zA-Z]{3,}", (slug or "").lower()))
    email_tokens = set(re.findall(r"[a-zA-Z]{3,}", (email or "").split("@")[0].lower()))
    id_tokens = slug_tokens | email_tokens

    # 3. Locate Summary or Experience section
    summary_idx = -1
    for i, line in enumerate(raw_lines):
        if line.lower() in ("summary", "about", "professional summary", "profile"):
            summary_idx = i
            break
    if summary_idx == -1:
        for i, line in enumerate(raw_lines):
            if line.lower() in ("experience", "work experience", "professional experience"):
                summary_idx = i
                break

    header_block: list[str] = []
    if summary_idx > 0:
        for j in range(max(0, summary_idx - 6), summary_idx):
            l = raw_lines[j]
            lower = l.lower()
            if lower in SECTION_HEADERS or any(lower.startswith(w) for w in ("page ", "contact", "http", "www.")):
                continue
            if any(c in l for c in "@/:0123456789"):
                continue
            header_block.append(l)

        # Identify candidate name from header block
        if not name and header_block:
            for cand in header_block:
                if _is_valid_location(cand):
                    continue
                cand_lower = cand.lower()
                is_tech = any(cand_lower == tk.lower() for tk in TECH_KEYWORDS)
                parts = cand.split()
                if not is_tech and 2 <= len(parts) <= 4:
                    cand_words = set(re.findall(r"[a-zA-Z]{3,}", cand_lower))
                    if id_tokens and (cand_words & id_tokens):
                        name = cand
                        break
                    elif not name:
                        name = cand

        # Identify headline from line directly following candidate name in header block
        if name and name in header_block:
            name_idx = header_block.index(name)
            subsequent = header_block[name_idx + 1 :]
            for cand in subsequent:
                if not _is_valid_location(cand) and len(cand) < 90:
                    headline = cand
                    break

    # 4. Fallback for Traditional Resumes (Name in top lines)
    if not name and raw_lines:
        for line in raw_lines[:8]:
            lower = line.lower()
            if lower in SECTION_HEADERS or any(w in lower for w in ("contact", "page", "linkedin", "www.", "email", "phone", "curriculum", "resume")):
                continue
            if any(char in line for char in "@/:0123456789") or _is_valid_location(line):
                continue
            is_tech = any(lower == tk.lower() for tk in TECH_KEYWORDS)
            if is_tech:
                continue
            parts = line.split()
            if 2 <= len(parts) <= 4 and len(line) < 40:
                name = line
                idx = raw_lines.index(line)
                if idx + 1 < len(raw_lines) and not _is_valid_location(raw_lines[idx + 1]) and len(raw_lines[idx + 1]) < 80:
                    headline = raw_lines[idx + 1]
                break

    name = name or "Candidate Profile"

    # Default headline fallback
    if not headline:
        headline = "Software Engineer & Developer"
        for line in raw_lines[:25]:
            if line == name or any(char in line for char in "@/:0123456789") or _is_valid_location(line):
                continue
            lower = line.lower()
            if lower in SECTION_HEADERS or any(w in lower for w in ("contact", "page", "linkedin", "email", "phone", "summary", "top skills", "certifications", "licenses & certifications")):
                continue
            if any(k in lower for k in ("engineer", "developer", "student", "architect", "lead", "scientist", "manager", "designer", "intern", "consultant", "analyst")):
                headline = line
                break

    return name, headline


def _extract_skills(text: str) -> list[str]:
    """Extract clean, deduplicated skills mentioned in the PDF."""
    found_skills: list[str] = []
    seen = set()

    # 1. Look for explicit Top Skills / Skills section
    skills_section_match = re.search(
        r"(?:Top Skills|Technical Skills|Core Competencies|Key Skills|Skills)\s*\n([\s\S]*?)(?=\n\s*(?:Summary|Experience|Certifications|Education|Languages|Projects|Honors|$))",
        text,
        re.IGNORECASE,
    )
    if skills_section_match:
        section_text = skills_section_match.group(1)
        for line in section_text.splitlines():
            clean_line = re.sub(r"\(.*?\)", "", line).strip()  # remove (Programming Language), etc.
            clean_line = clean_line.lstrip("•-*•● ").strip()
            if clean_line and len(clean_line) < 40 and not any(w in clean_line.lower() for w in ("page", "linkedin", "contact", "email")):
                if clean_line.lower() not in seen:
                    seen.add(clean_line.lower())
                    found_skills.append(clean_line)

    # 2. Match against common tech keywords throughout text
    for kw in TECH_KEYWORDS:
        if kw.lower() not in seen:
            pattern = rf"\b{re.escape(kw)}\b"
            if re.search(pattern, text, re.IGNORECASE):
                seen.add(kw.lower())
                found_skills.append(kw)

    return found_skills[:24]


def _extract_summary(text: str, name: str, headline: str, skills: list[str]) -> str:
    """
    Extract or synthesize a concise 2 to 3 line summary reflecting the candidate's real profile.
    Per user request: 'The summary should be only two to three lines'.
    """
    # Check for an explicit Summary or About section
    summary_match = re.search(
        r"(?:Summary|About|Professional Summary|Profile)\s*\n([\s\S]*?)(?=\n\s*(?:Experience|Work Experience|Education|Certifications|Skills|Top Skills|Projects|$))",
        text,
        re.IGNORECASE,
    )

    if summary_match:
        raw_summary = summary_match.group(1).strip()
        # Clean lines and remove page headers
        cleaned_lines = [
            l.strip() for l in raw_summary.splitlines()
            if l.strip() and not any(w in l.lower() for w in ("page ", "linkedin.com", "contact"))
        ]
        joined = " ".join(cleaned_lines)
        # Split into sentences
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", joined) if s.strip()]
        if len(sentences) >= 2:
            return " ".join(sentences[:3])
        elif len(sentences) == 1 and len(sentences[0]) > 60:
            return sentences[0]

    # Synthesize concise 2-3 line summary based on extracted profile data
    top_3_skills = ", ".join(skills[:3]) if skills else "modern software engineering"
    line1 = f"Accomplished {headline} with proven hands-on technical proficiency across {top_3_skills}."
    line2 = "Experienced in designing and delivering resilient applications, writing maintainable code, and driving end-to-end technical execution."
    line3 = "Dedicated to continuous learning, engineering best practices, and scalable architectural problem solving."

    return f"{line1} {line2} {line3}"


def _extract_experience(text: str) -> list[ExperienceItem]:
    """Parse work experience entries (Company, Title, Duration, Description)."""
    exp_match = re.search(
        r"(?:Experience|Work Experience|Professional Experience)\s*\n([\s\S]*?)(?=\n\s*(?:Education|Certifications|Licenses & Certifications|Languages|Skills|Honors|$))",
        text,
        re.IGNORECASE,
    )
    if not exp_match:
        return []

    exp_text = exp_match.group(1).strip()
    lines = [l.strip() for l in exp_text.splitlines() if l.strip() and not l.lower().startswith("page ")]

    items: list[ExperienceItem] = []
    current_company = ""
    current_title = ""
    current_duration = ""
    current_desc_lines: list[str] = []

    # Regex pattern to match date ranges e.g. "January 2023 - Present (1 year 2 months)" or "2021 - 2023"
    date_pattern = re.compile(
        r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{4})\b.*?(?:Present|\d{4})",
        re.IGNORECASE,
    )

    i = 0
    while i < len(lines):
        line = lines[i]

        # Check if line contains a date range (indicating a job entry)
        if date_pattern.search(line):
            duration = line

            # Preceding 1 or 2 lines usually contain Title and Company
            title = "Software Engineer"
            company = "Technology Organization"

            if i >= 2 and len(lines[i - 2]) < 60:
                company = lines[i - 2]
                title = lines[i - 1]
            elif i >= 1 and len(lines[i - 1]) < 60:
                title = lines[i - 1]
                company = current_company or "Company"

            # Clean descriptions until the next entry
            desc_bullets = []
            j = i + 1
            while j < len(lines):
                next_line = lines[j]
                if date_pattern.search(next_line):
                    break
                # Skip location or short dates
                if len(next_line) > 15:
                    desc_bullets.append(next_line.lstrip("•-*– "))
                j += 1

            desc_text = " ".join(desc_bullets[:4])

            items.append(ExperienceItem(
                title=title,
                company=company,
                duration=duration,
                description=desc_text,
            ))

            current_company = company
            i = j - 1
        i += 1

    return items[:5]


def _extract_education(text: str) -> list[EducationItem]:
    """Parse educational institutions, degrees, fields, and graduation years."""
    edu_match = re.search(
        r"(?:^|\n)\s*(?:Education|Academic Background)\s*\n([\s\S]*?)(?=(?:\n\s*(?:Experience|Work Experience|Certifications|Licenses & Certifications|Languages|Skills|Top Skills|Projects|Honors|Volunteer|Courses|Organizations|Patents|Publications))|\Z)",
        text,
        re.IGNORECASE,
    )
    if not edu_match:
        return []

    edu_text = edu_match.group(1).strip()
    raw_lines = [l.strip() for l in edu_text.splitlines() if l.strip()]
    lines = [
        l for l in raw_lines
        if not re.search(r"Page\s+\d+\s+of\s+\d+", l, re.IGNORECASE)
        and not re.search(r"^page\s+\d+", l, re.IGNORECASE)
    ]

    items: list[EducationItem] = []
    degree_keywords = ("bachelor", "master", "btech", "b.tech", "b.e.", "b.s.", "m.s.", "degree", "diploma", "doctor", "phd", "associate", "higher secondary", "hsc", "ssc")
    institution_keywords = ("university", "college", "institute", "school", "academy", "polytechnic", "iit", "nit", "bits", "vidyaniketan")

    i = 0
    while i < len(lines):
        line = lines[i].replace('\xa0', ' ').strip()
        if not line:
            i += 1
            continue

        inst = line
        degree = "Degree / Studies"
        field = ""
        year = ""

        if i + 1 < len(lines):
            next_l = lines[i + 1].replace('\xa0', ' ').strip()
            # Extract parenthesized or middle-dot dates from line
            m_date = re.search(r"[·•]?\s*\(([^)]+)\)", next_l)
            if m_date:
                year = m_date.group(1).strip()
                next_l = next_l[:m_date.start()].strip()
            m_dot = re.search(r"[·•]\s*(.*)$", next_l)
            if m_dot:
                if not year:
                    year = m_dot.group(1).strip()
                next_l = next_l[:m_dot.start()].strip()

            parts = [p.strip() for p in next_l.split(",") if p.strip()]
            if parts:
                degree = parts[0]
                if len(parts) > 1:
                    field = ", ".join(parts[1:])
            elif next_l:
                degree = next_l

            # Check if line i+2 contains graduation year
            if not year and i + 2 < len(lines):
                l3 = lines[i + 2].replace('\xa0', ' ').strip()
                if re.search(r"\b(20\d\d|19\d\d)\b", l3) and len(l3) < 45:
                    year = l3.strip("() ·•")
                    i += 1
            i += 2
        else:
            i += 1

        # Check if degree was on first line and institution on second
        i_low = inst.lower()
        d_low = degree.lower()
        if any(k in i_low for k in degree_keywords) and any(k in d_low for k in institution_keywords):
            inst, degree = degree, inst

        items.append(EducationItem(
            degree=degree,
            institution=inst,
            year=year,
            fieldOfStudy=field,
        ))

    # Deduplication
    deduped = []
    seen = set()
    for item in items:
        key = (item.institution.lower(), item.degree.lower())
        if key not in seen:
            seen.add(key)
            deduped.append(item)

    return deduped[:6]


def _extract_certifications(text: str, candidate_name: str | None = None) -> list[CertificationItem]:
    """Parse licenses and certifications from PDF text cleanly without swallowing other sections or candidate name."""
    lookahead_patterns = [
        r"Languages",
        r"Top Skills",
        r"Skills",
        r"Education",
        r"Academic Background",
        r"Experience",
        r"Work Experience",
        r"Professional Experience",
        r"Honors(?:-Awards|\s*&\s*Awards)?",
        r"Awards",
        r"Publications",
        r"Patents",
        r"Organizations",
        r"Volunteer(?:\s*Experience)?",
        r"Volunteering",
        r"Summary",
        r"About",
        r"Profile",
        r"Professional Summary",
        r"Overview",
        r"Contact(?:\s*Info)?",
        r"(?:Real\s+|Personal\s+|Academic\s+|Key\s+)?Projects",
    ]
    if candidate_name and candidate_name != "Candidate Profile":
        lookahead_patterns.append(rf"{re.escape(candidate_name)}")
        lookahead_patterns.append(rf"{re.escape(candidate_name.upper())}")

    boundary_regex = "|".join(lookahead_patterns)
    cert_match = re.search(
        rf"(?:Licenses & Certifications|Certifications|Certificates)\s*\n([\s\S]*?)(?=\n\s*(?:{boundary_regex}|\Z))",
        text,
        re.IGNORECASE,
    )
    if not cert_match:
        return []

    cert_text = cert_match.group(1).strip()
    raw_lines = [l.strip() for l in cert_text.splitlines() if l.strip()]

    name_tokens = (
        set(re.findall(r"[a-zA-Z]{3,}", candidate_name.lower()))
        if candidate_name and candidate_name != "Candidate Profile"
        else set()
    )

    clean_lines: list[str] = []
    for line in raw_lines:
        lower = line.lower()
        if lower in SECTION_HEADERS:
            break
        if name_tokens and any(tok in lower for tok in name_tokens) and len(lower.split()) <= 4:
            break
        if _is_valid_location(line):
            break
        if any(lower.startswith(w) for w in ("page ", "contact", "http://", "https://", "www.")):
            continue
        clean_lines.append(line)

    items: list[CertificationItem] = []
    i = 0
    date_regex = re.compile(r"\b(?:Issued|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\b.*", re.IGNORECASE)
    cred_regex = re.compile(r"Credential ID\s*.*", re.IGNORECASE)

    while i < len(clean_lines):
        line = clean_lines[i]

        if _is_continuation(line) and i + 1 < len(clean_lines):
            if line.rstrip().endswith(("-", "–")):
                cert_name = f"{line.rstrip(' -–:')} - {clean_lines[i + 1].strip()}"
            else:
                cert_name = f"{line.strip()} {clean_lines[i + 1].strip()}"
            i += 2
        else:
            cert_name = line.strip()
            i += 1

        issuer = ""
        issue_date = ""

        while i < len(clean_lines):
            nxt = clean_lines[i]
            if date_regex.search(nxt):
                issue_date = date_regex.search(nxt).group(0)
                i += 1
            elif cred_regex.search(nxt):
                i += 1
            elif _is_likely_issuer(nxt) and not issuer:
                issuer = nxt
                i += 1
            else:
                break

        if not issuer:
            for iss in KNOWN_ISSUERS:
                if iss.lower() in cert_name.lower():
                    issuer = iss
                    break

        if not issuer:
            issuer = "Verified Credential"

        # Final sanity check: never add section headers or candidate name as certification
        c_low = cert_name.lower()
        if c_low not in SECTION_HEADERS and not (name_tokens and any(tok in c_low for tok in name_tokens) and len(c_low.split()) <= 4):
            items.append(CertificationItem(
                name=cert_name,
                issuer=issuer,
                issueDate=issue_date,
            ))

    return items[:6]


def analyze_linkedin_pdf(
    file_bytes: bytes,
    context_name: str | None = None,
    context_url: str | None = None,
) -> LinkedInResult:
    """
    Parse uploaded LinkedIn PDF into a comprehensive, highly personalized candidate dossier:
    - Candidate Name & Headline
    - 2 to 3 Line Professional Summary
    - Full Contact Details (Email, Phone, Location, Profile Link)
    - Skills & Competencies
    - Professional Experience Timeline
    - Academic History / Education
    - Licenses & Certifications
    """
    text = extract_text_from_pdf(file_bytes)
    if not text.strip():
        raise ValueError("The uploaded PDF appears to be empty or unreadable. Please upload a valid LinkedIn PDF export or resume.")

    # 1. Contact Information
    contact = _extract_contact(text, context_url=context_url)
    if context_url and context_url.strip():
        contact.linkedinUrl = context_url.strip()

    # Extract LinkedIn slug from URL
    slug = None
    if contact.linkedinUrl:
        sm = re.search(r"linkedin\.com/in/([a-zA-Z0-9_\-]+)", contact.linkedinUrl, re.IGNORECASE)
        if sm:
            slug = sm.group(1).rstrip("/")

    # 2. Name & Headline
    name, headline = _extract_name_and_headline(text, context_name, slug=slug, email=contact.email)

    # 3. Skills
    skills = _extract_skills(text)

    # 4. Experience & Education & Certifications
    experience = _extract_experience(text)
    education = _extract_education(text)
    certifications = _extract_certifications(text, candidate_name=name)

    # 5. Concise 2-3 line Summary
    summary = _extract_summary(text, name, headline, skills)

    # Profile URL fallback
    if contact.linkedinUrl:
        profile_url = contact.linkedinUrl
    else:
        slug = re.sub(r"[^a-zA-Z0-9-]", "-", name.lower()).strip("-")
        profile_url = f"https://www.linkedin.com/in/{slug or 'profile'}"
        contact.linkedinUrl = profile_url

    # Calculate overall candidate readiness score based on comprehensive profile fullness
    score = 70
    score += min(len(skills) * 1, 12)
    score += min(len(experience) * 4, 10)
    score += 5 if education else 0
    score += 4 if certifications else 0
    final_score = min(max(score, 65), 98)

    return LinkedInResult(
        analysisId=f"li-pdf-{uuid.uuid4().hex[:8]}",
        profileUrl=profile_url,
        name=name,
        headline=headline,
        summary=summary,
        contact=contact,
        skills=skills,
        certifications=certifications,
        experience=experience,
        education=education,
        overallScore=final_score,
        strengths=skills[:8],  # Synchronize strengths for ChatBot and Roadmap integrations
        skillGaps=[],          # Removed generic canned gap recommendations per user request
        marketDemand=[],       # Removed generic market progress bars per user request
    )


def analyze_linkedin_profile(profile_input: str) -> LinkedInResult:
    """Fallback profile handler if invoked directly."""
    if not profile_input or not profile_input.strip():
        raise ValueError("Profile input cannot be empty.")

    raw = profile_input.strip()
    slug = re.sub(r"[^a-zA-Z0-9-]", "-", raw.lower()).strip("-") or "developer"
    name = " ".join(p.capitalize() for p in slug.split("-") if p) or "Candidate Profile"

    return LinkedInResult(
        analysisId=f"li-{uuid.uuid4().hex[:8]}",
        profileUrl=f"https://www.linkedin.com/in/{slug}",
        name=name,
        headline="Software Engineer & Technology Professional",
        summary="Engineering professional dedicated to building modern software solutions. Hands-on experience developing robust backend services and interactive frontend interfaces.",
        contact=ContactInfo(linkedinUrl=f"https://www.linkedin.com/in/{slug}"),
        skills=["Python", "JavaScript", "React", "REST APIs", "Git"],
        certifications=[],
        experience=[],
        education=[],
        overallScore=80,
        strengths=["Python", "JavaScript", "React", "REST APIs", "Git"],
        skillGaps=[],
        marketDemand=[],
    )
