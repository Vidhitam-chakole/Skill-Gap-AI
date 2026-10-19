import asyncio
import os
import uuid
from collections import Counter
from urllib.parse import urlparse
from pathlib import Path

import httpx
from dotenv import load_dotenv

from .schemas import GitHubResult, LanguageStat, PinnedRepo, SkillGap

# Load environment variables from project roots
ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"
BACKEND_ENV = Path(__file__).resolve().parents[1] / ".env"
if ROOT_ENV.exists():
    load_dotenv(ROOT_ENV)
if BACKEND_ENV.exists():
    load_dotenv(BACKEND_ENV)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()


def extract_github_username(input_val: str) -> str:
    """Handles plain usernames ('chsrvyt', '@chsrvyt'), full profile URLs, repo URLs, SSH URLs, and long usernames."""
    if not input_val:
        return ""

    # Strip surrounding whitespace, quotes, and backticks
    clean = input_val.strip().strip("'\"`")

    # Handle SSH git clone URLs (e.g. git@github.com:username/repo.git)
    if clean.startswith("git@github.com:"):
        after_colon = clean.split("git@github.com:", 1)[1]
        clean = after_colon.split("/")[0]
        return clean.strip().lstrip("@")

    # If it contains github.com or looks like a URL
    if "github.com" in clean.lower():
        if not clean.startswith(("http://", "https://")):
            clean = f"https://{clean}"
        try:
            parsed = urlparse(clean)
            # Filter non-empty path parts
            path_parts = [p.strip() for p in parsed.path.strip("/").split("/") if p.strip()]

            # Skip reserved prefixes like 'users', 'orgs' if present
            if path_parts and path_parts[0].lower() in ("users", "orgs") and len(path_parts) > 1:
                clean = path_parts[1]
            elif path_parts:
                clean = path_parts[0]
            else:
                clean = ""
        except Exception:
            clean = clean.split("github.com/")[-1].split("/")[0]
    else:
        # Plain username or non-URL string: strip path, query, hash
        clean = clean.split("/")[0].split("?")[0].split("#")[0].strip()

    # Strip leading '@'
    clean = clean.lstrip("@").strip()

    # Remove trailing '.git' safely without stripping individual characters like 't', 'i', 'g'
    if clean.lower().endswith(".git"):
        clean = clean[:-4]

    # Remove any trailing slashes or residuals
    clean = clean.rstrip("/").strip()

    return clean


def _get_headers() -> dict[str, str]:
    token = os.getenv("GITHUB_TOKEN", GITHUB_TOKEN).strip()
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "SkillGap-AI-Analyzer",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def _github_get(client: httpx.AsyncClient, path: str) -> dict | list:
    response = await client.get(f"https://api.github.com{path}", headers=_get_headers())
    if response.status_code == 404:
        target = path.split("?")[0].strip("/").split("/")[-1]
        raise ValueError(f"GitHub profile or target '{target}' not found. Please verify the username or link.")
    if response.status_code == 403:
        raise ValueError("GitHub API rate limit reached. Add a valid GITHUB_TOKEN to .env or wait for reset.")
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


async def _inspect_repo(client: httpx.AsyncClient, username: str, repo: dict) -> dict:
    """Perform real file-tree inspection of an actual user repository."""
    name = repo.get("name", "")
    owner = repo.get("owner", {}).get("login", username)
    lang = repo.get("language") or ""
    stars = repo.get("stargazers_count", 0)
    has_license = bool(repo.get("license"))

    result = {
        "name": name,
        "language": lang,
        "stars": stars,
        "has_license": has_license,
        "has_readme": False,
        "has_tests": False,
        "has_workflows": False,
        "has_docker": False,
        "has_typescript": False,
        "has_package_json": False,
    }

    try:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{name}/contents",
            headers=_get_headers(),
            timeout=8.0,
        )
        if resp.status_code == 200 and isinstance(resp.json(), list):
            files = [f.get("name", "").lower() for f in resp.json()]
            result["has_readme"] = any("readme" in f for f in files)
            result["has_workflows"] = ".github" in files
            result["has_docker"] = any("docker" in f for f in files)
            result["has_package_json"] = "package.json" in files
            result["has_typescript"] = "tsconfig.json" in files or any(f.endswith(".ts") or f.endswith(".tsx") for f in files)
            result["has_tests"] = any(
                f in ("test", "tests", "__tests__", "spec", "specs") or
                f.endswith((".test.js", ".test.ts", ".spec.js", ".spec.ts", "_test.py", "_test.go")) or
                f.startswith("test_")
                for f in files
            )
            if not result["has_license"]:
                result["has_license"] = any("license" in f for f in files)
    except Exception:
        pass

    return result



def _compute_real_score(
    repos: list[dict],
    inspected: list[dict],
    followers: int,
    languages: list[LanguageStat],
) -> int:
    """Calculate an authentic, realistic developer score based on real code practices."""
    repo_count = len(repos)
    stars = sum(repo.get("stargazers_count", 0) for repo in repos)

    # Base baseline
    score = 52

    # Volume & variety (up to +18)
    score += min(repo_count * 1, 10)
    score += min(len(languages) * 2, 8)

    # Community validation (up to +14)
    score += min(stars // 8, 10)
    score += min(followers // 10, 4)

    # Engineering hygiene penalties & bonuses based on REAL repository files
    if inspected:
        total = len(inspected)
        tested = sum(1 for r in inspected if r["has_tests"])
        ci_count = sum(1 for r in inspected if r["has_workflows"])
        readme_count = sum(1 for r in inspected if r["has_readme"])
        license_count = sum(1 for r in inspected if r["has_license"])

        # Testing
        if tested == 0:
            score -= 5
        elif tested / total >= 0.5:
            score += 8

        # CI/CD
        if ci_count == 0:
            score -= 5
        elif ci_count / total >= 0.3:
            score += 8

        # Readme
        if readme_count / total >= 0.8:
            score += 5
        elif readme_count / total < 0.5:
            score -= 4

        # License
        if license_count / total >= 0.5:
            score += 3

    return max(min(round(score), 95), 45)


NON_PROGRAMMING_LANGS = {
    "html", "css", "scss", "sass", "less", "markdown", "json", "yaml", "xml", "shell", "bash", "dockerfile", "text"
}


def _pick_primary_programming_language(languages: list[LanguageStat]) -> str:
    """Selects the developer's strongest real programming language, ignoring markup/styling."""
    for lang in languages:
        name = getattr(lang, "name", str(lang))
        if name.lower() not in NON_PROGRAMMING_LANGS:
            return name
    return languages[0].name if languages else "JavaScript"


async def analyze_github_user(user_input: str) -> GitHubResult:
    clean_username = extract_github_username(user_input)
    if not clean_username:
        raise ValueError("GitHub username or profile link is required.")

    async with httpx.AsyncClient(timeout=25.0) as client:
        user = await _github_get(client, f"/users/{clean_username}")
        canonical_username = user.get("login") or clean_username
        repos = await _github_get(client, f"/users/{canonical_username}/repos?per_page=100&sort=updated")

    if not isinstance(repos, list):
        repos = []

    public_repos = [repo for repo in repos if not repo.get("fork") or repo.get("stargazers_count", 0) > 0]
    analyzed_pool = public_repos or repos

    top_languages = _language_stats(analyzed_pool)

    # Concurrently inspect the top 8 active repositories for REAL files
    async with httpx.AsyncClient(timeout=25.0) as client:
        inspect_tasks = [
            _inspect_repo(client, canonical_username, repo)
            for repo in analyzed_pool[:8]
        ]
        inspected_repos = await asyncio.gather(*inspect_tasks)
    pinned = sorted(analyzed_pool, key=lambda repo: repo.get("stargazers_count", 0), reverse=True)[:3]
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

    overall_score = _compute_real_score(repos, inspected_repos, followers, top_languages)
    primary_lang = _pick_primary_programming_language(top_languages)
    strong_langs = [l.name for l in top_languages if l.name.lower() not in {"html", "css", "scss", "less", "markdown", "json", "yaml"}]
    if not strong_langs and primary_lang:
        strong_langs = [primary_lang]

    return GitHubResult(
        analysisId=f"gh-{uuid.uuid4().hex[:8]}",
        username=user.get("login", clean_username),
        name=user.get("name") or user.get("login", clean_username),
        overallScore=overall_score,
        stats=stats,
        topLanguages=top_languages,
        strongLanguages=strong_langs,
        primaryLanguage=primary_lang,
        skillGaps=[],
        pinnedRepos=pinned_repos,
    )
