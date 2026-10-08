"""
Skill Verifier Dynamic Procedural Question Generator
Generates completely customized, non-predefined, anti-AI diagnostic question papers.
Randomizes identifiers, numerical constants, logic flows, option orders, and
injects real repository context from the user's GitHub profile.
"""

import random
from typing import Any, Optional


def _shuffle_options(
    options: list[str],
    correct_idx: int,
) -> tuple[list[str], int]:
    """Randomly shuffles the 4 options and updates the correctIndex accordingly."""
    indexed = list(enumerate(options))
    random.shuffle(indexed)
    new_options = [text for _, text in indexed]
    new_correct_idx = next(i for i, (orig_i, _) in enumerate(indexed) if orig_i == correct_idx)
    return new_options, new_correct_idx


def _repo_context_tag(context: Optional[dict[str, Any]]) -> str:
    """Creates a brief contextual code comment referencing a real repository if available."""
    if not context:
        return ""
    repo_names = context.get("repo_names", [])
    username = context.get("username", "developer")
    if repo_names:
        repo = random.choice(repo_names)
        return f"// Context: In @{username}'s repository '{repo}'\n"
    return f"// Context: Project module by @{username}\n"


# =====================================================================
# PYTHON DYNAMIC GENERATORS
# =====================================================================

def _gen_py_mutable_default(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    fn_name = random.choice(["register_item", "append_metric", "cache_event", "log_payload"])
    param_name = random.choice(["items", "queue", "entries", "records"])
    v1, v2, v3 = random.sample([10, 25, 42, 55, 77, 88, 99], 3)
    extra_val = random.choice(["alpha", "beta", "custom"])

    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"def {fn_name}(val, {param_name}=[]):\n"
        f"    {param_name}.append(val)\n"
        f"    return {param_name}\n\n"
        f"print({fn_name}({v1}))\n"
        f"print({fn_name}('{extra_val}', []))\n"
        f"print({fn_name}({v3}))"
    )

    correct = f"[{v1}, {v3}]"
    distractor1 = f"[{v3}]"
    distractor2 = f"[{v1}], ['{extra_val}'], [{v3}]"
    distractor3 = f"[{v1}, '{extra_val}', {v3}]"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Mutable Default Arguments & Object Lifecycle",
        "question": f"What is the final output printed by the third call '{fn_name}({v3})'?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"Python evaluates default argument expressions ONCE when the function definition is executed, "
            f"not at call time. The default list '{param_name}' persists across calls. The second call passed an explicit "
            f"new list '[]', so the default was untouched. Thus the third call mutates the shared default, yielding {correct}. "
            f"AI code generators and copy-pasters commonly assume default arguments re-instantiate on every call ({distractor1})."
        ),
    }


def _gen_py_late_binding(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    limit = random.choice([3, 4, 5])
    multiplier = random.choice([2, 3, 10])
    target_idx = random.randint(0, limit - 1)

    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"handlers = [lambda x: (x + i) * {multiplier} for i in range({limit})]\n"
        f"print(handlers[{target_idx}](0))"
    )

    final_i = limit - 1
    correct_val = (0 + final_i) * multiplier
    naive_val = (0 + target_idx) * multiplier
    zero_val = 0
    first_val = (0 + 0) * multiplier

    options_raw = [str(correct_val), str(naive_val), str(zero_val), str(first_val)]
    opts_dedup = list(dict.fromkeys(options_raw))
    while len(opts_dedup) < 4:
        opts_dedup.append(str(random.randint(100, 200)))

    c_idx_raw = opts_dedup.index(str(correct_val))
    options, c_idx = _shuffle_options(opts_dedup, c_idx_raw)

    return {
        "difficulty": "Deep Mechanics",
        "concept": "Closure Late-Binding & Scoping Traps",
        "question": f"What integer will be printed when invoking handlers[{target_idx}](0)?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"Python closures bind variables by reference, not by value. When the lambdas execute, "
            f"the loop has finished and 'i' remains {final_i} in the enclosing scope. "
            f"Therefore, handlers[{target_idx}](0) evaluates ((0 + {final_i}) * {multiplier}) = {correct_val}."
        ),
    }


def _gen_py_tuple_mutation(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    val1 = random.choice([5, 12, 42])
    val2 = random.choice([99, 100, 256])

    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"data = ([{val1}], 'immutable')\n"
        f"try:\n"
        f"    data[0] += [{val2}]\n"
        f"except TypeError:\n"
        f"    pass\n"
        f"print(data[0])"
    )

    correct = f"[{val1}, {val2}]"
    distractor1 = f"[{val1}]"
    distractor2 = "TypeError is unhandled and program crashes"
    distractor3 = f"([{val1}, {val2}], 'immutable')"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Deep Mechanics",
        "concept": "In-Place Augmented Assignment with Immutable Tuples",
        "question": "What is printed by 'print(data[0])' after the try/except block?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"The in-place operator '+=' executes data[0].extend([{val2}]), which mutates the underlying list in-place. "
            f"Then, bytecode tries to reassign the result back to data[0]. Because tuples are immutable, the assignment "
            f"raises a TypeError, but the in-place list mutation ALREADY occurred! Thus data[0] is {correct}."
        ),
    }


def _gen_py_is_vs_equals(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    cached_num = random.choice([250, 255, 256])
    uncached_num = random.choice([257, 300, 512, 1024])

    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"x1 = {cached_num}\n"
        f"y1 = int(str({cached_num}))\n"
        f"x2 = {uncached_num}\n"
        f"y2 = int(str({uncached_num}))\n\n"
        f"print((x1 is y1), (x2 is y2))"
    )

    correct = "True False"
    distractor1 = "True True"
    distractor2 = "False False"
    distractor3 = "False True"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "CPython Small Integer Object Caching (-5 to 256)",
        "question": "What will this snippet print under standard CPython 3.x?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"CPython pre-allocates an internal singleton cache for small integers in the range [-5, 256]. "
            f"Since {cached_num} <= 256, x1 and y1 reference the exact same memory address (True). "
            f"Since {uncached_num} > 256, y2 created dynamically via int(str(...)) receives a new heap allocation, "
            f"so 'x2 is y2' evaluates to False. True answer: {correct}."
        ),
    }


def _gen_py_generator_exhaustion(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    count = random.choice([3, 4, 5])
    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"gen = (x * 2 for x in range({count}))\n"
        f"sum1 = sum(gen)\n"
        f"sum2 = sum(gen)\n"
        f"print(sum1, sum2)"
    )

    calculated_sum = sum(x * 2 for x in range(count))
    correct = f"{calculated_sum} 0"
    distractor1 = f"{calculated_sum} {calculated_sum}"
    distractor2 = "StopIteration exception raised"
    distractor3 = "0 0"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "Generator State & One-Way Iterator Exhaustion",
        "question": "What will be printed when summing the generator expression twice?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"Generator expressions are stateful single-pass iterators. Once 'sum(gen)' advances the generator to exhaustion, "
            f"subsequent iterations yield nothing. Thus 'sum2' evaluates to 0 without raising an error. Correct output: {correct}."
        ),
    }


def _gen_py_class_var_shadowing(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    initial_val = random.choice([10, 20, 50])
    delta = random.choice([1, 5, 10])

    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"class ConfigNode:\n"
        f"    timeout = {initial_val}\n\n"
        f"nodeA = ConfigNode()\n"
        f"nodeB = ConfigNode()\n"
        f"nodeA.timeout += {delta}\n"
        f"ConfigNode.timeout = 99\n"
        f"print(nodeA.timeout, nodeB.timeout)"
    )

    correct = f"{initial_val + delta} 99"
    distractor1 = f"99 99"
    distractor2 = f"{initial_val + delta} {initial_val}"
    distractor3 = f"99 {initial_val + delta}"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Class Variable vs Instance Attribute Shadowing",
        "question": "What does 'print(nodeA.timeout, nodeB.timeout)' output?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"'nodeA.timeout += {delta}' creates a new instance variable 'timeout' on nodeA ({initial_val + delta}), shadowing the class variable. "
            f"nodeB has no instance variable, so looking up nodeB.timeout dynamically falls back to the class variable (updated to 99). "
            f"Thus nodeA is {initial_val + delta} and nodeB is 99."
        ),
    }


def _gen_py_gil_multiprocessing(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Deep Mechanics",
        "concept": "GIL Contention & Parallel CPU-bound Workloads",
        "question": "Why does running 4 Python 'threading.Thread' workers on a 16-core CPU often run SLOWER than a single thread for CPU-bound tasks?",
        "codeSnippet": (
            f"{_repo_context_tag(context).replace('//', '#')}"
            "import threading\n\n"
            "# 4 threads computing SHA256 hashes in parallel:\n"
            "threads = [threading.Thread(target=hash_crunch) for _ in range(4)]\n"
            "for t in threads: t.start()\n"
            "for t in threads: t.join()"
        ),
        "options": [
            "The Global Interpreter Lock (GIL) serializes bytecode execution while context-switching and OS thread signaling add overhead",
            "CPython automatically downgrades multi-threaded processes to 1 core via OS affinity masks",
            "Python threads execute in separate process spaces that bottleneck on inter-process pipe communication",
            "CPU cache invalidation forces memory controllers to throttle memory bandwidth by 50%",
        ],
        "correctIndex": 0,
        "explanation": (
            "Because CPython's Global Interpreter Lock (GIL) allows only one thread to execute Python bytecode at a time, "
            "multiple CPU-bound threads constantly contend for the lock. The OS context switches between threads while waiting "
            "for the GIL, introducing thrashing overhead that exceeds single-threaded execution time."
        ),
    }


def _gen_py_try_finally_return(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    val_try = random.choice([10, 42, 100])
    val_fin = random.choice([20, 88, 200])

    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"def compute_status():\n"
        f"    try:\n"
        f"        return {val_try}\n"
        f"    finally:\n"
        f"        return {val_fin}\n\n"
        f"print(compute_status())"
    )

    correct = str(val_fin)
    distractor1 = str(val_try)
    distractor2 = f"{val_try}, {val_fin}"
    distractor3 = "SyntaxError or RuntimeError"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "Try/Finally Stack Execution & Return Overrides",
        "question": "What is the return value of compute_status()?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"In Python, the 'finally' clause is guaranteed to run before exiting the block. "
            f"If 'finally' contains a return statement, it discards any return value or exception "
            f"currently pending on the execution stack. Therefore, {val_fin} overrides {val_try}."
        ),
    }


def _gen_py_dict_keys_mutation(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    k1, k2, k3 = random.sample(["cpu", "ram", "disk", "gpu", "net"], 3)
    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"metrics = {{'{k1}': 10, '{k2}': 20, '{k3}': 30}}\n"
        f"for k in metrics:\n"
        f"    if metrics[k] < 25:\n"
        f"        del metrics[k]"
    )

    correct = "RuntimeError: dictionary changed size during iteration"
    distractor1 = f"Successfully deletes '{k1}' and terminates normally"
    distractor2 = f"KeyError: '{k1}'"
    distractor3 = "Deletes all keys and empties metrics dictionary"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "Collection Mutation During Active Iterator Traversal",
        "question": "What happens when executing this loop?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "Python dictionary iterators maintain internal mutation counters. If the dictionary's size "
            "changes during iteration (adding or deleting keys), Python immediately raises "
            "'RuntimeError: dictionary changed size during iteration'. The safe pattern is iterating over list(metrics.keys())."
        ),
    }


def _gen_py_shallow_copy_multiply(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    val = random.choice([7, 42, 99])
    code = (
        f"{_repo_context_tag(context).replace('//', '#')}"
        f"matrix = [[0]] * 3\n"
        f"matrix[0][0] = {val}\n"
        f"print(matrix)"
    )

    correct = f"[[{val}], [{val}], [{val}]]"
    distractor1 = f"[[{val}], [0], [0]]"
    distractor2 = f"[[0], [0], [{val}]]"
    distractor3 = "TypeError: list multiplication unsupported for nested sequences"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "List Multiplication Operator & Reference Duplication",
        "question": "What will 'print(matrix)' output?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "Multiplying a list containing mutable objects '[ [0] ] * 3' copies the pointer reference to the inner list, "
            "not the list itself. All 3 rows point to the exact same inner list in memory. Mutating matrix[0][0] reflects "
            f"across all three elements: {correct}."
        ),
    }


# =====================================================================
# JAVASCRIPT DYNAMIC GENERATORS
# =====================================================================

def _gen_js_event_loop(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    n1, n2, n3, n4 = random.sample([1, 2, 3, 4, 5, 6, 7, 8], 4)
    code = (
        f"{_repo_context_tag(context)}"
        f"console.log({n1});\n"
        f"setTimeout(() => console.log({n2}), 0);\n"
        f"Promise.resolve().then(() => console.log({n3}));\n"
        f"console.log({n4});"
    )

    correct = f"{n1}, {n4}, {n3}, {n2}"
    distractor1 = f"{n1}, {n2}, {n3}, {n4}"
    distractor2 = f"{n1}, {n3}, {n4}, {n2}"
    distractor3 = f"{n1}, {n4}, {n2}, {n3}"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Event Loop: Microtasks (Promise) vs Macrotasks (Timer)",
        "question": "In what order are the numbers logged to the console?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"Synchronous script executes first ({n1}, {n4}). Next, the engine drains the Microtask queue, "
            f"which includes Promise callbacks ({n3}). Only after all microtasks are cleared does the event loop "
            f"advance to the Macrotask/Task queue (setTimeout -> {n2}). Correct sequence: {correct}."
        ),
    }


def _gen_js_var_closure_loop(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    limit = random.choice([3, 4, 5])
    code = (
        f"{_repo_context_tag(context)}"
        f"for (var i = 0; i < {limit}; i++) {{\n"
        f"    setTimeout(() => console.log(i), 0);\n"
        f"}}"
    )

    correct = f"Prints {limit} repeated {limit} times"
    distractor1 = f"Prints 0, 1, 2 up to {limit - 1}"
    distractor2 = "Prints 0 repeated 3 times"
    distractor3 = "Throws a ReferenceError: i is not defined"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Variable Hoisting & Function-Scoped 'var' Closures",
        "question": "What will be printed to the console when the timeouts execute?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"'var' is function-scoped (or global), not block-scoped. All {limit} setTimeout callbacks close over "
            f"the single shared variable 'i'. By the time the event loop drains the timers, the loop has completed, "
            f"leaving i = {limit}. Replacing 'var' with 'let' creates a new lexical binding per iteration."
        ),
    }


def _gen_js_this_arrow_vs_regular(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    val = random.choice([42, 99, 100, 314])
    code = (
        f"{_repo_context_tag(context)}"
        f"const service = {{\n"
        f"    token: {val},\n"
        f"    getToken: () => this.token,\n"
        f"    readToken() {{ return this.token; }}\n"
        f"}};\n\n"
        f"console.log(service.getToken(), service.readToken());"
    )

    correct = f"undefined {val}"
    distractor1 = f"{val} {val}"
    distractor2 = f"{val} undefined"
    distractor3 = "TypeError: service.getToken is not a function"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Lexical 'this' Binding in Arrow Functions vs Methods",
        "question": "What will this code log in standard modern JavaScript?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "Arrow functions do not bind their own 'this'; they capture 'this' lexically from their enclosing scope. "
            "In an object literal at module root, 'this' refers to window (or global/undefined in modules). "
            f"Thus 'service.getToken()' evaluates to undefined, while regular method 'readToken()' receives 'service' as 'this' ({val})."
        ),
    }


def _gen_js_object_freeze_shallow(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    v_orig = random.choice([10, 25, 42])
    v_new = random.choice([88, 99, 100])
    code = (
        f"{_repo_context_tag(context)}"
        f"const config = Object.freeze({{\n"
        f"    version: '1.0',\n"
        f"    db: {{ port: {v_orig} }}\n"
        f"}});\n\n"
        f"config.db.port = {v_new};\n"
        f"console.log(config.db.port);"
    )

    correct = str(v_new)
    distractor1 = str(v_orig)
    distractor2 = "TypeError: Cannot assign to read only property in strict mode"
    distractor3 = "undefined"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Object.freeze Shallow Immutability vs Nested Objects",
        "question": "What is logged by 'console.log(config.db.port)'?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "Object.freeze() performs only a shallow freeze on top-level properties. "
            "Nested objects (like 'config.db') remain completely mutable unless explicitly deep-frozen. "
            f"Thus config.db.port is successfully updated to {v_new}."
        ),
    }


def _gen_js_array_sort_alphabetical(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    nums = [10, 5, 25, 2, 80]
    random.shuffle(nums)
    code = (
        f"{_repo_context_tag(context)}"
        f"const nums = {nums};\n"
        f"nums.sort();\n"
        f"console.log(nums);"
    )

    lex_sorted = sorted(nums, key=lambda n: str(n))
    num_sorted = sorted(nums)

    correct = f"[{', '.join(str(x) for x in lex_sorted)}] (string lexicographical order)"
    distractor1 = f"[{', '.join(str(x) for x in num_sorted)}] (numerical ascending order)"
    distractor2 = f"[{', '.join(str(x) for x in reversed(num_sorted))}]"
    distractor3 = "TypeError: Compare function required"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "Default Array.prototype.sort Lexicographical Conversion",
        "question": "What is the sorted array output when invoking .sort() without arguments?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "By default, JavaScript's Array.prototype.sort converts elements into strings and compares their UTF-16 code units. "
            f"Therefore, '10' comes before '2' lexicographically. To sort numerically, developers must pass '(a, b) => a - b'."
        ),
    }


def _gen_js_tdz(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    var_name = random.choice(["apiKey", "port", "clusterId", "sessionId"])
    code = (
        f"{_repo_context_tag(context)}"
        f"function init() {{\n"
        f"    console.log({var_name});\n"
        f"    let {var_name} = 'production';\n"
        f"}}\n"
        f"init();"
    )

    correct = f"ReferenceError: Cannot access '{var_name}' before initialization"
    distractor1 = "undefined"
    distractor2 = "'production'"
    distractor3 = "null"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "Temporal Dead Zone (TDZ) for let and const",
        "question": "What is the outcome of invoking init()?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"While 'let' variables are hoisted to the top of their block, they remain uninitialized in the "
            f"Temporal Dead Zone (TDZ) until execution reaches the declaration line. Accessing them beforehand throws a ReferenceError."
        ),
    }


# =====================================================================
# TYPESCRIPT DYNAMIC GENERATORS
# =====================================================================

def _gen_ts_unknown_vs_any(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Foundation",
        "concept": "Type Safety: 'unknown' Top Type vs 'any'",
        "question": "Why does TypeScript compiler reject 'val.trim()' when 'val: unknown' but permit it when 'val: any'?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "function processInput(a: unknown, b: any) {\n"
            "    b.trim(); // Compiles cleanly\n"
            "    a.trim(); // Error: 'a' is of type 'unknown'\n"
            "}"
        ),
        "options": [
            "'unknown' is type-safe and requires explicit type narrowing (e.g. typeof a === 'string') before property access",
            "'unknown' is converted to 'never' by the compiler during optimization",
            "'unknown' only allows arithmetic operators like +, -, *",
            "'any' disables JavaScript runtime garbage collection for that variable",
        ],
        "correctIndex": 0,
        "explanation": (
            "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to 'unknown', but 'unknown' "
            "is not assignable to anything else without explicit type narrowing (type guards), preventing runtime crashes."
        ),
    }


def _gen_ts_distributive_conditionals(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Distributive Conditional Types over Naked Type Parameters",
        "question": "What does type 'Result' resolve to in this conditional type definition?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "type Box<T> = T extends any ? T[] : never;\n"
            "type Result = Box<string | number>;"
        ),
        "options": [
            "string[] | number[] (distributed union of arrays)",
            "(string | number)[] (single array holding both types)",
            "never",
            "[string, number] (tuple)",
        ],
        "correctIndex": 0,
        "explanation": (
            "When conditional types act on a naked generic type parameter 'T', union types automatically distribute. "
            "Thus Box<string | number> evaluates to (string extends any ? string[] : never) | (number extends any ? number[] : never), "
            "producing string[] | number[]."
        ),
    }


def _gen_ts_infer_return_type(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Conditional Type Inference with the 'infer' Keyword",
        "question": "How does this custom 'GetReturn<T>' type extract the return type of a function?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never;\n"
            "type Fn = () => Promise<number>;\n"
            "type Output = GetReturn<Fn>;"
        ),
        "options": [
            "The 'infer R' introduces a new type variable in the true branch that TypeScript deduces as Promise<number>",
            "'infer' dynamically executes the function at compile-time using V8 engine",
            "'infer' casts the function body to an AST expression",
            "Output evaluates to 'never' because async functions cannot be inferred",
        ],
        "correctIndex": 0,
        "explanation": (
            "The 'infer' keyword allows pattern-matching on composite types within a conditional type. "
            "TypeScript matches 'Fn' against '(...args: any[]) => infer R' and unifies 'R' with Promise<number>."
        ),
    }


# =====================================================================
# C / C++ DYNAMIC GENERATORS
# =====================================================================

def _gen_c_pointer_increment(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    a1, a2, a3 = random.sample([10, 20, 30, 40, 50, 70], 3)
    code = (
        f"{_repo_context_tag(context)}"
        f"int arr[] = {{{a1}, {a2}, {a3}}};\n"
        f"int *p = arr;\n"
        f"int x = *p++;\n"
        f"printf(\"%d %d\", x, *p);"
    )

    correct = f"{a1} {a2}"
    distractor1 = f"{a2} {a2}"
    distractor2 = f"{a1} {a1}"
    distractor3 = f"{a1 + 1} {a2}"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Postfix Increment Precedence with Dereferencing (*p++)",
        "question": "What is printed by 'printf(\"%d %d\", x, *p)'?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"The postfix increment '++' has higher precedence than unary '*', but the expression '*p++' evaluates to "
            f"the value of *p before incrementing the pointer. Thus 'x' receives arr[0] ({a1}), and 'p' advances to point "
            f"to arr[1] ({a2}). Correct output: {correct}."
        ),
    }


def _gen_c_array_decay_sizeof(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    size = random.choice([10, 20, 50, 100])
    code = (
        f"{_repo_context_tag(context)}"
        f"void check_buffer(int buf[{size}]) {{\n"
        f"    printf(\"%zu\", sizeof(buf));\n"
        f"}}\n\n"
        f"int main() {{\n"
        f"    int my_buf[{size}];\n"
        f"    check_buffer(my_buf);\n"
        f"    return 0;\n"
        f"}}"
    )

    correct = "8 (or 4 on 32-bit: size of pointer)"
    distractor1 = f"{size * 4} bytes (full array size)"
    distractor2 = f"{size} bytes"
    distractor3 = "Compiler error: sizeof invalid on function parameter"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Array Parameter Decay to Pointer & sizeof Semantics",
        "question": "What will check_buffer print on a standard 64-bit architecture?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"In C, array parameters in function declarations decay to pointers: 'int buf[{size}]' is treated as 'int *buf'. "
            f"Therefore, 'sizeof(buf)' evaluates to the size of a pointer (8 bytes on 64-bit), not the array length ({size * 4} bytes)."
        ),
    }


def _gen_c_struct_padding(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    code = (
        f"{_repo_context_tag(context)}"
        "struct Record {\n"
        "    char flag;\n"
        "    int id;\n"
        "    short code;\n"
        "};\n\n"
        "printf(\"%zu\", sizeof(struct Record));"
    )

    correct = "12 bytes (due to alignment padding)"
    distractor1 = "7 bytes (1 + 4 + 2)"
    distractor2 = "8 bytes"
    distractor3 = "16 bytes"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Structure Member Alignment & Compiler Padding",
        "question": "What is the sizeof(struct Record) on a typical 32/64-bit system?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "'char flag' (1 byte) is followed by 3 padding bytes to align 'int id' (4 bytes) on a 4-byte boundary. "
            "'short code' (2 bytes) follows, then 2 trailing padding bytes ensure the entire struct size is a multiple "
            "of its largest member alignment (4 bytes). Total: 1 + 3 + 4 + 2 + 2 = 12 bytes."
        ),
    }


def _gen_cpp_move_semantics(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Deep Mechanics",
        "concept": "C++ std::move and Rvalue References",
        "question": "What does 'std::move(obj)' actually do at runtime?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "std::string str = \"heavy_dataset\";\n"
            "std::move(str); // Line executed alone"
        ),
        "options": [
            "It performs an unconditional static_cast to an rvalue reference (std::string&&); it moves no data by itself",
            "It instantly frees 'str' heap memory and zeroes its internal pointer",
            "It copies the memory buffer to CPU registers",
            "It forces immediate invocation of the string move constructor",
        ],
        "correctIndex": 0,
        "explanation": (
            "'std::move' does not move anything at runtime. It is purely a compile-time cast that converts an lvalue to an rvalue reference (T&&), "
            "enabling functions or constructors that overload on rvalues to execute their move semantics."
        ),
    }


def _gen_cpp_virtual_destructor(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Polymorphic Base Class Virtual Destructor Invariant",
        "question": "What occurs when deleting a derived object via a base class pointer if Base lacks a virtual destructor?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "class Base { public: ~Base() {} };\n"
            "class Derived : public Base {\n"
            "    int *buffer;\n"
            "public:\n"
            "    Derived() { buffer = new int[100]; }\n"
            "    ~Derived() { delete[] buffer; }\n"
            "};\n\n"
            "Base *ptr = new Derived();\n"
            "delete ptr;"
        ),
        "options": [
            "Undefined Behavior: ~Derived() is not invoked, causing memory leak and corrupted runtime state",
            "Compiler automatically synthesizes virtual dispatch table entry for ~Derived()",
            "The memory is safely reclaimed by the OS virtual memory manager without leak",
            "Throws a std::bad_alloc exception at runtime",
        ],
        "correctIndex": 0,
        "explanation": (
            "If a base class destructor is non-virtual, deleting a derived class through a pointer to base invokes "
            "the base destructor statically. The derived destructor (~Derived) is bypassed entirely, leaking resources "
            "and invoking undefined behavior according to ISO C++."
        ),
    }


# =====================================================================
# JAVA DYNAMIC GENERATORS
# =====================================================================

def _gen_java_autoboxing_cache(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    cached = random.choice([100, 120, 127])
    uncached = random.choice([128, 200, 500])

    code = (
        f"{_repo_context_tag(context)}"
        f"Integer a = {cached};\n"
        f"Integer b = {cached};\n"
        f"Integer c = {uncached};\n"
        f"Integer d = {uncached};\n\n"
        f"System.out.println((a == b) + \" \" + (c == d));"
    )

    correct = "true false"
    distractor1 = "true true"
    distractor2 = "false false"
    distractor3 = "false true"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Integer Cache Pool (-128 to 127) & Reference Equality",
        "question": "What does this Java code print?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"The JVM maintains an IntegerCache for values between -128 and 127. Autoboxing values within this range "
            f"returns shared cached references, so 'a == b' is true. Above 127 ({uncached}), autoboxing creates distinct "
            f"heap instances, so 'c == d' reference equality evaluates to false. True answer: {correct}."
        ),
    }


def _gen_java_finally_override(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    v_try = random.choice([10, 50, 100])
    v_fin = random.choice([20, 99, 200])

    code = (
        f"{_repo_context_tag(context)}"
        f"public static int getStatus() {{\n"
        f"    try {{\n"
        f"        return {v_try};\n"
        f"    }} finally {{\n"
        f"        return {v_fin};\n"
        f"    }}\n"
        f"}}"
    )

    correct = str(v_fin)
    distractor1 = str(v_try)
    distractor2 = "Compilation error: unreachable return statement"
    distractor3 = "Runtime exception: IllegalStateException"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "Finally Block Return Overrides and JVM Stack Cleanup",
        "question": "What does getStatus() return?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"In Java, a return statement inside a finally block silently suppresses and overwrites any pending return value "
            f"or exception from the try block. getStatus() returns {v_fin}."
        ),
    }


def _gen_java_string_interning(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    code = (
        f"{_repo_context_tag(context)}"
        "String s1 = \"skillgap\";\n"
        "String s2 = new String(\"skillgap\");\n"
        "System.out.println((s1 == s2) + \" \" + (s1 == s2.intern()));"
    )

    correct = "false true"
    distractor1 = "true true"
    distractor2 = "false false"
    distractor3 = "true false"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Foundation",
        "concept": "String Pool Interning vs Heap Object Instantiation",
        "question": "What is printed by System.out.println()?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "'new String(...)' creates a separate object on the Java heap, so 's1 == s2' is false (different references). "
            "Calling 's2.intern()' returns the canonical representation from the String Constant Pool, which matches 's1'. "
            "Output: false true."
        ),
    }


# =====================================================================
# GO (GOLANG) DYNAMIC GENERATORS
# =====================================================================

def _gen_go_slice_append_realloc(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    val = random.choice([77, 99, 100])
    code = (
        f"{_repo_context_tag(context)}"
        f"a := make([]int, 2, 2)\n"
        f"b := append(a, {val})\n"
        f"b[0] = 500\n"
        f"fmt.Println(a[0])"
    )

    correct = "0 (underlying array was reallocated during append)"
    distractor1 = "500 (shared underlying array was mutated)"
    distractor2 = f"{val}"
    distractor3 = "Panic: runtime index out of range"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Slice Header Capacity & Underlying Array Growth",
        "question": "What is printed by 'fmt.Println(a[0])'?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            "Slice 'a' had length 2 and capacity 2. Calling 'append(a, ...)' exceeded the capacity, forcing Go "
            "to allocate a new underlying array for 'b'. Modifying b[0] mutates the new array, leaving 'a[0]' at 0."
        ),
    }


def _gen_go_nil_interface(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Go Interface Internal (Type, Value) Tuples",
        "question": "What will this code print?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "type Handler interface { Handle() }\n"
            "type Service struct{}\n"
            "func (s *Service) Handle() {}\n\n"
            "var s *Service = nil\n"
            "var h Handler = s\n"
            "fmt.Println(h == nil)"
        ),
        "options": [
            "false (interface holds type *Service with nil value)",
            "true (the underlying pointer is nil)",
            "panic: runtime error nil pointer dereference",
            "Compilation error: cannot assign nil struct pointer to interface",
        ],
        "correctIndex": 0,
        "explanation": (
            "In Go, an interface value is represented internally as a pair: (type, value). "
            "An interface is only equal to 'nil' if BOTH its type and value are nil. "
            "Here, 'h' holds type (*Service, nil), so 'h == nil' evaluates to false!"
        ),
    }


def _gen_go_defer_evaluation(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    v1 = random.choice([10, 25, 42])
    v2 = random.choice([80, 99, 100])
    code = (
        f"{_repo_context_tag(context)}"
        f"x := {v1}\n"
        f"defer fmt.Println(x)\n"
        f"x = {v2}"
    )

    correct = str(v1)
    distractor1 = str(v2)
    distractor2 = f"{v1} {v2}"
    distractor3 = "0"

    options, c_idx = _shuffle_options([correct, distractor1, distractor2, distractor3], 0)
    return {
        "difficulty": "Intermediate",
        "concept": "Defer Argument Evaluation Timing in Go",
        "question": "What value will the deferred fmt.Println print when the surrounding function returns?",
        "codeSnippet": code,
        "options": options,
        "correctIndex": c_idx,
        "explanation": (
            f"In Go, arguments to a deferred function are evaluated IMMEDIATELY when the defer statement is reached. "
            f"At that point, x was {v1}. Even though x was subsequently mutated to {v2}, the deferred call prints {v1}."
        ),
    }


# =====================================================================
# RUST DYNAMIC GENERATORS
# =====================================================================

def _gen_rust_borrow_checker(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Deep Mechanics",
        "concept": "Rust Aliasing XOR Mutability (Borrow Checker)",
        "question": "Why does the Rust compiler reject this snippet?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "let mut v = vec![10, 20, 30];\n"
            "let r = &v[0];\n"
            "v.push(40);\n"
            "println!(\"{}\", r);"
        ),
        "options": [
            "Cannot borrow 'v' as mutable ('v.push') while an immutable borrow ('r') is active, as reallocation could invalidate 'r'",
            "Vec::push is only allowed on static vectors",
            "'r' must be explicitly dropped using mem::forget",
            "println! requires a mutable reference to print vector elements",
        ],
        "correctIndex": 0,
        "explanation": (
            "Rust's core safety guarantee is 'aliasing XOR mutability'. 'v.push' requires a mutable borrow of 'v'. "
            "If vector capacity is exceeded, push reallocates memory to a new heap address, turning 'r' into a dangling pointer. "
            "The borrow checker forbids mutating 'v' while 'r' is active."
        ),
    }


def _gen_rust_move_semantics(context: Optional[dict[str, Any]]) -> dict[str, Any]:
    return {
        "difficulty": "Foundation",
        "concept": "Affine Type System: Move Semantics by Default",
        "question": "Why does 'println!(\"{}\", s1)' trigger a compiler error?",
        "codeSnippet": (
            f"{_repo_context_tag(context)}"
            "let s1 = String::from(\"production_data\");\n"
            "let s2 = s1;\n"
            "println!(\"{}\", s1);"
        ),
        "options": [
            "Ownership of the String heap buffer was moved to s2; s1 is invalidated",
            "String does not implement the Display trait",
            "Variables in Rust cannot be rebound after declaration",
            "println! takes ownership of its arguments and frees them",
        ],
        "correctIndex": 0,
        "explanation": (
            "String in Rust is a heap-allocated type that does not implement the 'Copy' trait. Assigning 's2 = s1' "
            "moves the stack pointer, length, and capacity to s2 and invalidates s1 to prevent double-free errors. "
            "Accessing s1 results in 'use of moved value'."
        ),
    }


# =====================================================================
# DISPATCH TABLE
# =====================================================================

LANGUAGE_GENERATORS = {
    "python": [
        _gen_py_mutable_default,
        _gen_py_late_binding,
        _gen_py_tuple_mutation,
        _gen_py_is_vs_equals,
        _gen_py_generator_exhaustion,
        _gen_py_class_var_shadowing,
        _gen_py_gil_multiprocessing,
        _gen_py_try_finally_return,
        _gen_py_dict_keys_mutation,
        _gen_py_shallow_copy_multiply,
    ],
    "javascript": [
        _gen_js_event_loop,
        _gen_js_var_closure_loop,
        _gen_js_this_arrow_vs_regular,
        _gen_js_object_freeze_shallow,
        _gen_js_array_sort_alphabetical,
        _gen_js_tdz,
    ],
    "typescript": [
        _gen_ts_unknown_vs_any,
        _gen_ts_distributive_conditionals,
        _gen_ts_infer_return_type,
        _gen_js_event_loop,
        _gen_js_var_closure_loop,
        _gen_js_this_arrow_vs_regular,
        _gen_js_object_freeze_shallow,
    ],
    "c": [
        _gen_c_pointer_increment,
        _gen_c_array_decay_sizeof,
        _gen_c_struct_padding,
    ],
    "cpp": [
        _gen_cpp_move_semantics,
        _gen_cpp_virtual_destructor,
        _gen_c_pointer_increment,
        _gen_c_array_decay_sizeof,
        _gen_c_struct_padding,
    ],
    "java": [
        _gen_java_autoboxing_cache,
        _gen_java_finally_override,
        _gen_java_string_interning,
    ],
    "go": [
        _gen_go_slice_append_realloc,
        _gen_go_nil_interface,
        _gen_go_defer_evaluation,
    ],
    "rust": [
        _gen_rust_borrow_checker,
        _gen_rust_move_semantics,
    ],
}


def normalize_language_key(language: str) -> str:
    lang = (language or "").strip().lower()
    if lang in ("python", "py", "python3"):
        return "python"
    if lang in ("javascript", "js", "node", "nodejs", "react"):
        return "javascript"
    if lang in ("typescript", "ts"):
        return "typescript"
    if lang in ("c", "c programming", "c-lang", "ansi-c"):
        return "c"
    if lang in ("c++", "cpp", "cplusplus", "c/c++"):
        return "cpp"
    if lang in ("java", "jvm"):
        return "java"
    if lang in ("go", "golang"):
        return "go"
    if lang in ("rust", "rs"):
        return "rust"
    if "c" in lang and "script" not in lang and "html" not in lang:
        return "c"
    return "python"


def generate_procedural_questions(
    language: str,
    context: Optional[dict[str, Any]] = None,
    count: int = 10,
) -> list[dict[str, Any]]:
    """
    Synthesizes 'count' completely customized, non-predefined questions
    tailored to the language and GitHub developer profile context.
    Ensures randomized variables, logic paths, and shuffled options.
    """
    key = normalize_language_key(language)
    generators = list(LANGUAGE_GENERATORS.get(key, LANGUAGE_GENERATORS["python"]))

    # If the target language pool has fewer than 'count' generators, blend with complementary systems generators
    if len(generators) < count:
        if key in ("typescript", "javascript"):
            pool = LANGUAGE_GENERATORS["typescript"] + LANGUAGE_GENERATORS["javascript"]
        elif key in ("c", "cpp"):
            pool = LANGUAGE_GENERATORS["c"] + LANGUAGE_GENERATORS["cpp"]
        elif key in ("go", "rust"):
            pool = LANGUAGE_GENERATORS["go"] + LANGUAGE_GENERATORS["rust"] + LANGUAGE_GENERATORS["c"]
        else:
            pool = generators + LANGUAGE_GENERATORS["python"] + LANGUAGE_GENERATORS["javascript"]

        seen_names = set()
        deduped_pool = []
        for g in pool:
            if g.__name__ not in seen_names:
                deduped_pool.append(g)
                seen_names.add(g.__name__)
        generators = deduped_pool

    # Shuffle available generators so every test gets a different sequence of concepts
    random.shuffle(generators)

    selected_gens = generators[:count]
    while len(selected_gens) < count:
        selected_gens.append(random.choice(generators))

    questions: list[dict[str, Any]] = []
    for i, gen_fn in enumerate(selected_gens, start=1):
        q_data = gen_fn(context)
        q_data["id"] = i
        questions.append(q_data)

    return questions
