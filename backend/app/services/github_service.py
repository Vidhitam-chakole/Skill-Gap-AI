import uuid
from collections import Counter

import httpx

from app.config import settings
from app.schemas import GitHubResult, LanguageStat, PinnedRepo, SkillGap

LANGUAGE_GAPS = {
    "JavaScript": ("Testing (Jest/Vitest)", "high", "Add unit tests to your JavaScript projects"),
    "TypeScript": ("Type Safety Patterns", "medium", "Use strict mode and shared domain types across repos"),
    "Python": ("Async / Performance", "medium", "Explore asyncio and profiling for production workloads"),
    "Java": ("Spring Boot Ecosystem", "medium", "Build a REST API with Spring Boot and document it"),
    "Go": ("Observability", "low", "Add structured logging and metrics to Go services"),
    "Rust": ("Ecosystem Integration", "medium", "Contribute to or build a CLI tool with published crates"),
    "CSS": ("Design Systems", "medium", "Create reusable component styles with tokens"),
    "HTML": ("Accessibility", "high", "Audit repos for WCAG compliance and semantic markup"),
}

GENERIC_GAPS = [
    ("Open Source Contributions", "medium", "Contribute fixes or docs to 2-3 popular OSS projects"),
    ("Documentation", "low", "Improve README files with setup, architecture, and examples"),
    ("CI/CD Pipelines", "medium", "Add GitHub Actions for test and deploy automation"),
]


async def _github_get(client: httpx.AsyncClient, path: str) -> dict | list:
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    response = await client.get(f"https://api.github.com{path}", headers=headers)
    if response.status_code == 404:
        raise ValueError("GitHub user not found. Check the username and try again.")
    if response.status_code == 403:
        raise ValueError("GitHub API rate limit reached. Try again later or add GITHUB_TOKEN.")
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
        LanguageStat(name=lang, percentage=round(count / total * 100))
        for lang, count in language_bytes.most_common(4)
    ]

    if not stats:
        return [LanguageStat(name="Unknown", percentage=100)]
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
        gaps.append(SkillGap(skill="Automated Testing", severity="high", recommendation="Add test suites to your main repositories"))

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
    return min(score, 96)


async def analyze_github_user(username: str) -> GitHubResult:
    clean_username = username.strip().lstrip("@")
    if "github.com/" in clean_username.lower():
        clean_username = clean_username.rstrip("/").split("github.com/")[-1].split("/")[0]

    async with httpx.AsyncClient(timeout=20.0) as client:
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
            language=repo.get("language") or "Unknown",
        )
        for repo in pinned
    ]

    stats = {
        "repos": user.get("public_repos", len(repos)),
        "stars": sum(repo.get("stargazers_count", 0) for repo in repos),
        "followers": user.get("followers", 0),
        "contributions": max(user.get("public_repos", 0) * 28, len(repos) * 12),
    }

    return GitHubResult(
        analysisId=f"gh-{uuid.uuid4().hex[:8]}",
        username=user.get("login", clean_username),
        name=user.get("name") or user.get("login", clean_username),
        overallScore=_compute_score(repos, stats["followers"], top_languages),
        stats=stats,
        topLanguages=top_languages,
        skillGaps=skill_gaps,
        pinnedRepos=pinned_repos,
    )
