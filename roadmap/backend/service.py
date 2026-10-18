import re
import uuid

from .schemas import RoadmapPriority, RoadmapResult, RoadmapWeek

SEVERITY_RANK = {"high": 0, "medium": 1, "low": 2}


NON_CODE_LANGS = {"html", "css", "scss", "sass", "less", "general code", "other", "unknown", "markdown"}


def _extract_strong_languages(github_result, linkedin_result) -> tuple[str, list[str]]:
    """Extract top programming languages from GitHub analysis or fallback to LinkedIn skills."""
    strong_langs = []
    markup_langs = []

    if github_result:
        top_langs = getattr(github_result, "topLanguages", []) or []
        for l in top_langs:
            name = getattr(l, "name", l.get("name") if isinstance(l, dict) else str(l))
            if not name:
                continue
            lower_name = name.lower()
            if lower_name in NON_CODE_LANGS:
                if name not in markup_langs:
                    markup_langs.append(name)
            elif name not in strong_langs:
                strong_langs.append(name)

    if not strong_langs and linkedin_result:
        strengths = getattr(linkedin_result, "strengths", []) or []
        headline = getattr(linkedin_result, "headline", "")
        text_corpus = " ".join(strengths) + " " + headline
        common_langs = ["Python", "JavaScript", "TypeScript", "Go", "Java", "Rust", "C++", "C", "C#", "Ruby", "Kotlin", "Swift", "PHP"]
        for lang in common_langs:
            if lang.lower() in text_corpus.lower() and lang not in strong_langs:
                strong_langs.append(lang)

    # Fall back to markup languages if no programming language was found at all
    if not strong_langs and markup_langs:
        strong_langs = markup_langs

    if not strong_langs:
        strong_langs = ["JavaScript", "Python"]

    primary_lang = strong_langs[0]
    return primary_lang, strong_langs


def _cluster_key(skill: str) -> str:
    s = skill.lower()
    if any(k in s for k in ("ci/cd", "pipeline", "workflow", "actions")):
        return "ci_cd"
    if any(k in s for k in ("test", "vitest", "jest", "pytest", "coverage", "quality")):
        return "testing"
    if any(k in s for k in ("readme", "documentation", "doc", "architecture")):
        return "documentation"
    if any(k in s for k in ("docker", "container", "kubernetes", "cloud", "deploy")):
        return "cloud_devops"
    if any(k in s for k in ("type", "typescript")):
        return "typing"
    if any(k in s for k in ("license", "open source")):
        return "open_source"
    return s


def merge_priorities(linkedin_result, github_result) -> list[RoadmapPriority]:
    merged: dict[str, RoadmapPriority] = {}

    def add_gaps(gaps, source: str) -> None:
        for gap in gaps:
            skill = getattr(gap, "skill", gap.get("skill") if isinstance(gap, dict) else str(gap))
            severity = getattr(gap, "severity", gap.get("severity") if isinstance(gap, dict) else "medium")
            rec = getattr(gap, "recommendation", gap.get("recommendation") if isinstance(gap, dict) else "")

            key = _cluster_key(skill)
            existing = merged.get(key)
            if not existing:
                merged[key] = RoadmapPriority(
                    skill=skill,
                    severity=severity,
                    source=source,
                    recommendation=rec,
                )
                continue

            existing.source = "both"
            # Append target repo recommendations if distinct
            if rec and rec not in existing.recommendation:
                existing.recommendation = f"{existing.recommendation} | {rec}"

            if SEVERITY_RANK.get(severity, 9) < SEVERITY_RANK.get(existing.severity, 9):
                existing.severity = severity
                existing.skill = skill

    if linkedin_result:
        add_gaps(getattr(linkedin_result, "skillGaps", []), "linkedin")
    if github_result:
        add_gaps(getattr(github_result, "skillGaps", []), "github")

    return sorted(merged.values(), key=lambda item: SEVERITY_RANK.get(item.severity, 9))


def _generate_gap_milestone(
    milestone_num: int,
    item: RoadmapPriority,
    primary_lang: str,
    top_repo_name: str,
) -> RoadmapWeek:
    """
    Dynamically generate a sprint milestone from actual gap evidence and target repositories.
    Zero static canned templates: every task directly references the real repositories flagged.
    """
    rec = item.recommendation
    target_repos = re.findall(r"['\"]([^'\"]+)['\"]", rec)
    lead_repo = target_repos[0] if target_repos else (top_repo_name or "primary repository")
    secondary_repo = target_repos[1] if len(target_repos) > 1 else None

    skill_lower = item.skill.lower()

    if any(k in skill_lower for k in ("ci/cd", "pipeline", "workflow", "action")):
        title = f"CI/CD Pipeline Automation for '{lead_repo}'"
        tasks = [
            f"Set up an automated GitHub Actions workflow (.github/workflows/ci.yml) in '{lead_repo}'.",
            f"Configure automated linting, test pass verification, and dependency caching on git push.",
            f"Enforce branch protection rules requiring automated CI status checks to pass before merging.",
        ]
        if secondary_repo:
            tasks.append(f"Replicate and adapt the automated CI workflow to '{secondary_repo}'.")
        deliverable = f"Production GitHub Actions workflow with green pass badge in '{lead_repo}'"
        duration = "1-2 Weeks (High Priority)"

    elif any(k in skill_lower for k in ("test", "vitest", "jest", "pytest", "quality", "coverage")):
        test_framework = "pytest" if "python" in primary_lang.lower() else ("vitest/jest" if any(js in primary_lang.lower() for js in ("javascript", "typescript", "html")) else f"{primary_lang} test runner")
        title = f"Automated Test Suite Implementation for '{lead_repo}'"
        tasks = [
            f"Initialize automated test runner ({test_framework}) and test directory in '{lead_repo}'.",
            f"Write isolated unit tests for core application endpoints, models, and business logic.",
            "Establish automated code coverage reporting and enforce a minimum 80% branch coverage threshold.",
        ]
        if secondary_repo:
            tasks.append(f"Introduce integration tests covering key workflows in '{secondary_repo}'.")
        deliverable = f"Automated test suite with >80% branch coverage in '{lead_repo}'"
        duration = "1-2 Weeks (High Priority)"

    elif any(k in skill_lower for k in ("readme", "documentation", "doc")):
        title = f"Repository Documentation & Architecture in '{lead_repo}'"
        tasks = [
            f"Author a comprehensive README.md for '{lead_repo}' covering purpose, architecture, and prerequisites.",
            f"Add interactive setup guides, environment variable references, and CLI / API examples.",
            f"Include architectural flow diagrams (Mermaid.js) and record a preview GIF demo.",
        ]
        if secondary_repo:
            tasks.append(f"Overhaul documentation and quickstart instructions for '{secondary_repo}'.")
        deliverable = f"Professional README with architectural diagrams and demo in '{lead_repo}'"
        duration = "1 Week (Documentation Sprint)"

    elif any(k in skill_lower for k in ("docker", "container", "kubernetes", "cloud", "deploy")):
        title = f"Containerization & Cloud Setup for '{lead_repo}'"
        tasks = [
            f"Author a multi-stage, production-ready Dockerfile for '{lead_repo}'.",
            f"Create a docker-compose.yml configuration to run local services and dependencies.",
            f"Verify container builds and optimize layer caching to minimize final image footprint.",
        ]
        deliverable = f"Production Dockerfile & docker-compose.yml in '{lead_repo}'"
        duration = "1-2 Weeks (Infrastructure)"

    elif any(k in skill_lower for k in ("type", "typescript")):
        title = f"TypeScript Static Typing Migration in '{lead_repo}'"
        tasks = [
            f"Configure tsconfig.json with strict type checking enabled in '{lead_repo}'.",
            "Define explicit domain models, request/response types, and eliminate 'any' types.",
            "Integrate build-time type verification into your local scripts ('tsc --noEmit').",
        ]
        deliverable = f"Strict type-safe TypeScript configuration in '{lead_repo}'"
        duration = "1-2 Weeks (Type Safety)"

    elif any(k in skill_lower for k in ("license", "open source")):
        title = f"Open Source Licensing & Compliance for '{lead_repo}'"
        tasks = [
            f"Add an appropriate open-source license (e.g. MIT, Apache 2.0) to '{lead_repo}'.",
            f"Add a CONTRIBUTING.md guide and issue templates to invite community collaboration.",
            f"Audit dependencies for license compatibility and security vulnerabilities.",
        ]
        deliverable = f"Valid open-source license and contribution guidelines in '{lead_repo}'"
        duration = "1 Week (Governance)"

    else:
        title = f"{item.skill} ({lead_repo})"
        tasks = [
            f"Direct remediation: {item.recommendation}",
            f"Build a dedicated hands-on implementation in '{lead_repo}' solving this gap.",
            f"Benchmark and document this {item.severity}-severity competency for technical reviews.",
        ]
        deliverable = f"Verified implementation in '{lead_repo}' closing the '{item.skill}' gap"
        duration = "1-2 Weeks (Targeted Sprint)"

    return RoadmapWeek(
        week=milestone_num,
        milestoneNumber=milestone_num,
        phase=f"Sprint 0{milestone_num}: {item.severity.capitalize()} Priority Focus",
        title=title,
        focus=item.skill,
        duration=duration,
        languageContext=f"Directly targeting '{lead_repo}' ({primary_lang})",
        severity=item.severity,
        deliverable=deliverable,
        tasks=tasks,
    )


def build_personalized_roadmap(linkedin_result, github_result) -> RoadmapResult:
    if not linkedin_result and not github_result:
        raise ValueError("Please provide at least one completed profile analysis (LinkedIn or GitHub) to build a roadmap.")

    # 1. Extract GitHub strong languages & developer info
    primary_lang, strong_langs = _extract_strong_languages(github_result, linkedin_result)

    # 2. Extract top pinned repo if available
    top_repo_name = ""
    if github_result:
        pinned = getattr(github_result, "pinnedRepos", []) or []
        if pinned:
            top_repo_name = getattr(pinned[0], "name", pinned[0].get("name") if isinstance(pinned[0], dict) else "")

    # 3. Calculate combined score
    scores = []
    sources = []
    if linkedin_result:
        scores.append(getattr(linkedin_result, "overallScore", 75))
        sources.append(f"{getattr(linkedin_result, 'name', 'LinkedIn User')} ({getattr(linkedin_result, 'headline', 'Profile')})")
    if github_result:
        scores.append(getattr(github_result, "overallScore", 75))
        sources.append(f"GitHub @{getattr(github_result, 'username', 'developer')}")

    combined = round(sum(scores) / len(scores)) if scores else 78

    # 4. Merge and categorize skill gaps
    priorities = merge_priorities(linkedin_result, github_result)
    high_gaps = [p for p in priorities if p.severity == "high"]
    medium_gaps = [p for p in priorities if p.severity == "medium"]
    low_gaps = [p for p in priorities if p.severity == "low"]

    # 5. DYNAMIC MILESTONE GENERATION (No fixed 4-week limit!)
    milestones: list[RoadmapWeek] = []
    milestone_counter = 1

    # (A) Every High-Severity blocker receives a dedicated sprint
    for high_item in high_gaps:
        milestones.append(
            _generate_gap_milestone(milestone_counter, high_item, primary_lang, top_repo_name)
        )
        milestone_counter += 1

    # (B) Medium-Severity gaps receive targeted sprints
    if len(medium_gaps) <= 2:
        for med_item in medium_gaps:
            milestones.append(
                _generate_gap_milestone(milestone_counter, med_item, primary_lang, top_repo_name)
            )
            milestone_counter += 1
    elif len(medium_gaps) > 2:
        lead_med = medium_gaps[0]
        second_med = medium_gaps[1]
        milestones.append(
            _generate_gap_milestone(milestone_counter, lead_med, primary_lang, top_repo_name)
        )
        milestone_counter += 1
        milestones.append(
            _generate_gap_milestone(milestone_counter, second_med, primary_lang, top_repo_name)
        )
        milestone_counter += 1

    # (C) Low-Severity / Secondary Sprint if present
    if low_gaps:
        lead_low = low_gaps[0]
        milestones.append(
            _generate_gap_milestone(milestone_counter, lead_low, primary_lang, top_repo_name)
        )
        milestone_counter += 1
    else:
        has_doc_sprint = any("document" in m.title.lower() or "readme" in m.title.lower() for m in milestones)
        if has_doc_sprint:
            repo_target = f"'{top_repo_name}'" if top_repo_name else "primary codebase"
            milestones.append(
                RoadmapWeek(
                    week=milestone_counter,
                    milestoneNumber=milestone_counter,
                    phase=f"Sprint 0{milestone_counter}: Performance Optimization & API Architecture",
                    title=f"API Design, Caching & Performance Benchmarking ({primary_lang})",
                    focus="Backend Performance & API Architecture",
                    duration="1-2 Weeks (Performance Sprint)",
                    languageContext=f"Production {primary_lang} Architecture in {repo_target}",
                    severity="medium",
                    deliverable=f"Optimized {primary_lang} service with sub-50ms latencies and caching layer in {repo_target}",
                    tasks=[
                        f"Implement in-memory or distributed caching (Redis) for database queries and external APIs.",
                        f"Profile hot execution paths and optimize memory allocations and async event loops in {primary_lang}.",
                        f"Introduce structured API schemas, rate limiting, and defensive request validation in {repo_target}.",
                    ],
                )
            )
        else:
            repo_showcase = f"'{top_repo_name}'" if top_repo_name else "your top repository"
            milestones.append(
                RoadmapWeek(
                    week=milestone_counter,
                    milestoneNumber=milestone_counter,
                    phase=f"Sprint 0{milestone_counter}: Portfolio & Repository Showcasing",
                    title=f"Codebase Polish & Visual Documentation ({primary_lang})",
                    focus="Portfolio Polish & Architecture Showcase",
                    duration="1 Week (Polish Sprint)",
                    languageContext=f"Showcasing {repo_showcase} ({primary_lang})",
                    severity="low",
                    deliverable=f"Public {primary_lang} repository with interactive architecture diagram and demo",
                    tasks=[
                        f"Refactor the README for {repo_showcase} with an architectural diagram and live demo link.",
                        f"Write a deep-dive technical post breaking down architectural trade-offs in {primary_lang}.",
                        "Feature your polished repositories prominently at the top of your GitHub profile.",
                    ],
                )
            )
        milestone_counter += 1

    # (D) Final Capstone Mastery Sprint: End-to-end production deployment
    milestones.append(
        RoadmapWeek(
            week=milestone_counter,
            milestoneNumber=milestone_counter,
            phase=f"Sprint 0{milestone_counter}: Capstone Mastery & Production Release",
            title=f"Production Capstone Application ({primary_lang})",
            focus="End-to-End System Integration",
            duration="2 Weeks (Mastery Sprint)",
            languageContext=f"Comprehensive {primary_lang} Capstone",
            severity="medium",
            deliverable=f"Live production {primary_lang} deployment with CI/CD, tests, and documentation",
            tasks=[
                f"Design and deploy an end-to-end {primary_lang} application solving a real-world problem.",
                "Integrate automated testing, GitHub Actions CI/CD, and structured logging implemented in earlier sprints.",
                "Publish a comprehensive case study with architecture diagrams and live cloud preview link.",
            ],
        )
    )

    total_milestones = len(milestones)

    # 6. DYNAMIC TIMELINE ESTIMATION
    if total_milestones <= 3:
        estimated_duration = "3 - 4 Weeks (Accelerated Track)"
    elif total_milestones == 4:
        estimated_duration = "4 - 6 Weeks (Balanced Track)"
    elif total_milestones == 5:
        estimated_duration = "6 - 8 Weeks (Comprehensive Track)"
    else:
        estimated_duration = f"{total_milestones + 1} - {total_milestones + 3} Weeks (Mastery Track)"

    summary = (
        f"Dynamic Career Readiness Score: {combined}/100 based on {', '.join(sources)}. "
        f"Your adaptive roadmap features {total_milestones} personalized sprint milestones (estimated {estimated_duration}) "
        f"engineered around your active GitHub {primary_lang} codebase and LinkedIn profile, systematically closing {len(high_gaps)} critical blocker(s)."
    )

    # 7. Next Actions
    top_blocker = high_gaps[0].skill if high_gaps else (priorities[0].skill if priorities else "Automated Testing")
    next_actions = [
        f"Begin Milestone 01 immediately: tackle '{top_blocker}' in your primary {primary_lang} environment.",
        f"Set up an automated GitHub Actions CI pipeline in your top repository to prevent quality regressions.",
        f"Document each sprint milestone with architecture diagrams and share technical takeaways on LinkedIn.",
    ]

    return RoadmapResult(
        roadmapId=f"rm-{uuid.uuid4().hex[:8]}",
        combinedScore=combined,
        summary=summary,
        strongLanguages=strong_langs,
        primaryLanguage=primary_lang,
        totalMilestones=total_milestones,
        estimatedTotalDuration=estimated_duration,
        priorities=priorities,
        weeks=milestones,
        nextActions=next_actions,
    )
