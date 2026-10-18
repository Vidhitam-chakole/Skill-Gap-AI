from roadmap.backend.service import build_personalized_roadmap

# Backward-compatibility alias
build_roadmap = build_personalized_roadmap

__all__ = ["build_personalized_roadmap", "build_roadmap"]
