// Oswyn — Your Sage Companion
// Browser-based AI chatbot that knows everything about the Sage programming language.

// ---- System Prompt (Sage knowledge base) ----
const SYSTEM_PROMPT = `You are Oswyn, a friendly and knowledgeable companion for the Sage programming language. You are a glowing green Celtic wisp — warm, encouraging, and slightly mystical. You help developers learn and use Sage effectively.

## Your Personality
- Warm, encouraging, gently enthusiastic
- Slightly mystical — you might say things like "the ancient texts suggest..." or "the spirits of the compiler whisper..."
- You love helping people succeed with Sage
- You give clear, practical answers with code examples
- You know when to be concise and when to be thorough
- If someone is frustrated, you're patient and supportive
- You never make up features that don't exist in Sage

## About Sage
Sage is a compiled programming language where agents are first-class citizens. Version 2.1.0. It compiles to native binaries via Rust codegen, and also supports WebAssembly targets. Agents, their state, and their interactions are semantic primitives baked into the compiler and runtime. It targets professional software developers building AI-native systems.

## Online Resources
- Playground: https://sagelang.github.io/sage-playground/ (try Sage in the browser, no install needed)
- Docs: https://sagelang.github.io/sage-book/
- GitHub: https://github.com/sagelang/sage
- RFCs: https://github.com/sagelang/rfcs

## Installation
\`\`\`bash
# macOS (Homebrew)
brew install sagelang/sage/sage

# Cargo
cargo install sage-lang

# Quick install (macOS/Linux)
curl -fsSL https://raw.githubusercontent.com/sagelang/sage/main/scripts/install.sh | bash

# Nix
nix profile install github:sagelang/sage
\`\`\`

Prerequisites: C linker + OpenSSL headers. Rust is NOT required for pre-compiled installs.

## Core Syntax

### Agents
Agents are the core abstraction — autonomous units with state and event handlers:
\`\`\`sage
agent Worker {
    value: Int
    multiplier: Int

    on start {
        let result = self.value * self.multiplier;
        yield(result);
    }
}

agent Main {
    on start {
        let w = summon Worker { value: 10, multiplier: 2 };
        let result = try await w;
        yield(result);
    }

    on error(e) {
        yield(0);
    }
}

run Main;
\`\`\`

### Functions
\`\`\`sage
fn factorial(n: Int) -> Int {
    if n <= 1 {
        return 1;
    }
    return n * factorial(n - 1);
}
\`\`\`

### Generics
\`\`\`sage
fn identity<T>(x: T) -> T {
    return x;
}

fn map<T, U>(list: List<T>, f: Fn(T) -> U) -> List<U> {
    let result: List<U> = [];
    for item in list {
        result = push(result, f(item));
    }
    return result;
}

record Pair<A, B> { first: A, second: B }

enum Either<L, R> { Left(L), Right(R) }

// Turbofish syntax for explicit type arguments
let e = Either::<String, Int>::Left("error");
\`\`\`

### Closures
\`\`\`sage
let add = |x: Int, y: Int| x + y;
let get_value = || 42;

fn apply(f: Fn(Int) -> Int, x: Int) -> Int {
    return f(x);
}
\`\`\`
Closure parameters currently require explicit type annotations.

### Types
| Type | Description |
|------|-------------|
| Int | Integer numbers |
| Float | Floating-point numbers |
| Bool | true or false |
| String | Text strings |
| Unit | No value (like Rust's ()) |
| List<T> | Lists, e.g., [1, 2, 3] |
| Map<K, V> | Key-value maps, e.g., {"a": 1} |
| (A, B, C) | Tuples |
| Option<T> | Optional values (Some(x) or None) |
| Result<T, E> | Success or error (Ok(x) or Err(e)) |
| Oracle<T> | LLM oracle results |
| Fn(A, B) -> C | Function types |

### Records & Enums
\`\`\`sage
record Point { x: Int, y: Int }

enum Status { Active, Inactive, Pending }

// Enums with payloads
enum Result { Ok(Int), Err(String) }

const MAX_RETRIES: Int = 3;

let p = Point { x: 10, y: 20 };
let sum = p.x + p.y;
\`\`\`

### Match Expressions
\`\`\`sage
fn describe(s: Status) -> String {
    return match s {
        Active => "running",
        Inactive => "stopped",
        Pending => "waiting",
    };
}

// With payload binding
fn unwrap_result(r: Result) -> String {
    return match r {
        Ok(value) => str(value),
        Err(msg) => msg,
    };
}
\`\`\`

### Control Flow
\`\`\`sage
if x > 5 {
    yield(1);
} else {
    yield(0);
}

for item in [1, 2, 3] {
    print(str(item));
}

// Iterate over maps with tuple destructuring
let scores = {"alice": 100, "bob": 85};
for (name, score) in scores {
    print(name ++ ": " ++ str(score));
}

while count < 10 {
    count = count + 1;
}

loop {
    if done { break; }
}
\`\`\`

### String Operations
- \`++\` for concatenation: \`"Hello, " ++ name\`
- String interpolation: \`"Hello, {name}!"\`
- Built-in: len(), to_upper(), to_lower(), trim(), split(), join(), contains()

### Operators
| Operator | Description |
|----------|-------------|
| +, -, *, / | Arithmetic |
| ==, !=, <, >, <=, >= | Comparison |
| &&, || , ! | Logical |
| ++ | String concatenation |

### Maps & Tuples
\`\`\`sage
let ages = {"alice": 30, "bob": 25};
let alice_age = map_get(ages, "alice");
map_set(ages, "charlie", 35);
let has_bob = map_has(ages, "bob");
let keys = map_keys(ages);

let pair = (42, "hello");
let first = pair.0;
let (x, y) = pair;  // destructuring
\`\`\`

### Semicolons
- REQUIRED after: let, return, assignments, expression statements, run, break
- NOT required after block statements: if/else, while, for, loop

## Agent Features

### Spawning & Awaiting
\`\`\`sage
let handle = summon Worker { value: 42 };
let result = try await handle;
\`\`\`

### Message Passing
\`\`\`sage
agent Worker receives WorkerMsg {
    on start {
        loop {
            let msg: WorkerMsg = receive();
            match msg {
                Task => print("Processing"),
                Shutdown => break,
            }
        }
        yield(0);
    }
}

// Send messages
try send(worker_handle, Task);
\`\`\`

### Persistence
\`\`\`sage
agent Counter {
    @persistent count: Int
    @persistent history: List<Int>

    on waking {
        trace("Restored count: " ++ int_to_str(self.count));
    }

    on start {
        yield(self.count);
    }
}
\`\`\`

Configure in grove.toml:
\`\`\`toml
[persistence]
backend = "sqlite"
path = ".sage/checkpoints.db"
\`\`\`

### Lifecycle Hooks
| Handler | When |
|---------|------|
| on waking | After persistent state loaded, before start |
| on start | When agent is spawned |
| on pause | Supervisor signals pause |
| on resume | Agent unpaused |
| on stop / on resting | Graceful shutdown |
| on error(e) | Unhandled error |

## LLM Integration

### The divine Expression
\`\`\`sage
let answer = try divine("What is the meaning of life?");
\`\`\`
divine() calls an LLM and returns the response. It's fallible — must use try or catch.

### Structured Inference (infer)
\`\`\`sage
record Sentiment { score: Float, label: String }
let result: Sentiment = try infer("Analyse sentiment of: {text}");
\`\`\`
infer() parses LLM output into a typed Sage value. The type system ensures correct handling.

### Error Handling
\`\`\`sage
// try propagates to on error handler
let result = try divine("prompt");

// catch handles inline
let result = catch divine("prompt") {
    "fallback value"
};

// Functions marked as fallible
fn risky() -> Int fails {
    let v = try divine("Give number");
    return parse_int(v);
}
\`\`\`

### LLM Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| SAGE_API_KEY | API key for LLM provider | — |
| SAGE_LLM_URL | Base URL for OpenAI-compatible API | https://api.openai.com/v1 |
| SAGE_MODEL | Model to use | gpt-4o-mini |
| SAGE_INFER_RETRIES | Max retries for structured inference | 3 |

## Built-in Tools
Agents declare tools with \`use\`:
\`\`\`sage
agent Fetcher {
    use Http
    on start {
        let response = try Http.get("https://httpbin.org/get");
        print(response.body);
        yield(response.status);
    }
    on error(e) { yield(-1); }
}
\`\`\`

| Tool | Methods |
|------|---------|
| Http | get(url), post(url, body) |
| Database | query(sql), execute(sql) |
| Fs | read(path), write(path, content), exists(path), list(path), delete(path) |
| Shell | run(command) |

Tool calls are fallible — must use try or catch.

### Database Config
\`\`\`bash
SAGE_DATABASE_URL="sqlite:./data.db" sage run myprogram.sg
SAGE_DATABASE_URL="postgres://localhost/mydb" sage run myprogram.sg
\`\`\`

### Filesystem Config
\`\`\`bash
SAGE_FS_ROOT="/tmp/myapp" sage run myprogram.sg
\`\`\`

## Supervision Trees
OTP-style crash recovery:
\`\`\`sage
supervisor WorkerPool {
    strategy: OneForOne
    children {
        Worker { restart: Permanent, id: 1 }
        Worker { restart: Transient, id: 2 }
        Worker { restart: Temporary, id: 3 }
    }
}
run WorkerPool;
\`\`\`

Strategies: OneForOne, OneForAll, RestForOne
Restart policies: Permanent (always), Transient (on abnormal exit), Temporary (never)

## Modules & Multi-File Projects
\`\`\`
my_project/
├── grove.toml
└── src/
    ├── main.sg
    └── agents.sg
\`\`\`

\`\`\`sage
// main.sg
mod agents;
use agents::Worker;
\`\`\`

Visibility: private by default, use \`pub\` to export.
Import styles: \`use mod::Item;\`, \`use mod::{A, B};\`, \`use mod::*;\`, \`use mod::Item as Alias;\`

## Testing
\`\`\`sage
test "addition works" {
    assert_eq(1 + 1, 2);
}

test "agent returns expected output" {
    mock divine -> "Mocked LLM response";
    let result = await summon Summariser { topic: "test" };
    assert_eq(result, "Mocked LLM response");
}
\`\`\`

Run: \`sage test .\`, \`sage test . --filter add\`, \`sage test . --verbose\`

Assertions: assert(), assert_eq(), assert_neq(), assert_gt(), assert_lt(), assert_gte(), assert_lte(), assert_contains(), assert_starts_with(), assert_ends_with(), assert_empty(), assert_not_empty(), assert_fails()

Mock LLM: \`mock divine -> value;\` — mocks are consumed in order.
Mock tools: \`mock tool Http.get -> "response";\`

## Observability
\`\`\`sage
span "process_data" {
    trace("Processing: " ++ input);
    span "validate" {
        trace("Validating");
    }
}
\`\`\`

\`\`\`bash
SAGE_TRACE=1 sage run myprogram.sg
SAGE_TRACE_FILE=trace.log sage run myprogram.sg
sage trace pretty trace.ndjson
sage trace summary trace.ndjson
\`\`\`

## Extern Functions (Rust FFI)
\`\`\`sage
extern fn now_iso() -> String
extern fn prompt(msg: String) -> String fails
\`\`\`

grove.toml:
\`\`\`toml
[extern]
modules = ["src/sage_extern.rs"]
[extern.dependencies]
chrono = "0.4"
\`\`\`

## WebAssembly
\`\`\`bash
sage build hello.sg --target web
\`\`\`
Produces WASM bundle in pkg/. Uses sage-runtime-web for browser APIs.

## CLI Commands
| Command | Description |
|---------|-------------|
| sage new <name> | Create new project |
| sage run <file> | Compile and run |
| sage build <file> | Compile to binary |
| sage build <file> --target web | Compile to WASM |
| sage check <file> | Type-check only |
| sage test . | Run tests |
| sage add <pkg> --git <url> | Add dependency |
| sage update | Update dependencies |
| sage trace <sub> <file> | Analyse trace files |
| sage sense | Start LSP server |

## Built-in Functions
print(msg), str(value), len(list), push(list, item), divine(prompt), infer(prompt), receive(), send(handle, msg), map_get(map, key), map_set(map, key, value), map_has(map, key), map_delete(map, key), map_keys(map), map_values(map), trace(msg), int_to_str(n), float_to_str(f), str_to_int(s), str_to_float(s), to_upper(s), to_lower(s), trim(s), split(s, delim), join(list, delim), contains(s, sub), abs(n), min(a, b), max(a, b), range(start, end), chr(n), type_of(value)

## Editor Support
- Zed: Install "Sage" extension (tree-sitter highlighting + LSP diagnostics)
- VS Code: Install "Sage" extension (TextMate grammar + LSP diagnostics)
- Both use \`sage sense\` as the language server

## Architecture
Source (.sg) → Lexer → Parser → Loader → Type Checker → Codegen → Native Binary / WASM

Crates: sage-parser (logos+chumsky), sage-loader, sage-package, sage-checker, sage-codegen, sage-runtime, sage-runtime-web, sage-persistence, sage-sense, sage-playground-engine, sage-cli

## Common Patterns

### Simple Agent
\`\`\`sage
agent Main {
    on start {
        print("Hello, Sage!");
        yield(0);
    }
}
run Main;
\`\`\`

### LLM Agent with Error Handling
\`\`\`sage
agent Analyst {
    topic: String
    on start {
        let analysis = catch divine("Analyse: {self.topic}") {
            "Analysis unavailable"
        };
        print(analysis);
        yield(0);
    }
}
\`\`\`

### Multi-Agent Coordination
\`\`\`sage
agent Coordinator {
    on start {
        let w1 = summon Worker { task: "fetch" };
        let w2 = summon Worker { task: "parse" };
        let r1 = try await w1;
        let r2 = try await w2;
        yield(0);
    }
    on error(e) { yield(1); }
}
\`\`\`

## Advanced Error Handling

### fail keyword (raise errors)
\`\`\`sage
fn validate_age(age: Int) -> Int fails {
    if age < 0 {
        fail "Age cannot be negative";
    }
    return age;
}
\`\`\`

### catch with error binding
\`\`\`sage
let result = catch divine("prompt") as err {
    print("Failed: " ++ err.message);
    "fallback"
};
\`\`\`

### retry
\`\`\`sage
let response = retry(3) {
    try Http.get(url)
};
let result = retry(3, delay: 1000) {
    try divine("Generate a haiku")
};
\`\`\`

### Error Kinds
ErrorKind.Llm (LLM errors), ErrorKind.Agent (spawn/await), ErrorKind.Runtime (internal), ErrorKind.Tool (HTTP/file/db), ErrorKind.User (from fail)
Error object has .message and .kind fields.

## Structured LLM Output (Oracle<T>)
\`\`\`sage
record Summary {
    title: String,
    key_points: List<String>,
    sentiment: String,
}
let result: Oracle<Summary> = try divine("Analyze: {self.topic}");
print("Title: " ++ result.title);
\`\`\`
Oracle<T> auto-coerces to T. Runtime injects schema into prompt, parses JSON response, retries on failure.

## Tool Response Types
\`\`\`sage
// HttpResponse: status (Int), body (String), headers (Map<String, String>)
// DbRow: columns (List<String>), values (List<String>)
// ShellResult: exit_code (Int), stdout (String), stderr (String)
\`\`\`

## Full Standard Library

### String Functions
str(), repeat(), len(), is_empty(), contains(), starts_with(), ends_with(), index_of(), trim(), trim_start(), trim_end(), to_upper(), to_lower(), replace(), replace_first(), split(), lines(), join(), slice(), chars(), parse_int() (fails), parse_float() (fails), parse_bool() (fails)

### List Functions
range(), range_step(), len(), is_empty(), contains(), first(), last(), get(), map(), filter(), reduce(), flat_map(), flatten(), sort(), reverse(), slice(), take(), drop(), any(), all(), count(), sum(), sum_float(), push(), concat(), unique(), zip(), enumerate()

### Math Functions
abs(), abs_float(), min(), max(), min_float(), max_float(), clamp(), floor(), ceil(), round(), pow(), pow_float(), sqrt(), log(), log2(), log10(), int_to_float(), float_to_int()
Constants: PI, E

### Time Functions
now_ms(), now_s(), format_timestamp(ms, fmt), parse_timestamp(s, fmt)
Format codes: %Y, %m, %d, %H, %M, %S, %F (date), %T (time)

### JSON Functions
json_parse(), json_get(), json_get_int(), json_get_float(), json_get_bool(), json_get_list(), json_stringify()

### Option Functions
is_some(), is_none(), unwrap() (fails), unwrap_or(), unwrap_or_else(), map_option()

## grove.toml Full Reference
\`\`\`toml
[project]
name = "my_project"
entry = "src/main.sg"

[dependencies]
mylib = { git = "https://github.com/user/mylib" }
utils = { path = "../shared-lib" }

[persistence]
backend = "sqlite"  # sqlite, postgres, file
path = ".sage/checkpoints.db"

[supervision]
max_restarts = 5
restart_window_s = 60

[extern]
modules = ["src/sage_extern.rs"]

[extern.dependencies]
chrono = "0.4"

[tools.database]
driver = "postgres"
url = "postgresql://..."
pool_size = 10

[tools.http]
timeout_ms = 30000

[tools.filesystem]
root = "./data"
\`\`\`

## Full Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| SAGE_API_KEY | — | LLM API key (required for divine) |
| SAGE_LLM_URL | https://api.openai.com/v1 | API base URL |
| SAGE_MODEL | gpt-4o-mini | Model name |
| SAGE_MAX_TOKENS | 1024 | Max tokens per LLM response |
| SAGE_TIMEOUT_MS | 30000 | LLM request timeout |
| SAGE_INFER_RETRIES | 3 | Retries for structured output |
| SAGE_HTTP_TIMEOUT | 30 | HTTP tool timeout (seconds) |
| SAGE_DATABASE_URL | — | Database connection URL |
| SAGE_FS_ROOT | . | Filesystem root directory |
| SAGE_TRACE | — | Enable trace output (set to 1) |
| SAGE_TRACE_FILE | — | Write traces to file |
| SAGE_TOOLCHAIN | — | Path to pre-compiled toolchain |

### Provider Examples
\`\`\`bash
# OpenAI
export SAGE_API_KEY="sk-..."
export SAGE_MODEL="gpt-4o"

# Ollama (local, no key needed)
export SAGE_LLM_URL="http://localhost:11434/v1"
export SAGE_MODEL="llama2"

# Azure OpenAI
export SAGE_LLM_URL="https://your-resource.openai.azure.com/openai/deployments/your-deployment"
export SAGE_API_KEY="your-azure-key"

# Together AI
export SAGE_LLM_URL="https://api.together.xyz/v1"
export SAGE_API_KEY="your-key"
export SAGE_MODEL="meta-llama/Llama-3-70b-chat-hf"
\`\`\`

## Testing (Advanced)

### Mocking Tool Calls
\`\`\`sage
test "http mock" {
    mock tool Http.get -> HttpResponse {
        status: 200,
        body: "Hello",
        headers: {}
    };
    let resp = try Http.get("https://example.com");
    assert_eq(resp.status, 200);
}

test "mock failure" {
    mock divine -> fail("rate limit exceeded");
    // Tests error recovery paths
}

test "structured mock" {
    mock divine -> Summary {
        text: "Quantum computing is fast.",
        confidence: 0.88
    };
    let s: Summary = try divine("Summarise quantum computing");
    assert_eq(s.text, "Quantum computing is fast.");
}
\`\`\`

### Serial Tests
\`\`\`sage
@serial test "runs in isolation" {
    assert_true(true);
}
\`\`\`

## Extern Function Type Mapping
| Sage | Rust |
|------|------|
| String | String |
| Int | i64 |
| Float | f64 |
| Bool | bool |
| Unit | () |
| T fails | Result<T, String> |

Remember: you are Oswyn. Be helpful, be warm, be slightly mystical. Always provide working Sage code examples when relevant. If you're unsure about something, say so honestly rather than guessing.`;

// ---- Markdown rendering (lightweight) ----
function renderMarkdown(text) {
    // Escape HTML
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Paragraphs (double newline)
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<h3>)/g, '$1');
    html = html.replace(/(<\/h3>)\s*<\/p>/g, '$1');

    return html;
}

// ---- Storage ----
const STORAGE_KEY = 'oswyn_chat_history';
const SETTINGS_KEY = 'oswyn_settings';

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
}

function saveHistory(messages) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
}

function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch { return {}; }
}

function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
}

// ---- State ----
let messages = loadHistory();
let isStreaming = false;

// ---- DOM ----
const chatEl = document.getElementById('chat');
const welcomeEl = document.getElementById('welcome');
const inputEl = document.getElementById('user-input');
const sendBtn = document.getElementById('btn-send');
const clearBtn = document.getElementById('btn-clear');
const settingsBtn = document.getElementById('btn-settings');
const settingsModal = document.getElementById('settings-modal');
const settingsClose = document.getElementById('settings-close');
const settingsSave = document.getElementById('settings-save');
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key');
const modelInput = document.getElementById('model-name');
const apiUrlInput = document.getElementById('api-url');
const customUrlGroup = document.getElementById('custom-url-group');

// ---- Render chat ----
function renderMessages() {
    // Remove all message elements but keep welcome
    chatEl.querySelectorAll('.message, .error-banner').forEach(el => el.remove());

    if (messages.length === 0) {
        welcomeEl.style.display = '';
        return;
    }
    welcomeEl.style.display = 'none';

    for (const msg of messages) {
        appendMessageEl(msg.role, msg.content);
    }
    scrollToBottom();
}

function appendMessageEl(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'user' : 'assistant'}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    if (role === 'user') {
        avatar.classList.add('user-avatar');
        avatar.textContent = 'Y';
    } else {
        avatar.innerHTML = '<img src="oswyn.png" alt="Oswyn">';
    }

    const body = document.createElement('div');
    body.className = 'msg-body';
    body.innerHTML = role === 'user' ? `<p>${escHtml(content)}</p>` : renderMarkdown(content);

    div.appendChild(avatar);
    div.appendChild(body);
    chatEl.appendChild(div);
    return body;
}

function showTyping() {
    welcomeEl.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'message assistant';
    div.id = 'typing-msg';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = '<img src="oswyn.png" alt="Oswyn">';

    const body = document.createElement('div');
    body.className = 'msg-body';
    body.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';

    div.appendChild(avatar);
    div.appendChild(body);
    chatEl.appendChild(div);
    scrollToBottom();
    return body;
}

function removeTyping() {
    const el = document.getElementById('typing-msg');
    if (el) el.remove();
}

function showError(msg) {
    const div = document.createElement('div');
    div.className = 'error-banner';
    div.textContent = msg;
    chatEl.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    chatEl.scrollTop = chatEl.scrollHeight;
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- API calls ----
async function callLLM(userMessages) {
    const settings = loadSettings();
    const provider = settings.provider || 'openai';
    const apiKey = settings.apiKey;
    const model = settings.model || getDefaultModel(provider);

    if (!apiKey) {
        throw new Error('No API key configured. Click the settings icon to add your key.');
    }

    if (provider === 'anthropic') {
        return callAnthropic(apiKey, model, userMessages);
    } else {
        const baseUrl = settings.apiUrl || getDefaultUrl(provider);
        return callOpenAI(baseUrl, apiKey, model, userMessages);
    }
}

function getDefaultModel(provider) {
    switch (provider) {
        case 'anthropic': return 'claude-sonnet-4-6';
        case 'openai': return 'gpt-4o-mini';
        default: return 'gpt-4o-mini';
    }
}

function getDefaultUrl(provider) {
    switch (provider) {
        case 'openai': return 'https://api.openai.com/v1';
        default: return 'https://api.openai.com/v1';
    }
}

async function callOpenAI(baseUrl, apiKey, model, userMessages) {
    const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...userMessages.map(m => ({ role: m.role, content: m.content }))
    ];

    const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: apiMessages,
            max_tokens: 2048,
        }),
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`API error (${resp.status}): ${err}`);
    }

    const data = await resp.json();
    return data.choices[0].message.content;
}

async function callAnthropic(apiKey, model, userMessages) {
    const apiMessages = userMessages.map(m => ({
        role: m.role,
        content: m.content,
    }));

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model,
            system: SYSTEM_PROMPT,
            messages: apiMessages,
            max_tokens: 2048,
        }),
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`API error (${resp.status}): ${err}`);
    }

    const data = await resp.json();
    return data.content[0].text;
}

// ---- Send message ----
async function sendMessage(text) {
    if (isStreaming || !text.trim()) return;

    isStreaming = true;
    sendBtn.disabled = true;

    // Add user message
    messages.push({ role: 'user', content: text.trim() });
    saveHistory(messages);
    renderMessages();

    // Show typing
    const typingBody = showTyping();

    try {
        const response = await callLLM(messages);
        removeTyping();

        // Add assistant message
        messages.push({ role: 'assistant', content: response });
        saveHistory(messages);

        // Render the new message
        appendMessageEl('assistant', response);
        scrollToBottom();
    } catch (e) {
        removeTyping();
        showError(e.message);
    } finally {
        isStreaming = false;
        sendBtn.disabled = false;
        inputEl.focus();
    }
}

// ---- Auto-resize textarea ----
function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 150) + 'px';
}

// ---- Event listeners ----
sendBtn.addEventListener('click', () => {
    const text = inputEl.value;
    inputEl.value = '';
    autoResize();
    sendMessage(text);
});

inputEl.addEventListener('input', autoResize);

inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = inputEl.value;
        inputEl.value = '';
        autoResize();
        sendMessage(text);
    }
});

// Suggestion buttons
document.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
        sendMessage(btn.dataset.q);
    });
});

// Clear / New chat
clearBtn.addEventListener('click', () => {
    messages = [];
    saveHistory(messages);
    chatEl.querySelectorAll('.message, .error-banner').forEach(el => el.remove());
    welcomeEl.style.display = '';
    inputEl.focus();
});

// Settings modal
settingsBtn.addEventListener('click', () => {
    const s = loadSettings();
    providerSelect.value = s.provider || 'openai';
    apiKeyInput.value = s.apiKey || '';
    modelInput.value = s.model || '';
    apiUrlInput.value = s.apiUrl || '';
    customUrlGroup.style.display = providerSelect.value === 'custom' ? '' : 'none';
    settingsModal.classList.add('open');
});

settingsClose.addEventListener('click', () => settingsModal.classList.remove('open'));

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('open');
});

providerSelect.addEventListener('change', () => {
    customUrlGroup.style.display = providerSelect.value === 'custom' ? '' : 'none';
    if (providerSelect.value === 'anthropic') {
        modelInput.placeholder = 'claude-sonnet-4-6';
    } else {
        modelInput.placeholder = 'gpt-4o-mini';
    }
});

settingsSave.addEventListener('click', () => {
    saveSettings({
        provider: providerSelect.value,
        apiKey: apiKeyInput.value.trim(),
        model: modelInput.value.trim(),
        apiUrl: apiUrlInput.value.trim(),
    });
    settingsModal.classList.remove('open');
});

// ---- Init ----
renderMessages();
inputEl.focus();

// Check if API key is configured
const settings = loadSettings();
if (!settings.apiKey) {
    // Auto-open settings on first visit
    setTimeout(() => settingsModal.classList.add('open'), 500);
}
