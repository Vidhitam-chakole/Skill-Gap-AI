import uuid

from .schemas import RoadmapPriority, RoadmapResult, RoadmapWeek

SEVERITY_RANK = {"high": 0, "medium": 1, "low": 2}


def merge_priorities(linkedin_result, github_result) -> list[RoadmapPriority]:
    merged: dict[str, RoadmapPriority] = {}

    def add_gaps(gaps, source: str) -> None:
        for gap in gaps:
            # Handle either object or dict
            skill = getattr(gap, "skill", gap.get("skill") if isinstance(gap, dict) else str(gap))
            severity = getattr(gap, "severity", gap.get("severity") if isinstance(gap, dict) else "medium")
            rec = getattr(gap, "recommendation", gap.get("recommendation") if isinstance(gap, dict) else "")

            key = skill.lower()
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
            if SEVERITY_RANK.get(severity, 9) < SEVERITY_RANK.get(existing.severity, 9):
                existing.severity = severity
                existing.recommendation = rec

    if linkedin_result:
        add_gaps(getattr(linkedin_result, "skillGaps", []), "linkedin")
    if github_result:
        add_gaps(getattr(github_result, "skillGaps", []), "github")

    return sorted(merged.values(), key=lambda item: SEVERITY_RANK.get(item.severity, 9))


def build_personalized_roadmap(linkedin_result, github_result) -> RoadmapResult:
    if not linkedin_result and not github_result:
        raise ValueError("Please provide at least one completed profile analysis (LinkedIn or GitHub) to build a roadmap.")

    priorities = merge_priorities(linkedin_result, github_result)

    scores = []
    sources = []
    if linkedin_result:
        scores.append(getattr(linkedin_result, "overallScore", 75))
        sources.append(f"{getattr(linkedin_result, 'name', 'LinkedIn User')} ({getattr(linkedin_result, 'headline', 'Profile')})")
    if github_result:
        scores.append(getattr(github_result, "overallScore", 75))
        sources.append(f"GitHub @{getattr(github_result, 'username', 'developer')}")

    combined = round(sum(scores) / len(scores)) if scores else 78

    high = [item for item in priorities if item.severity == "high"]
    medium = [item for item in priorities if item.severity == "medium"]
    low = [item for item in priorities if item.severity == "low"]

    ranked_items = (high + medium + low + [None, None, None, None])[:4]

    week_templates = [
        (1, ranked_items[0], "Tackle highest-severity blocker with focused hands-on implementation."),
        (2, ranked_items[1], "Build a verifiable code artifact and write public documentation."),
        (3, ranked_items[2], "Implement testing, automation, or deployment to prove production readiness."),
        (4, ranked_items[3], "Consolidate the work into a portfolio showcase and interview-ready narrative."),
    ]

    weeks: list[RoadmapWeek] = []
    for week_num, item, fallback_desc in week_templates:
        if item:
            weeks.append(
                RoadmapWeek(
                    week=week_num,
                    focus=item.skill,
                    tasks=[
                        f"Priority focus: {item.recommendation}",
                        fallback_desc,
                        f"Track and benchmark this {item.severity}-severity skill identified via {item.source.capitalize()}.",
                    ],
                )
            )
        else:
            weeks.append(
                RoadmapWeek(
                    week=week_num,
                    focus="Portfolio Polish & Presentation",
                    tasks=[
                        fallback_desc,
                        "Publish an in-depth breakdown on LinkedIn with architecture diagrams.",
                        "Pin your enhanced repository with a live demo badge on GitHub.",
                    ],
                )
            )

    summary = (
        f"Combined Career Readiness Score: {combined}/100 based on {', '.join(sources)}. "
        f"You have {len(high)} critical high-priority gap(s) to address across the 4-week execution cycle."
    )

    next_actions = [p.recommendation for p in priorities[:3]]
    if not next_actions:
        next_actions = [
            "Complete both LinkedIn and GitHub reviews for comprehensive coverage.",
            "Ship one end-to-end project this month addressing modern industry demands.",
            "Document your learnings publicly in a technical article or case study.",
        ]

    return RoadmapResult(
        roadmapId=f"rm-{uuid.uuid4().hex[:8]}",
        combinedScore=combined,
        summary=summary,
        priorities=priorities,
        weeks=weeks,
        nextActions=next_actions,
    )
