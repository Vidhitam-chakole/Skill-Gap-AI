import uuid

from app.schemas import GitHubResult, LinkedInResult, RoadmapPriority, RoadmapResult, RoadmapWeek, SkillGap

SEVERITY_RANK = {"high": 0, "medium": 1, "low": 2}


def _merge_gaps(linkedin: LinkedInResult | None, github: GitHubResult | None) -> list[RoadmapPriority]:
    merged: dict[str, RoadmapPriority] = {}

    def add(gaps: list[SkillGap], source: str) -> None:
        for gap in gaps:
            key = gap.skill.lower()
            existing = merged.get(key)
            if not existing:
                merged[key] = RoadmapPriority(
                    skill=gap.skill,
                    severity=gap.severity,
                    source=source,
                    recommendation=gap.recommendation,
                )
                continue
            existing.source = "both"
            if SEVERITY_RANK.get(gap.severity, 9) < SEVERITY_RANK.get(existing.severity, 9):
                existing.severity = gap.severity
                existing.recommendation = gap.recommendation

    if linkedin:
        add(linkedin.skillGaps, "linkedin")
    if github:
        add(github.skillGaps, "github")

    return sorted(merged.values(), key=lambda item: SEVERITY_RANK.get(item.severity, 9))


def build_roadmap(linkedin: LinkedInResult | None, github: GitHubResult | None) -> RoadmapResult:
    if not linkedin and not github:
        raise ValueError("Run a LinkedIn or GitHub analysis first.")

    priorities = _merge_gaps(linkedin, github)
    scores = [item.overallScore for item in (linkedin, github) if item]
    combined = round(sum(scores) / len(scores))

    sources = []
    if linkedin:
        sources.append(f"{linkedin.name} ({linkedin.headline})")
    if github:
        sources.append(f"GitHub @{github.username}")

    high = [item for item in priorities if item.severity == "high"]
    medium = [item for item in priorities if item.severity == "medium"]
    low = [item for item in priorities if item.severity == "low"]

    slot = (high + medium + low + [None, None, None, None])[:4]
    week_focus = [
        (1, slot[0], "Close the highest-severity gap with a small, shippable project."),
        (2, slot[1], "Document the work publicly (README + LinkedIn post)."),
        (3, slot[2], "Add tests, CI, or a cloud deploy to prove production habits."),
        (4, slot[3], "Package a portfolio story and apply the skill in an interview-style writeup."),
    ]

    weeks: list[RoadmapWeek] = []
    for week, priority, fallback in week_focus:
        if priority:
            weeks.append(
                RoadmapWeek(
                    week=week,
                    focus=priority.skill,
                    tasks=[
                        priority.recommendation,
                        fallback,
                        f"Track this as a {priority.severity}-priority item from {priority.source}.",
                    ],
                )
            )
        else:
            weeks.append(
                RoadmapWeek(
                    week=week,
                    focus="Portfolio polish",
                    tasks=[
                        fallback,
                        "Refresh LinkedIn featured section with one concrete outcome.",
                        "Pin or highlight the repo that shows this week's work.",
                    ],
                )
            )

    summary = (
        f"Combined career score {combined}/100 from {', '.join(sources)}. "
        f"{len(high)} high-priority gap(s) should come first over the next four weeks."
    )

    next_actions = [item.recommendation for item in priorities[:3]]
    if not next_actions:
        next_actions = [
            "Analyze both LinkedIn and GitHub for a fuller picture.",
            "Ship one public project this month.",
            "Write a short post about what you learned.",
        ]

    return RoadmapResult(
        roadmapId=f"rm-{uuid.uuid4().hex[:8]}",
        combinedScore=combined,
        summary=summary,
        priorities=priorities[:6],
        weeks=weeks,
        nextActions=next_actions,
    )
