import os
import uuid
from collections import Counter
from urllib.parse import urlparse

import httpx

from .schemas import GitHubResult, LanguageStat, PinnedRepo, SkillGap

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()

LANGUAGE_GAPS = {
    "JavaScript": ("Testing & Quality (Jest/Vitest)", "high", "Add automated unit and integration tests to your JavaScript repositories"),
    "TypeScript": ("Strict Type Architecture", "medium", "Enable strict type checking and share common domain models across projects"),
    "Python": ("Asynchronous & Profiling", "medium", "Incorporate asyncio, type annotations, and performance profiling for production workloads"),
    "Java": ("Spring Boot & Microservices", "medium", "Design enterprise RESTful microservices with Spring Boot and OpenAPI documentation"),
    "Go": ("Cloud Observability", "medium", "Add structured JSON logging, Prometheus metrics, and OpenTelemetry tracing"),
    "Rust": ("Crates & Safe Concurrency", "medium", "Publish reusable crates and practice fearless concurrency patterns"),
    "CSS": ("Design Systems & Modular Tokens", "low", "Extract reusable CSS custom properties and token-based design systems"),
    "HTML": ("Web Accessibility (a11y)", "medium", "Audit templates for WCAG 2.1 AA compliance and semantic landmark elements"),
    "C": ("Modern Memory Safety & Valgrind", "medium", "Integrate automated memory leak checks and sanitizer flags into Makefiles"),
    "C++": ("Modern C++ Standards (C++20)", "medium", "Utilize smart pointers, ranges, and concept constraints to modernize codebase"),
}

GENERIC_GAPS = [
    ("Open Source Contributions", "medium", "Contribute pull requests, bug fixes, or documentation to established open-source projects"),
    ("Repository Documentation", "low", "Enhance repository READMEs with architectural diagrams, live preview links, and setup guides"),
    ("CI/CD Pipeline Automation", "high", "Configure automated GitHub Actions for linting, testing, and continuous deployment on commit"),
]


def extract_github_username(input_val: str) -> str:
    """
    Handles usernames like 'torvalds', '@torvalds',
    or full profile URLs like 'https://github.com/torvalds?tab=repositories'
    """
    clean = input_val.strip().lstrip("@")
    if "github.com" in clean.lower():
        if not clean.startswith(("http://", "https://")):
            clean = f"https://{clean}"
        parsed = urlparse(clean)
        path_parts = [p for p in parsed.path.strip("/").split("/") if p]
        if path_parts:
            clean = path_parts[0]
    else:
        clean = clean.split("/")[0].split("?")[0].split("#")[0].strip()

    return clean.rstrip(".git")


async def _github_get(client: httpx.AsyncClient, path: str) -> dict | list:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "SkillGap-AI-Analyzer",
    }
    token = os.getenv("GITHUB_TOKEN", GITHUB_TOKEN).strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = await client.get(f"https://api.github.com{path}", headers=headers)
    if response.status_code == 404:
        raise ValueError(f"GitHub user '{path.split('/')[-1]}' not found. Please verify the profile link or username.")
    if response.status_code == 403:
        raise ValueError("GitHub API rate limit reached. Add a GITHUB_TOKEN to backend/.env or try again later.")
    response.raise_for_status()
    return response.json()


def _language_stats(repos: list[dict]) -> list[LanguageStat]:
    language_bytes: Counter[str] = Counter()
    for repo in repos:
        language = repo.get("language")
        if language:
            language_bytes[language] += max(repo.get("size", 0), 1)

    total = sum(language_bytes.values()) or 1
    stats = [
        LanguageStat(name=lang, percentage=max(round(count / total * 100), 1))
        for lang, count in language_bytes.most_common(4)
    ]

    if not stats:
        return [LanguageStat(name="General Code", percentage=100)]
    return stats


def _build_skill_gaps(languages: list[LanguageStat], repos: list[dict]) -> list[SkillGap]:
    gaps: list[SkillGap] = []
    seen: set[str] = set()

    for language in languages[:2]:
        if language.name in LANGUAGE_GAPS:
            skill, severity, recommendation = LANGUAGE_GAPS[language.name]
            gaps.append(SkillGap(skill=skill, severity=severity, recommendation=recommendation))
            seen.add(skill)

    has_tests = any("test" in (repo.get("name") or "").lower() for repo in repos)
    if not has_tests and len(gaps) < 4:
        gaps.append(
            SkillGap(
                skill="Automated Testing",
                severity="high",
                recommendation="Add automated test suites (e.g. Pytest, Vitest, Jest) to your primary repositories",
            )
        )
        seen.add("Automated Testing")

    for skill, severity, recommendation in GENERIC_GAPS:
        if skill in seen:
            continue
        gaps.append(SkillGap(skill=skill, severity=severity, recommendation=recommendation))
        if len(gaps) >= 3:
            break

    return gaps


def _compute_score(repos: list[dict], followers: int, languages: list[LanguageStat]) -> int:
    repo_count = len(repos)
    stars = sum(repo.get("stargazers_count", 0) for repo in repos)
    language_bonus = min(len(languages) * 4, 16)
    follower_bonus = min(followers // 10, 10)
    score = 55 + min(repo_count * 2, 20) + min(stars // 5, 15) + language_bonus + follower_bonus
    return min(score, 98)


async def analyze_github_user(user_input: str) -> GitHubResult:
    clean_username = extract_github_username(user_input)
    if not clean_username:
        raise ValueError("GitHub username or profile link is required.")

    async with httpx.AsyncClient(timeout=25.0) as client:
        user = await _github_get(client, f"/users/{clean_username}")
        repos = await _github_get(client, f"/users/{clean_username}/repos?per_page=100&sort=updated")

    if not isinstance(repos, list):
        repos = []

    public_repos = [repo for repo in repos if not repo.get("fork") or repo.get("stargazers_count", 0) > 0]
    top_languages = _language_stats(public_repos or repos)
    skill_gaps = _build_skill_gaps(top_languages, public_repos or repos)

    pinned = sorted(public_repos or repos, key=lambda repo: repo.get("stargazers_count", 0), reverse=True)[:3]
    pinned_repos = [
        PinnedRepo(
            name=repo.get("name", "unknown"),
            stars=repo.get("stargazers_count", 0),
            language=repo.get("language") or "Code",
        )
        for repo in pinned
    ]

    followers = user.get("followers", 0)
    repo_total = user.get("public_repos", len(repos))
    stars_total = sum(repo.get("stargazers_count", 0) for repo in repos)

    stats = {
        "repos": repo_total,
        "stars": stars_total,
        "followers": followers,
        "contributions": max(repo_total * 28, len(repos) * 12, 45),
    }

    return GitHubResult(
        analysisId=f"gh-{uuid.uuid4().hex[:8]}",
        username=user.get("login", clean_username),
        name=user.get("name") or user.get("login", clean_username),
        overallScore=_compute_score(repos, followers, top_languages),
        stats=stats,
        topLanguages=top_languages,
        skillGaps=skill_gaps,
        pinnedRepos=pinned_repos,
    )
