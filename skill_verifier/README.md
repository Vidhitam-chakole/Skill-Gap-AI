# Skill Verifier Module (Anti-AI Code Authenticity Verifier)

This module solves the critical real-world problem where developers push AI-generated code (e.g., in C, Python, JavaScript, C++, TypeScript, or Java) to GitHub, and automated analyzers classify those languages as their "strong languages," despite the developer lacking conceptual understanding.

## Architecture

```
skill_verifier/
├── backend/
│   ├── schemas.py          # Pydantic request & response models (Quiz, Evaluation, Concepts)
│   ├── question_bank.py    # Curated diagnostic questions testing deep mechanics (pointers, memory, lifecycles, traps)
│   ├── service.py          # 10-Question generator, session manager & forensic authenticity grading engine
│   ├── router.py           # FastAPI APIRouter (/skill-verifier/generate, /submit, /languages, /result)
│   └── __init__.py
├── frontend/
│   ├── SkillVerifier.jsx   # Interactive 10-question assessment with navigation, code snippets & radar reports
│   ├── SkillVerifier.css   # Brutalist cyberpunk & glassmorphic styling
│   └── README.md
└── README.md
```

## How It Works

1. **GitHub Language Ingestion**:
   - Detects the candidate's claimed "strong languages" directly from GitHub analyzer results (e.g. C, Python, JavaScript).
   - Allows 1-click verification directly from the GitHub Review screen.

2. **Forensic 10-Question Diagnostic Test**:
   - Generates 10 questions calibrated specifically against AI code generation weaknesses:
     - **C**: Pointer arithmetic precedence (`*p++`), array decay in `sizeof`, read-only string literal mutation, stack address return, `realloc` memory leaks, struct alignment padding.
     - **Python**: Mutable default arguments, GIL behavior, late binding closures, shallow vs deep copying, `__new__` vs `__init__`.
     - **JavaScript**: Event loop microtasks vs macrotasks, arrow function lexical `this`, `[] == ![]` coercion, `var` vs `let` in timer closures.
     - **C++**: `std::unique_ptr` ownership transfer, virtual destructors, iterator invalidation, move semantics.
     - **TypeScript**: `unknown` vs `any`, discriminated unions, excess property checks, `keyof` constraints.
     - **Java**: String pool memory allocation, `volatile` visibility vs atomicity, checked exceptions, GC roots.

3. **Authenticity Scoring & Verdict**:
   - **`VERIFIED_AUTHENTIC`** (>= 80%): Real hands-on mastery. Proves genuine human debugging skills.
   - **`LIKELY_AI_AUGMENTED`** (50% - 79%): Basic syntax familiarity, but relies heavily on AI generation for complex mechanics.
   - **`UNVERIFIED_SUSPECT_AI`** (< 50%): High probability of AI-generated or copy-pasted code. Flags critical gaps before technical interviews.

4. **Actionable Recommendations & Deep Review**:
   - Question-by-question technical explanation of why common AI hallucinations fail.
   - Concept mastery breakdown (e.g. Memory Management, Sequence Points).
   - Targeted advice on how to study and achieve interview-ready competence.
