"""
Skill Verifier Question Bank
Contains authentic, tricky conceptual and code-level diagnostic questions
specifically engineered to distinguish developers with real hands-on mastery
from individuals who rely solely on AI-generated or copy-pasted code.
"""

from typing import Any

QUESTION_BANK: dict[str, list[dict[str, Any]]] = {
    "c": [
        {
            "id": 1,
            "difficulty": "Intermediate",
            "concept": "Pointer Dereferencing & Operator Precedence",
            "question": "What is the final value of 'x' after executing this snippet?",
            "codeSnippet": (
                "int arr[] = {10, 20, 30};\n"
                "int *p = arr;\n"
                "int x = *p++;"
            ),
            "options": ["10", "20", "30", "Undefined behavior / Compiler error"],
            "correctIndex": 0,
            "explanation": (
                "The postfix '++' has higher precedence than unary '*', but the postfix increment "
                "yields the original pointer value for dereferencing before advancing 'p'. "
                "Thus '*p++' evaluates to arr[0] (10), and 'p' now points to arr[1]. AI copy-pasters often guess 20 or 11."
            ),
        },
        {
            "id": 2,
            "difficulty": "Deep Mechanics",
            "concept": "sizeof Operator with Arrays vs Pointers",
            "question": "What will this function print on a typical 64-bit architecture?",
            "codeSnippet": (
                "void check_size(int arr[10]) {\n"
                "    printf(\"%zu\", sizeof(arr));\n"
                "}\n\n"
                "int main() {\n"
                "    int my_arr[10];\n"
                "    check_size(my_arr);\n"
                "    return 0;\n"
                "}"
            ),
            "options": ["40 (or 10 * sizeof(int))", "8 (size of pointer on 64-bit)", "10", "Compiler warning / fails to compile"],
            "correctIndex": 1,
            "explanation": (
                "In C, array parameters in function signatures decay into pointers. Despite writing 'int arr[10]', "
                "the compiler treats it as 'int *arr'. Therefore sizeof(arr) evaluates to the pointer size (8 bytes on 64-bit), "
                "not the 40 bytes of the original array. A classic differentiator between genuine C developers and AI-prompted coders."
            ),
        },
        {
            "id": 3,
            "difficulty": "Intermediate",
            "concept": "String Literals & Memory Segments",
            "question": "What happens when executing the line 's[0] = 'H';'?",
            "codeSnippet": (
                "char *s = \"hello\";\n"
                "s[0] = 'H';"
            ),
            "options": [
                "The string becomes \"Hello\"",
                "Segmentation fault / Bus error (Undefined behavior)",
                "Compile error: assignment of read-only location",
                "A copy of the string is created with 'H'"
            ],
            "correctIndex": 1,
            "explanation": (
                "\"hello\" is stored in read-only memory (.rodata segment). Writing to it causes a segmentation fault "
                "at runtime. To allow mutation, it must be declared as an array: 'char s[] = \"hello\";'. AI-generated code "
                "often blends char* and char[] carelessly."
            ),
        },
        {
            "id": 4,
            "difficulty": "Deep Mechanics",
            "concept": "Dynamic Memory Allocation & Dangling Pointers",
            "question": "Identify the primary memory defect in this snippet:",
            "codeSnippet": (
                "int* create_integer(int val) {\n"
                "    int num = val * 2;\n"
                "    return &num;\n"
                "}"
            ),
            "options": [
                "Memory leak because 'num' is not freed",
                "Dangling pointer returning address of a stack-allocated local variable",
                "Buffer overflow if val exceeds INT_MAX",
                "NULL pointer dereference"
            ],
            "correctIndex": 1,
            "explanation": (
                "'num' is allocated on the stack frame of 'create_integer'. When the function returns, "
                "its stack frame is invalidated. Returning '&num' produces a dangling pointer, leading to undefined behavior "
                "when dereferenced by the caller."
            ),
        },
        {
            "id": 5,
            "difficulty": "Fundamental",
            "concept": "String Null Terminator",
            "question": "What is the minimum array size needed to safely store the C-string \"SkillGap\"?",
            "codeSnippet": 'char str[SIZE] = "SkillGap";',
            "options": ["8", "9", "16", "7"],
            "correctIndex": 1,
            "explanation": (
                "\"SkillGap\" has 8 characters. C-strings require an additional 1 byte for the null terminator ('\\0'), "
                "making the required buffer size at least 9 bytes. Omitting this causes dangerous buffer over-reads."
            ),
        },
        {
            "id": 6,
            "difficulty": "Deep Mechanics",
            "concept": "Memory Leaks with realloc",
            "question": "Why is 'ptr = realloc(ptr, new_size);' considered dangerous practice in C?",
            "codeSnippet": (
                "void *ptr = malloc(100);\n"
                "/* ... */\n"
                "ptr = realloc(ptr, 500);"
            ),
            "options": [
                "realloc always frees the old pointer even on failure",
                "If realloc fails, it returns NULL, immediately leaking the original 100 bytes",
                "realloc cannot increase the size of an existing heap buffer",
                "realloc requires casting the return value to (void**)"
            ],
            "correctIndex": 1,
            "explanation": (
                "If realloc() fails to allocate memory, it returns NULL, but the original memory block remains allocated. "
                "Assigning the return value directly back to 'ptr' overwrites the only reference to the original block with NULL, "
                "causing a permanent memory leak. Correct idiom uses a temporary pointer."
            ),
        },
        {
            "id": 7,
            "difficulty": "Intermediate",
            "concept": "Struct Padding & Memory Alignment",
            "question": "On a standard 64-bit system, what is the expected sizeof(struct Data)?",
            "codeSnippet": (
                "struct Data {\n"
                "    char a;\n"
                "    int b;\n"
                "    char c;\n"
                "};"
            ),
            "options": ["6 bytes (1 + 4 + 1)", "12 bytes (due to alignment padding)", "8 bytes", "16 bytes"],
            "correctIndex": 1,
            "explanation": (
                "Because 'int' requires 4-byte alignment, 3 padding bytes follow 'char a' (offset 4 for b). "
                "After 'char c' (offset 8), 3 more padding bytes are appended to make the entire struct size a multiple of 4. "
                "Total: 1 + 3 + 4 + 1 + 3 = 12 bytes. Real C programmers understand data alignment; AI prompt-copiers assume 6."
            ),
        },
        {
            "id": 8,
            "difficulty": "Fundamental",
            "concept": "Pass-by-Value vs Pointers",
            "question": "Why does this swap function fail to swap the caller's variables?",
            "codeSnippet": (
                "void swap(int a, int b) {\n"
                "    int temp = a;\n"
                "    a = b;\n"
                "    b = temp;\n"
                "}"
            ),
            "options": [
                "C passes arguments by value, so copies of 'a' and 'b' are swapped locally in the function frame",
                "'temp' must be declared static to persist changes",
                "The compiler optimizes out the temporary assignment",
                "C does not allow variable names 'a' and 'b' across scopes"
            ],
            "correctIndex": 0,
            "explanation": (
                "C only supports pass-by-value. To modify caller variables, one must explicitly pass pointers ('int *a, int *b') "
                "and dereference them ('*a = *b'). Anyone claiming C proficiency must intuitively know this."
            ),
        },
        {
            "id": 9,
            "difficulty": "Deep Mechanics",
            "concept": "Undefined Behavior & Sequence Points",
            "question": "What is the result of executing 'x = x++ + ++x;' in C?",
            "codeSnippet": (
                "int x = 5;\n"
                "x = x++ + ++x;"
            ),
            "options": [
                "12",
                "13",
                "Undefined behavior (modifying a variable multiple times without an intervening sequence point)",
                "Compile error"
            ],
            "correctIndex": 2,
            "explanation": (
                "In C (prior to C11/C17/C23 sequence point clarifications and even within them for this pattern), "
                "modifying the same scalar object multiple times between sequence points results in undefined behavior. "
                "Compilers produce wildly different outputs or optimize arbitrarily."
            ),
        },
        {
            "id": 10,
            "difficulty": "Intermediate",
            "concept": "Macro Pitfalls & Side Effects",
            "question": "What will this code print?",
            "codeSnippet": (
                "#define SQUARE(x) x * x\n\n"
                "int main() {\n"
                "    int res = SQUARE(2 + 3);\n"
                "    printf(\"%d\", res);\n"
                "    return 0;\n"
                "}"
            ),
            "options": ["25", "11", "13", "10"],
            "correctIndex": 1,
            "explanation": (
                "The preprocessor performs direct textual substitution: '2 + 3 * 2 + 3'. "
                "By operator precedence, this evaluates to 2 + (3 * 2) + 3 = 2 + 6 + 3 = 11, NOT (2+3)*(2+3) = 25. "
                "Macros must always use enclosing parentheses: '#define SQUARE(x) ((x) * (x))'."
            ),
        },
        {
            "id": 11,
            "difficulty": "Intermediate",
            "concept": "Const Correctness with Pointers",
            "question": "What does 'const int *ptr' mean?",
            "codeSnippet": "const int *ptr;",
            "options": [
                "Pointer is constant (cannot change which address it points to)",
                "The value pointed to is constant (read-only through this pointer)",
                "Both the pointer and the pointed value are constant",
                "Invalid syntax in standard C"
            ],
            "correctIndex": 1,
            "explanation": (
                "'const int *ptr' (or 'int const *ptr') means the integer value pointed to is constant. "
                "To make the pointer itself constant, one writes 'int * const ptr'."
            ),
        },
    ],
    "python": [
        {
            "id": 1,
            "difficulty": "Intermediate",
            "concept": "Mutable Default Arguments",
            "question": "What is the output of the second call to append_to()?",
            "codeSnippet": (
                "def append_to(item, target=[]):\n"
                "    target.append(item)\n"
                "    return target\n\n"
                "print(append_to(1))\n"
                "print(append_to(2))"
            ),
            "options": ["[1] then [2]", "[1] then [1, 2]", "[1] then [[1], [2]]", "TypeError"],
            "correctIndex": 1,
            "explanation": (
                "Default arguments in Python are evaluated once at function definition time, NOT at invocation time. "
                "The list 'target' is shared across all function calls that do not provide a target argument. "
                "Thus, the second call appends 2 to the existing list [1], producing [1, 2]."
            ),
        },
        {
            "id": 2,
            "difficulty": "Deep Mechanics",
            "concept": "Global Interpreter Lock (GIL)",
            "question": "How does Python's standard CPython GIL affect CPU-bound multithreaded code?",
            "codeSnippet": None,
            "options": [
                "It accelerates CPU-bound tasks across multiple cores automatically",
                "It restricts bytecode execution to one native thread at a time, preventing true multi-core speedup for CPU tasks",
                "It prevents memory leaks by disabling garbage collection during thread execution",
                "It forces all I/O bound operations to run synchronously"
            ],
            "correctIndex": 1,
            "explanation": (
                "In CPython, the Global Interpreter Lock (GIL) is a mutex protecting access to Python objects, "
                "preventing multiple threads from executing Python bytecodes at once. CPU-bound multithreading in CPython "
                "does not achieve multicore parallelism; multiprocessing or native C extensions are required."
            ),
        },
        {
            "id": 3,
            "difficulty": "Intermediate",
            "concept": "List Comprehension Scoping vs Generator Expressions",
            "question": "What will this snippet print in Python 3?",
            "codeSnippet": (
                "funcs = [lambda x: x + i for i in range(3)]\n"
                "print([f(10) for f in funcs])"
            ),
            "options": ["[10, 11, 12]", "[12, 12, 12]", "[10, 10, 10]", "NameError: 'i' not found"],
            "correctIndex": 1,
            "explanation": (
                "Closures in Python bind late (by reference, not by value). When the lambdas are executed, "
                "the loop has finished and 'i' has the final value 2. Each lambda evaluates 10 + 2 = 12. "
                "To capture the current value, use a default argument: 'lambda x, i=i: x + i'."
            ),
        },
        {
            "id": 4,
            "difficulty": "Fundamental",
            "concept": "Shallow Copy vs Deep Copy",
            "question": "What will 'b[0][0]' be after this sequence?",
            "codeSnippet": (
                "import copy\n"
                "a = [[1, 2], [3, 4]]\n"
                "b = list(a)\n"
                "a[0][0] = 99\n"
                "print(b[0][0])"
            ),
            "options": ["1", "99", "None", "IndexError"],
            "correctIndex": 1,
            "explanation": (
                "'list(a)' creates a shallow copy of the outer list, but the nested inner lists are referenced, "
                "not duplicated. Mutating 'a[0][0]' directly impacts 'b[0][0]'. A deep copy ('copy.deepcopy(a)') is needed for full isolation."
            ),
        },
        {
            "id": 5,
            "difficulty": "Deep Mechanics",
            "concept": "__new__ vs __init__",
            "question": "What is the fundamental difference between __new__ and __init__ in Python classes?",
            "codeSnippet": None,
            "options": [
                "__new__ initializes an existing instance, while __init__ creates the memory object",
                "__new__ is the static constructor that creates and returns a new instance; __init__ initializes it after creation",
                "__new__ is only used for metaclasses, while __init__ is for standard classes",
                "There is no difference; they are aliases"
            ],
            "correctIndex": 1,
            "explanation": (
                "__new__ is responsible for creating and returning the object instance (commonly overridden in singletons or immutable subclasses like tuple/int). "
                "__init__ receives the already-created instance as 'self' to configure its attributes."
            ),
        },
        {
            "id": 6,
            "difficulty": "Intermediate",
            "concept": "Dictionary Hashability",
            "question": "Which of the following can be safely used as a dictionary key in Python?",
            "codeSnippet": None,
            "options": [
                "([1, 2], 'name')",
                "(1, 2, ('sub', 3))",
                "{'id': 1}",
                "[1, 2, 3]"
            ],
            "correctIndex": 1,
            "explanation": (
                "Dictionary keys must be hashable (immutable throughout their lifetime). "
                "A tuple is hashable only if all its nested elements are also hashable. "
                "'(1, 2, ('sub', 3))' contains only immutable ints, strings, and tuples. "
                "Options with lists or dicts raise 'TypeError: unhashable type'."
            ),
        },
        {
            "id": 7,
            "difficulty": "Deep Mechanics",
            "concept": "Generators & Memory Efficiency",
            "question": "What happens in terms of memory when evaluating '(x**2 for x in range(10_000_000))'?",
            "codeSnippet": None,
            "options": [
                "It immediately allocates approximately 80MB of RAM for the numbers",
                "It returns a lazy generator iterator that computes values on demand with O(1) memory footprint",
                "It raises MemoryError immediately on 32-bit systems",
                "It creates a frozen tuple"
            ],
            "correctIndex": 1,
            "explanation": (
                "Parentheses around a comprehension create a generator expression, which produces items lazily on each next() call. "
                "Memory consumption remains minuscule (O(1)) regardless of sequence length."
            ),
        },
        {
            "id": 8,
            "difficulty": "Fundamental",
            "concept": "is vs ==",
            "question": "What is the difference between 'a == b' and 'a is b' in Python?",
            "codeSnippet": None,
            "options": [
                "'==' checks identity (same memory address), 'is' checks value equality",
                "'==' checks equality of values (__eq__), while 'is' checks object identity (same memory address via id())",
                "They are strictly identical in Python 3",
                "'is' only works with Boolean values"
            ],
            "correctIndex": 1,
            "explanation": (
                "'==' tests value equality using the __eq__ method. 'is' tests reference identity (whether two identifiers point to the identical object in memory)."
            ),
        },
        {
            "id": 9,
            "difficulty": "Intermediate",
            "concept": "Scope and nonlocal keyword",
            "question": "What keyword is required at LINE_X to modify the outer variable 'count' without error?",
            "codeSnippet": (
                "def outer():\n"
                "    count = 0\n"
                "    def inner():\n"
                "        # LINE_X\n"
                "        count += 1\n"
                "        return count\n"
                "    return inner"
            ),
            "options": ["global count", "nonlocal count", "outer count", "static count"],
            "correctIndex": 1,
            "explanation": (
                "Without 'nonlocal count', assigning to 'count' inside 'inner' treats it as a local variable before assignment, "
                "triggering 'UnboundLocalError'. 'nonlocal' directs Python to bind to the nearest enclosing non-global scope."
            ),
        },
        {
            "id": 10,
            "difficulty": "Deep Mechanics",
            "concept": "Decorator Mechanics",
            "question": "Why is 'functools.wraps' strongly recommended when authoring custom decorators?",
            "codeSnippet": None,
            "options": [
                "It accelerates the decorated function's execution via JIT compilation",
                "It preserves the original function's metadata, such as __name__, __doc__, and type annotations",
                "It makes the decorator thread-safe by acquiring the GIL",
                "It ensures the function can only be invoked once"
            ],
            "correctIndex": 1,
            "explanation": (
                "Decorating a function without @functools.wraps replaces the decorated function's identity with the inner wrapper, "
                "losing docstrings, module names, and __name__ (which becomes 'wrapper'). This breaks reflection, debugging, and introspection."
            ),
        },
    ],
    "javascript": [
        {
            "id": 1,
            "difficulty": "Deep Mechanics",
            "concept": "Event Loop: Microtasks vs Macrotasks",
            "question": "What is the exact console output order?",
            "codeSnippet": (
                "console.log('1');\n"
                "setTimeout(() => console.log('2'), 0);\n"
                "Promise.resolve().then(() => console.log('3'));\n"
                "console.log('4');"
            ),
            "options": ["1, 2, 3, 4", "1, 4, 3, 2", "1, 4, 2, 3", "1, 3, 4, 2"],
            "correctIndex": 1,
            "explanation": (
                "Synchronous code runs first ('1', '4'). Next, the microtask queue (Promise.then) is completely emptied "
                "before the event loop pulls from the macrotask/task queue (setTimeout). Therefore: 1, 4, 3, 2. "
                "A foundational test separating real JavaScript engineers from prompt-copiers."
            ),
        },
        {
            "id": 2,
            "difficulty": "Intermediate",
            "concept": "this Context in Arrow Functions vs Regular Functions",
            "question": "What will obj.getRegular() and obj.getArrow() output?",
            "codeSnippet": (
                "const obj = {\n"
                "    val: 42,\n"
                "    getRegular: function() { return this.val; },\n"
                "    getArrow: () => { return this.val; }\n"
                "};"
            ),
            "options": [
                "42 and 42",
                "42 and undefined (or window.val / global val)",
                "undefined and 42",
                "Throws TypeError"
            ],
            "correctIndex": 1,
            "explanation": (
                "Arrow functions do not bind their own 'this'; they inherit 'this' lexically from their enclosing scope "
                "(which in this case is the outer module/global scope, where 'val' does not exist on global/window). "
                "Regular functions bind 'this' to the calling object 'obj'."
            ),
        },
        {
            "id": 3,
            "difficulty": "Fundamental",
            "concept": "Type Coercion & Equality",
            "question": "What is the result of '[] == ![]' in JavaScript?",
            "codeSnippet": "console.log([] == ![]);",
            "options": ["false", "true", "TypeError", "undefined"],
            "correctIndex": 1,
            "explanation": (
                "![] coerces to boolean false (since [] is truthy). The expression becomes '[] == false'. "
                "With loose equality, false coerces to number 0. Then [] coerces to primitive string \"\", which coerces to 0. "
                "0 == 0 evaluates to true. Demonstrates why '===' is essential in robust codebases."
            ),
        },
        {
            "id": 4,
            "difficulty": "Deep Mechanics",
            "concept": "Closures & Variable Scoping with var vs let",
            "question": "What will this loop output after 100ms?",
            "codeSnippet": (
                "for (var i = 0; i < 3; i++) {\n"
                "    setTimeout(() => console.log(i), 100);\n"
                "}"
            ),
            "options": ["0, 1, 2", "3, 3, 3", "undefined, undefined, undefined", "0, 0, 0"],
            "correctIndex": 1,
            "explanation": (
                "'var' is function-scoped (or globally scoped), not block-scoped. All three timer callbacks close over "
                "the exact same variable 'i'. By the time the callbacks fire, the loop has completed with i = 3. "
                "Changing 'var' to 'let' creates a new block-scoped binding per iteration, yielding 0, 1, 2."
            ),
        },
        {
            "id": 5,
            "difficulty": "Intermediate",
            "concept": "Array Mutation vs Pure Methods",
            "question": "Which of the following array methods mutates the original array in place?",
            "codeSnippet": None,
            "options": ["array.slice()", "array.splice()", "array.map()", "array.concat()"],
            "correctIndex": 1,
            "explanation": (
                "'splice()' modifies the original array directly by removing or replacing elements. "
                "In contrast, 'slice()', 'map()', and 'concat()' return new array instances without altering the source."
            ),
        },
        {
            "id": 6,
            "difficulty": "Deep Mechanics",
            "concept": "Prototypal Inheritance Chain",
            "question": "What is the terminal link at the top of the standard JavaScript prototype chain?",
            "codeSnippet": None,
            "options": ["Object.prototype.__proto__ === null", "Function.prototype", "undefined", "window / globalThis"],
            "correctIndex": 0,
            "explanation": (
                "The prototype chain terminates at Object.prototype, whose prototype (__proto__) is explicitly 'null'. "
                "Attempting to traverse past it stops the lookup."
            ),
        },
        {
            "id": 7,
            "difficulty": "Intermediate",
            "concept": "Async/Await Error Handling",
            "question": "What happens if a rejected Promise is awaited without a try/catch block?",
            "codeSnippet": (
                "async function run() {\n"
                "    await Promise.reject(new Error('fail'));\n"
                "    console.log('done');\n"
                "}"
            ),
            "options": [
                "'done' is logged and error is ignored",
                "The function pauses execution, throws the error, and returns a rejected promise",
                "The program hangs indefinitely",
                "SyntaxError: unhandled rejection"
            ],
            "correctIndex": 1,
            "explanation": (
                "Awaiting a rejected promise immediately converts the rejection into an uncaught exception in the async function, "
                "halting subsequent lines (e.g. 'done' is never printed) and rejecting the outer promise."
            ),
        },
        {
            "id": 8,
            "difficulty": "Fundamental",
            "concept": "typeof quirk",
            "question": "What is the return value of 'typeof null' in JavaScript?",
            "codeSnippet": "console.log(typeof null);",
            "options": ["\"null\"", "\"undefined\"", "\"object\"", "\"boolean\""],
            "correctIndex": 2,
            "explanation": (
                "In the initial implementation of JavaScript, values were represented with type tags. "
                "The object type tag was 0, and the null pointer was represented as 0x00, resulting in 'typeof null === \"object\"'. "
                "This legacy quirk remains preserved for backwards compatibility."
            ),
        },
        {
            "id": 9,
            "difficulty": "Deep Mechanics",
            "concept": "Object Property Descriptors & Immutability",
            "question": "What is the difference between Object.seal() and Object.freeze()?",
            "codeSnippet": None,
            "options": [
                "Object.seal() prevents adding/deleting properties but allows modifying existing writable properties; Object.freeze() makes all existing properties read-only as well",
                "Object.freeze() allows deletions, Object.seal() does not",
                "Object.freeze() performs a recursive deep freeze on nested objects",
                "They are identical aliases in ECMAScript"
            ],
            "correctIndex": 0,
            "explanation": (
                "Object.seal() sets configurable: false for all properties (no adding or deleting), but existing writable properties "
                "can still be changed. Object.freeze() does everything seal() does PLUS sets writable: false on all properties. Neither is deeply recursive by default."
            ),
        },
        {
            "id": 10,
            "difficulty": "Intermediate",
            "concept": "Optional Chaining & Nullish Coalescing",
            "question": "What is the value of 'result'?",
            "codeSnippet": (
                "const data = { count: 0 };\n"
                "const result = data.count ?? 10;\n"
                "console.log(result);"
            ),
            "options": ["10", "0", "undefined", "NaN"],
            "correctIndex": 1,
            "explanation": (
                "The nullish coalescing operator (??) only falls back if the left-hand side is strictly 'null' or 'undefined'. "
                "Because data.count is 0 (a valid number, despite being falsy for ||), 'result' evaluates to 0. "
                "Using || would incorrectly produce 10."
            ),
        },
    ],
    "cpp": [
        {
            "id": 1,
            "difficulty": "Deep Mechanics",
            "concept": "RAII & Smart Pointers",
            "question": "What happens when 'ptr2 = std::move(ptr1);' is executed?",
            "codeSnippet": (
                "std::unique_ptr<int> ptr1 = std::make_unique<int>(100);\n"
                "std::unique_ptr<int> ptr2 = std::move(ptr1);"
            ),
            "options": [
                "Both ptr1 and ptr2 point to the integer 100",
                "Ownership transfers to ptr2; ptr1 becomes nullptr (empty)",
                "The integer is duplicated in heap memory",
                "Compilation error: unique_ptr cannot be moved"
            ],
            "correctIndex": 1,
            "explanation": (
                "std::unique_ptr enforces sole ownership of a resource. Move construction transfers the managed pointer "
                "from ptr1 to ptr2, setting ptr1 to nullptr. Copying is deleted on unique_ptr."
            ),
        },
        {
            "id": 2,
            "difficulty": "Deep Mechanics",
            "concept": "Virtual Destructors & Polymorphism",
            "question": "Why must a base class with virtual functions declare a virtual destructor?",
            "codeSnippet": (
                "class Base {\n"
                "public:\n"
                "    virtual void doWork() {}\n"
                "    virtual ~Base() {}\n"
                "};"
            ),
            "options": [
                "To prevent derived classes from overriding the destructor",
                "To ensure the derived class destructor is invoked when deleting an object through a pointer to Base",
                "To allow the class to be instantiated as an abstract class",
                "To speed up runtime dynamic_cast operations"
            ],
            "correctIndex": 1,
            "explanation": (
                "Deleting a derived object through a Base pointer without a virtual destructor results in undefined behavior "
                "and typically fails to invoke the derived destructor, causing resource and memory leaks."
            ),
        },
        {
            "id": 3,
            "difficulty": "Intermediate",
            "concept": "References vs Pointers",
            "question": "Which of the following is TRUE about C++ references?",
            "codeSnippet": None,
            "options": [
                "References can be re-bound to point to another object after initialization",
                "A reference must be initialized upon declaration and cannot be null (in well-defined code)",
                "Taking the address of a reference (&ref) gives the address of the reference itself, not the referent",
                "References require explicit dereferencing with the '*' operator"
            ],
            "correctIndex": 1,
            "explanation": (
                "A C++ reference is an alias to an existing object. It must be bound at creation and cannot be rebound. "
                "Operations on a reference (including taking its address) act directly on the referent object."
            ),
        },
        {
            "id": 4,
            "difficulty": "Deep Mechanics",
            "concept": "Iterator Invalidation in std::vector",
            "question": "What dangerous condition can occur when calling 'vec.push_back(x)' inside an iterator loop?",
            "codeSnippet": None,
            "options": [
                "Stack overflow due to recursive reallocation",
                "Iterator invalidation if vector capacity is exceeded and reallocation moves memory to a new block",
                "Deadlock on the underlying allocator lock",
                "Syntax error because std::vector is immutable during iteration"
            ],
            "correctIndex": 1,
            "explanation": (
                "If 'vec.push_back()' causes the vector to grow beyond its current capacity, it allocates a new buffer, "
                "copies/moves existing elements, and frees the old block. Any active iterators, references, or pointers to elements "
                "in the old block become invalid immediately."
            ),
        },
        {
            "id": 5,
            "difficulty": "Intermediate",
            "concept": "std::move Semantics",
            "question": "What does 'std::move(x)' actually do at the assembly / machine level?",
            "codeSnippet": None,
            "options": [
                "It copies memory bytes using memmove()",
                "It is an unconditional cast to an rvalue reference (static_cast<T&&>(x)) with zero runtime overhead",
                "It spawns an asynchronous background transfer thread",
                "It frees the source variable 'x'"
            ],
            "correctIndex": 1,
            "explanation": (
                "std::move does not move any memory itself! It is simply a compile-time static_cast to an rvalue reference (T&&), "
                "signaling to overload resolution that move constructors or move assignment operators may take ownership."
            ),
        },
        {
            "id": 6,
            "difficulty": "Fundamental",
            "concept": "Const Methods",
            "question": "What does a trailing 'const' on a member function 'int get() const;' enforce?",
            "codeSnippet": "int getValue() const;",
            "options": [
                "The return value cannot be modified",
                "The method cannot modify any non-mutable member variables of the calling object",
                "The method can only be called from const constructors",
                "The method is evaluated at compile time like constexpr"
            ],
            "correctIndex": 1,
            "explanation": (
                "A const member function treats the implicit 'this' pointer as pointing to const ('const ClassName * const this'), "
                "preventing mutation of member variables unless explicitly marked 'mutable'."
            ),
        },
        {
            "id": 7,
            "difficulty": "Deep Mechanics",
            "concept": "Rule of 5",
            "question": "In modern C++ (C++11 and later), what are the 5 special member functions in the 'Rule of 5'?",
            "codeSnippet": None,
            "options": [
                "Constructor, Destructor, Copy Constructor, Copy Assignment, Move Constructor",
                "Destructor, Copy Constructor, Copy Assignment, Move Constructor, Move Assignment",
                "Default Constructor, Parameterized Constructor, Copy Constructor, Move Constructor, Destructor",
                "Initialize, Allocate, Execute, Deallocate, Finalize"
            ],
            "correctIndex": 1,
            "explanation": (
                "The Rule of 5 states that if a class manages resources and requires a custom destructor, copy constructor, "
                "or copy assignment operator, it almost certainly needs all five: Destructor, Copy Constructor, Copy Assignment, "
                "Move Constructor, and Move Assignment."
            ),
        },
        {
            "id": 8,
            "difficulty": "Intermediate",
            "concept": "Pass by Const Reference",
            "question": "Why is 'const std::string& s' preferred over 'std::string s' for function parameters?",
            "codeSnippet": "void print_text(const std::string& s);",
            "options": [
                "It avoids dynamic heap allocation and deep copying of the string buffer on every call",
                "C++ does not allow passing objects by value",
                "It forces the string to be stored in CPU registers",
                "It allows the function to modify the caller's string in place"
            ],
            "correctIndex": 0,
            "explanation": (
                "Passing by value ('std::string s') invokes the copy constructor, which may allocate memory on the heap "
                "and copy the characters. Passing by const reference binds to the existing instance without copying."
            ),
        },
        {
            "id": 9,
            "difficulty": "Deep Mechanics",
            "concept": "Undefined Behavior: Out of Bounds Access",
            "question": "What is the difference between 'vec[i]' and 'vec.at(i)' in std::vector?",
            "codeSnippet": None,
            "options": [
                "'vec[i]' performs bounds checking while 'vec.at(i)' does not",
                "'vec.at(i)' performs bounds checking and throws std::out_of_range on invalid index; 'vec[i]' does no bounds checking for maximum speed",
                "'vec.at(i)' works with negative indices like Python; 'vec[i]' does not",
                "They are identical"
            ],
            "correctIndex": 1,
            "explanation": (
                "'vec[i]' provides direct unchecked buffer access. Accessing out of bounds causes undefined behavior. "
                "'vec.at(i)' checks bounds and throws std::out_of_range if 'i >= vec.size()'."
            ),
        },
        {
            "id": 10,
            "difficulty": "Fundamental",
            "concept": "delete vs delete[]",
            "question": "What is the consequence of matching 'int *arr = new int[50];' with 'delete arr;' instead of 'delete[] arr;'?",
            "codeSnippet": None,
            "options": [
                "Undefined behavior (typically only one element destructed or heap corruption occurs)",
                "Safe in C++20 and later",
                "Compilation error",
                "Automatically handled by the runtime"
            ],
            "correctIndex": 0,
            "explanation": (
                "Allocations made with 'new[]' must be deallocated with 'delete[]'. Mismatched deletion is undefined behavior "
                "and causes memory corruption or resource leaks because the allocator doesn't know the array size/element destructors."
            ),
        },
    ],
    "typescript": [
        {
            "id": 1,
            "difficulty": "Intermediate",
            "concept": "unknown vs any",
            "question": "Why is 'unknown' preferred over 'any' for untyped values?",
            "codeSnippet": None,
            "options": [
                "'unknown' disables all type checking completely",
                "'unknown' is type-safe; TypeScript forces you to perform type narrowing before performing operations on it",
                "'unknown' is compiled into WebAssembly",
                "'unknown' can only accept primitive types"
            ],
            "correctIndex": 1,
            "explanation": (
                "While 'any' allows arbitrary property access and method calls without checks (bypassing the type system), "
                "'unknown' forbids any operation until narrowed via typeof, instanceof, or custom type guards."
            ),
        },
        {
            "id": 2,
            "difficulty": "Deep Mechanics",
            "concept": "Discriminated Unions & Exhaustiveness Checking",
            "question": "What type should be assigned to '_exhaustiveCheck' to ensure all union variants are handled at compile time?",
            "codeSnippet": (
                "type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; size: number };\n\n"
                "function getArea(s: Shape): number {\n"
                "    switch (s.kind) {\n"
                "        case 'circle': return Math.PI * s.radius ** 2;\n"
                "        case 'square': return s.size * s.size;\n"
                "        default:\n"
                "            const _exhaustiveCheck: TYPE_HERE = s;\n"
                "            return _exhaustiveCheck;\n"
                "    }\n"
                "}"
            ),
            "options": ["any", "never", "unknown", "void"],
            "correctIndex": 1,
            "explanation": (
                "Assigning to type 'never' in the default branch guarantees compile-time exhaustiveness checking. "
                "If a new variant is added to Shape without updating the switch statement, TypeScript flags a compilation error."
            ),
        },
        {
            "id": 3,
            "difficulty": "Intermediate",
            "concept": "interface vs type aliases",
            "question": "Which capability is uniquely supported by TypeScript 'interface' but NOT by 'type' alias?",
            "codeSnippet": None,
            "options": [
                "Declaration merging (multiple declarations with the same name are merged)",
                "Union types",
                "Tuple declarations",
                "Primitive aliases"
            ],
            "correctIndex": 0,
            "explanation": (
                "Interfaces support declaration merging: declaring the same interface multiple times merges their members. "
                "Type aliases cannot be redeclared and will error on duplicate identifier."
            ),
        },
        {
            "id": 4,
            "difficulty": "Fundamental",
            "concept": "Type Narrowing with typeof",
            "question": "What is the narrowed type of 'value' inside the if block?",
            "codeSnippet": (
                "function process(value: string | number) {\n"
                "    if (typeof value === 'string') {\n"
                "        // What is typeof value here?\n"
                "    }\n"
                "}"
            ),
            "options": ["string", "string | number", "any", "unknown"],
            "correctIndex": 0,
            "explanation": (
                "TypeScript uses control flow analysis to narrow union types based on type guards like 'typeof value === \"string\"'."
            ),
        },
        {
            "id": 5,
            "difficulty": "Deep Mechanics",
            "concept": "Utility Types: Partial and Pick",
            "question": "What is the resulting type of 'Pick<User, 'id' | 'email'>'?",
            "codeSnippet": (
                "interface User {\n"
                "    id: string;\n"
                "    name: string;\n"
                "    email: string;\n"
                "    age: number;\n"
                "}"
            ),
            "options": [
                "A type with all properties of User except 'id' and 'email'",
                "A type containing only { id: string; email: string; }",
                "A type where 'id' and 'email' are optional",
                "A tuple containing ['id', 'email']"
            ],
            "correctIndex": 1,
            "explanation": (
                "Pick<T, K> constructs a type by picking the set of properties K from T. "
                "It produces an interface with only { id: string; email: string; }."
            ),
        },
        {
            "id": 6,
            "difficulty": "Deep Mechanics",
            "concept": "Generics & keyof Constraint",
            "question": "What constraint on K ensures that 'getProperty(obj, key)' is 100% type-safe?",
            "codeSnippet": "function getProperty<T, K extends ???>(obj: T, key: K): T[K] { return obj[key]; }",
            "options": ["keyof T", "string", "keyof any", "Index<T>"],
            "correctIndex": 0,
            "explanation": (
                "'K extends keyof T' constrains K to only valid property names of T, ensuring 'T[K]' can be looked up safely without runtime errors."
            ),
        },
        {
            "id": 7,
            "difficulty": "Intermediate",
            "concept": "Readonly Arrays",
            "question": "What happens when calling 'numbers.push(4)' on 'const numbers: readonly number[] = [1, 2, 3];'?",
            "codeSnippet": None,
            "options": [
                "Compiles cleanly and adds 4",
                "Compile error: Property 'push' does not exist on type 'readonly number[]'",
                "Runtime TypeError: Cannot add property",
                "Silent failure"
            ],
            "correctIndex": 1,
            "explanation": (
                "'readonly number[]' removes all mutating methods (push, pop, splice, shift, unshift) at compile time, preventing accidental modifications."
            ),
        },
        {
            "id": 8,
            "difficulty": "Fundamental",
            "concept": "as const Assertion",
            "question": "What type does TypeScript infer for 'const colors = ['red', 'green'] as const;'?",
            "codeSnippet": None,
            "options": [
                "string[]",
                "readonly ['red', 'green'] (tuple of literal types)",
                "['red' | 'green']",
                "Array<string>"
            ],
            "correctIndex": 1,
            "explanation": (
                "The 'as const' assertion prevents type widening to string[] and marks all properties readonly, "
                "producing the literal tuple type 'readonly [\"red\", \"green\"]'."
            ),
        },
        {
            "id": 9,
            "difficulty": "Deep Mechanics",
            "concept": "Excess Property Checks in Object Literals",
            "question": "Why does 'const p: Point = { x: 1, y: 2, z: 3 };' fail if interface Point only defines x and y?",
            "codeSnippet": None,
            "options": [
                "TypeScript uses structural typing for variables, but performs strict excess property checking on direct object literals",
                "Point is an abstract class",
                "TypeScript forbids any object from having more than two fields",
                "The z coordinate is reserved"
            ],
            "correctIndex": 0,
            "explanation": (
                "While TypeScript uses structural typing, direct object literals undergo excess property checks "
                "to catch typos in property names. If passed via an intermediate variable, it is allowed."
            ),
        },
        {
            "id": 10,
            "difficulty": "Intermediate",
            "concept": "Type Assertions vs Type Casting",
            "question": "Does TypeScript type assertion 'value as string' perform any runtime type conversion?",
            "codeSnippet": None,
            "options": [
                "Yes, it calls .toString() under the hood",
                "No, it is purely a compile-time instruction to the type checker and produces zero JavaScript runtime code",
                "Yes, it converts numbers or booleans into string representations",
                "Yes, but only in strict mode"
            ],
            "correctIndex": 1,
            "explanation": (
                "Type assertions ('as T') are erased completely during compilation. They do not alter the runtime representation or convert values."
            ),
        },
    ],
    "java": [
        {
            "id": 1,
            "difficulty": "Fundamental",
            "concept": "String Pool vs Heap",
            "question": "What will 's1 == s2' and 's1 == s3' evaluate to in Java?",
            "codeSnippet": (
                "String s1 = \"hello\";\n"
                "String s2 = \"hello\";\n"
                "String s3 = new String(\"hello\");\n"
                "System.out.println((s1 == s2) + \" \" + (s1 == s3));"
            ),
            "options": ["true true", "true false", "false false", "false true"],
            "correctIndex": 1,
            "explanation": (
                "String literals are stored in the String Constant Pool, so s1 and s2 reference the same memory address ('s1 == s2' is true). "
                "'new String(\"hello\")' explicitly creates a new distinct object on the heap, so 's1 == s3' is false (though s1.equals(s3) is true)."
            ),
        },
        {
            "id": 2,
            "difficulty": "Deep Mechanics",
            "concept": "volatile Keyword in Concurrency",
            "question": "What guarantee does the 'volatile' keyword provide in Java?",
            "codeSnippet": "private volatile boolean running = true;",
            "options": [
                "It makes operations on the variable completely atomic (thread-safe for compound operations like count++)",
                "It guarantees visibility of writes across threads and establishes a happens-before relationship, but does NOT make compound operations atomic",
                "It locks the entire class during variable read",
                "It serializes access using an internal ReentrantLock"
            ],
            "correctIndex": 1,
            "explanation": (
                "'volatile' ensures that reads and writes are made directly to/from main memory rather than CPU caches, "
                "guaranteeing cross-thread visibility. It does NOT make non-atomic compound operations (like count++) atomic."
            ),
        },
        {
            "id": 3,
            "difficulty": "Intermediate",
            "concept": "Checked vs Unchecked Exceptions",
            "question": "Which of the following exception types is an unchecked exception (does not require throws/catch)?",
            "codeSnippet": None,
            "options": ["IOException", "SQLException", "NullPointerException (subclass of RuntimeException)", "ClassNotFoundException"],
            "correctIndex": 2,
            "explanation": (
                "In Java, subclasses of RuntimeException (and Error) are unchecked exceptions. "
                "The compiler does not require them to be declared in throws clauses or caught explicitly."
            ),
        },
        {
            "id": 4,
            "difficulty": "Deep Mechanics",
            "concept": "try-with-resources & AutoCloseable",
            "question": "What interface must an object implement to be eligible for use in a Java try-with-resources statement?",
            "codeSnippet": "try (BufferedReader br = new BufferedReader(new FileReader(file))) { ... }",
            "options": ["java.lang.AutoCloseable", "java.io.Serializable", "java.lang.Cloneable", "java.lang.Disposable"],
            "correctIndex": 0,
            "explanation": (
                "The try-with-resources statement automatically calls close() on any resource that implements "
                "java.lang.AutoCloseable (or java.io.Closeable)."
            ),
        },
        {
            "id": 5,
            "difficulty": "Intermediate",
            "concept": "equals() and hashCode() Contract",
            "question": "If two Java objects are equal according to .equals(Object), what MUST be true according to the Java contract?",
            "codeSnippet": None,
            "options": [
                "They must have identical hashCode() values",
                "They must point to the identical memory address (==)",
                "Their toString() output must be identical",
                "Their classloaders must be different"
            ],
            "correctIndex": 0,
            "explanation": (
                "The general contract for hashCode specifies that if two objects are equal according to equals(Object), "
                "calling hashCode() on each of the two objects must produce the same integer result. Violating this breaks HashMaps/HashSets."
            ),
        },
        {
            "id": 6,
            "difficulty": "Fundamental",
            "concept": "Pass-by-Value in Java",
            "question": "Does Java pass objects by reference or by value?",
            "codeSnippet": None,
            "options": [
                "Primitive types by value, objects by reference",
                "Java is strictly pass-by-value for all types; for objects, the reference (memory pointer) is passed by value",
                "Strictly pass-by-reference",
                "Depends on JVM implementation flags"
            ],
            "correctIndex": 1,
            "explanation": (
                "Java is strictly pass-by-value. When passing an object, the reference address is copied by value. "
                "Reassigning the parameter inside the method does not change the caller's variable."
            ),
        },
        {
            "id": 7,
            "difficulty": "Deep Mechanics",
            "concept": "Garbage Collection & GC Roots",
            "question": "Which of the following is considered a GC Root in the JVM?",
            "codeSnippet": None,
            "options": [
                "Local variables and parameters currently alive on a thread's stack frame",
                "Any object in the Eden space",
                "Any object older than 15 GC cycles",
                "All unreferenced static variables"
            ],
            "correctIndex": 0,
            "explanation": (
                "GC Roots include active stack frame local variables and parameters, active thread objects, "
                "static variables loaded by system classloaders, and JNI references."
            ),
        },
        {
            "id": 8,
            "difficulty": "Intermediate",
            "concept": "Polymorphism & Method Overriding",
            "question": "Can private, static, or final methods be overridden in a Java subclass?",
            "codeSnippet": None,
            "options": [
                "Yes, using the @Override annotation",
                "No, none of them can be overridden dynamically at runtime",
                "Static methods can be overridden, but not private",
                "Final methods can be overridden if marked protected"
            ],
            "correctIndex": 1,
            "explanation": (
                "Private methods are not visible to subclasses; static methods belong to the class and are hidden (shadowed), "
                "not overridden with dynamic dispatch; final methods explicitly prohibit overriding."
            ),
        },
        {
            "id": 9,
            "difficulty": "Deep Mechanics",
            "concept": "Generics Type Erasure",
            "question": "Why does 'if (list instanceof List<String>)' fail to compile in Java?",
            "codeSnippet": None,
            "options": [
                "Java implements generics via Type Erasure, discarding generic type parameters at runtime",
                "instanceof only works on primitive types",
                "List is an interface, and instanceof only works on concrete classes",
                "The JVM does not support collections"
            ],
            "correctIndex": 0,
            "explanation": (
                "Due to Type Erasure, generic type information like <String> is stripped away at compile time for backward compatibility. "
                "At runtime, only raw 'List' exists, making 'instanceof List<String>' unverifiable by the JVM."
            ),
        },
        {
            "id": 10,
            "difficulty": "Fundamental",
            "concept": "Abstract Class vs Interface",
            "question": "In modern Java (Java 8+), which feature can an abstract class have that an interface CANNOT?",
            "codeSnippet": None,
            "options": [
                "Instance state (non-static, non-final fields) and constructors",
                "Default method implementations",
                "Static helper methods",
                "Multiple inheritance"
            ],
            "correctIndex": 0,
            "explanation": (
                "Interfaces can have default and static methods in Java 8+, and private methods in Java 9+, "
                "but cannot maintain non-static instance fields or constructors. Abstract classes can hold full state."
            ),
        },
    ],
}


def get_questions_for_language(language: str, count: int = 10) -> list[dict[str, Any]]:
    """
    Retrieve questions for the specified language.
    Normalizes aliases (e.g. 'c programming' -> 'c', 'cpp' -> 'c++', 'js' -> 'javascript', 'ts' -> 'typescript').
    Falls back gracefully if language isn't directly keyed.
    """
    lang_clean = language.strip().lower()
    if lang_clean in ("c", "c programming", "c-lang", "ansi-c", "c99", "c11"):
        key = "c"
    elif lang_clean in ("c++", "cpp", "cplusplus", "c/c++"):
        key = "cpp"
    elif lang_clean in ("python", "py", "python3"):
        key = "python"
    elif lang_clean in ("javascript", "js", "node", "nodejs", "react"):
        key = "javascript"
    elif lang_clean in ("typescript", "ts"):
        key = "typescript"
    elif lang_clean in ("java", "jvm"):
        key = "java"
    else:
        # Fallback to C or Python depending on language family, or provide polyglot diagnostic
        key = "c" if "c" in lang_clean else "python"

    questions = QUESTION_BANK.get(key, QUESTION_BANK["c"])
    return questions[:count]
