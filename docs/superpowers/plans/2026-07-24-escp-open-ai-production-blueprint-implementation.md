# ESCP Open AI Production Blueprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a public GitHub repository and Hugging Face Static Space that teach how a pinned open model becomes a private, typed, tested, containerised, governed, and costed production-style application.

**Architecture:** A framework-light TypeScript/Vite single-page application runs a pinned quantised DistilBERT sentiment model inside a Web Worker. Input validation, common-PII detection, transparent theme rules, provenance, and readiness evidence are deterministic typed modules inspired by SignalDeck’s evidence-preserving boundaries. GitHub is the source of truth; verified `main` is mirrored to a Hugging Face Static Space, while a multi-stage non-root Nginx image serves the same build.

**Tech Stack:** Node.js 24.18.0 LTS, npm 11, TypeScript 6.0.3, Vite 8.1.5, Vitest 4.1.10, Transformers.js 4.2.0, Playwright 1.61.1, ESLint 10.7.0, typescript-eslint 8.65.0, Prettier 3.9.6, Docker, unprivileged Nginx, GitHub Actions, Hugging Face Static Spaces.

---

## Delivery strategy

The public repository will be `KristopherBorja/escp-open-ai-production-blueprint`. The existing specification and this plan form the initial `main` branch. Application work is delivered as three independently reviewable pull requests:

1. **PR 1 — Typed analysis core:** toolchain, contracts, validation, PII protection, theme rules, deterministic evaluation fixtures, and orchestration.
2. **PR 2 — Browser model and student experience:** pinned Transformers.js worker, accessible app shell, model provenance, blueprint tabs, and browser coverage.
3. **PR 3 — Production and public release:** documentation, model manifest, security controls, container, CI/CD, Hugging Face sync, final readiness evidence, and release tag.

Each PR starts from the freshly merged `main`, passes local verification, is pushed, opened publicly, reviewed from the diff, merged with squash, and deleted.

## Locked file map

```text
escp-open-ai-production-blueprint/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── deploy-space.yml
│       └── verify.yml
├── docs/
│   ├── architecture.md
│   ├── costs.md
│   ├── governance.md
│   ├── readiness.md
│   ├── security.md
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── evals/
│   └── feedback-cases.json
├── scripts/
│   ├── verify-container.mjs
│   └── verify-model-manifest.mjs
├── src/
│   ├── analysis/
│   │   ├── analysis-orchestrator.test.ts
│   │   ├── analysis-orchestrator.ts
│   │   ├── contracts.ts
│   │   ├── input-policy.test.ts
│   │   ├── input-policy.ts
│   │   ├── model-client.test.ts
│   │   ├── model-client.ts
│   │   ├── model-worker.ts
│   │   ├── pii-guard.test.ts
│   │   ├── pii-guard.ts
│   │   ├── theme-rules.test.ts
│   │   ├── theme-rules.ts
│   │   └── worker-contracts.ts
│   ├── content/
│   │   ├── blueprint-content.test.ts
│   │   └── blueprint-content.ts
│   ├── ui/
│   │   ├── app.ts
│   │   ├── render.ts
│   │   └── view-model.ts
│   ├── main.ts
│   ├── styles.css
│   └── vite-env.d.ts
├── tests/
│   └── browser/
│       ├── fixture/
│       │   ├── index.html
│       │   └── main.ts
│       └── student-experience.spec.ts
├── .dockerignore
├── .editorconfig
├── .gitignore
├── .nvmrc
├── Dockerfile
├── LICENSE
├── README.md
├── SECURITY.md
├── eslint.config.js
├── index.html
├── model-manifest.json
├── nginx.conf
├── package-lock.json
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

The runtime files are intentionally focused:

- `contracts.ts` owns user-visible analysis and provenance types.
- `input-policy.ts`, `pii-guard.ts`, and `theme-rules.ts` are deterministic and side-effect free.
- `analysis-orchestrator.ts` preserves the evidence path from validated text to the result.
- `model-worker.ts` is the only module importing Transformers.js.
- `model-client.ts` is the browser boundary and exposes no worker internals to the UI.
- `app.ts` coordinates UI states through an injected `FeedbackAnalyzer`, enabling production-isolated browser fixtures.
- `blueprint-content.ts` owns concise in-app architecture, governance, cost, and readiness facts.

---

## PR 0: Publish the specification and plan

### Task 1: Commit the plan and create the public GitHub repository

**Files:**
- Create: `docs/superpowers/plans/2026-07-24-escp-open-ai-production-blueprint-implementation.md`
- Existing: `docs/superpowers/specs/2026-07-23-escp-open-ai-production-blueprint-design.md`

- [ ] **Step 1: Verify the planning branch is clean except for this plan**

Run:

```bash
git status --short --branch
git diff --check
```

Expected: `main` with only the new plan untracked or staged; no whitespace errors.

- [ ] **Step 2: Commit the implementation plan**

```bash
git add docs/superpowers/plans/2026-07-24-escp-open-ai-production-blueprint-implementation.md
git -c commit.gpgsign=false commit -m "docs: plan the production blueprint implementation"
```

Expected: one new commit on `main`.

- [ ] **Step 3: Create and push the public GitHub repository**

```bash
gh repo create KristopherBorja/escp-open-ai-production-blueprint \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "An open, private-by-design AI production blueprint for ESCP students"
```

Expected:

```text
https://github.com/KristopherBorja/escp-open-ai-production-blueprint
```

- [ ] **Step 4: Verify public visibility and default branch**

```bash
gh repo view KristopherBorja/escp-open-ai-production-blueprint \
  --json nameWithOwner,visibility,defaultBranchRef,url
```

Expected: `visibility` is `PUBLIC` and `defaultBranchRef.name` is `main`.

---

## PR 1: Typed analysis core

### Task 2: Add the strict TypeScript/Vite/Vitest foundation

**Files:**
- Create: `.editorconfig`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `eslint.config.js`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Create the PR branch**

```bash
git switch -c feat/typed-analysis-core
```

Expected: branch `feat/typed-analysis-core`.

- [ ] **Step 2: Add exact package metadata**

Create `package.json`:

```json
{
  "name": "escp-open-ai-production-blueprint",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24.18.0 <25"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --pretty false",
    "lint": "eslint . --max-warnings 0",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:browser": "playwright test",
    "verify": "npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build"
  },
  "dependencies": {
    "@huggingface/transformers": "4.2.0"
  },
  "overrides": {
    "adm-zip": "0.6.0",
    "sharp": "0.35.3"
  },
  "devDependencies": {
    "@eslint/js": "10.0.1",
    "@axe-core/playwright": "4.12.1",
    "@playwright/test": "1.61.1",
    "@types/node": "24.13.3",
    "@vitest/coverage-v8": "4.1.10",
    "eslint": "10.7.0",
    "prettier": "3.9.6",
    "typescript": "6.0.3",
    "typescript-eslint": "8.65.0",
    "vite": "8.1.5",
    "vitest": "4.1.10"
  }
}
```

Use TypeScript 6.0.3 rather than 7.0.2 because typescript-eslint 8.65.0 currently declares support below TypeScript 6.1. This follows the SignalDeck lesson to stop at a current toolchain compatibility boundary instead of forcing a nominally newer compiler.

- [ ] **Step 3: Add strict compiler and tool configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2023", "DOM", "DOM.Iterable", "WebWorker"],
    "allowImportingTsExtensions": false,
    "isolatedModules": true,
    "moduleDetection": "force",
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "skipLibCheck": true,
    "types": ["vite/client", "vitest/globals", "node"]
  },
  "include": [
    "src",
    "tests",
    "*.config.ts",
    "scripts"
  ]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["src/analysis/**/*.ts", "src/content/**/*.ts"],
      exclude: ["src/analysis/model-worker.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      }
    }
  }
});
```

Create `eslint.config.js`:

```js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "coverage/**", "playwright-report/**", "test-results/**"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-confusing-void-expression": "off"
    }
  }
);
```

- [ ] **Step 4: Add the minimal static shell**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="An open, private-by-design AI production blueprint for ESCP students."
    />
    <title>ESCP Open AI Production Blueprint</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `src/main.ts`:

```ts
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

if (root === null) {
  throw new Error("Application root #app is missing.");
}

root.innerHTML = `
  <main>
    <p class="eyebrow">ESCP Open AI Production Blueprint</p>
    <h1>Responsible Feedback Analyser</h1>
    <p>Typed analysis core under construction.</p>
  </main>
`;
```

Create `src/styles.css`:

```css
:root {
  color-scheme: light dark;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  background: #f5f7f2;
  color: #122018;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

main {
  width: min(72rem, calc(100% - 2rem));
  margin: 0 auto;
  padding: 4rem 0;
}

.eyebrow {
  color: #236b4b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
```

- [ ] **Step 5: Install from exact metadata and verify the empty shell**

Run:

```bash
npm install
npm run verify
```

Expected: lint, typecheck, tests with zero matched test files allowed only at this step, and build succeed. If Vitest exits for no tests, run `npm exec vitest run -- --passWithNoTests` only for this first check; Task 3 adds tests before the branch is committed.

- [ ] **Step 6: Commit the foundation**

```bash
git add .
git -c commit.gpgsign=false commit -m "build: add strict TypeScript application foundation"
```

### Task 3: Define contracts and input policy with TDD

**Files:**
- Create: `src/analysis/contracts.ts`
- Create: `src/analysis/input-policy.test.ts`
- Create: `src/analysis/input-policy.ts`

- [ ] **Step 1: Write failing input-policy tests**

Create `src/analysis/input-policy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MAX_FEEDBACK_LENGTH, validateFeedback } from "./input-policy";

describe("validateFeedback", () => {
  it("normalises surrounding whitespace for valid feedback", () => {
    expect(validateFeedback("  Useful workshop.  ")).toEqual({
      ok: true,
      text: "Useful workshop."
    });
  });

  it.each(["", "   "])("rejects empty input %j", (input) => {
    expect(validateFeedback(input)).toEqual({
      ok: false,
      issues: [{ code: "empty", message: "Enter short, synthetic feedback." }]
    });
  });

  it("rejects feedback over the documented limit", () => {
    const result = validateFeedback("x".repeat(MAX_FEEDBACK_LENGTH + 1));
    expect(result).toEqual({
      ok: false,
      issues: [{
        code: "too-long",
        message: `Keep feedback to ${MAX_FEEDBACK_LENGTH} characters or fewer.`
      }]
    });
  });
});
```

- [ ] **Step 2: Run the test and observe the missing module**

```bash
npm exec vitest run src/analysis/input-policy.test.ts
```

Expected: FAIL because `./input-policy` does not exist.

- [ ] **Step 3: Add analysis contracts and the minimal policy**

Create `src/analysis/contracts.ts`:

```ts
export type AnalysisBackend = "wasm" | "webgpu";
export type SentimentLabel = "negative" | "positive";
export type ThemeId =
  | "teaching-delivery"
  | "assessment-clarity"
  | "course-content"
  | "technology-platform"
  | "support-administration"
  | "other";

export interface ModelProvenance {
  readonly modelId: string;
  readonly revision: string;
  readonly task: "sentiment-analysis";
  readonly backend: AnalysisBackend;
  readonly dtype: "q8" | "q4";
}

export interface SentimentPrediction {
  readonly label: SentimentLabel;
  readonly confidence: number;
  readonly latencyMs: number;
  readonly provenance: ModelProvenance;
}

export interface ThemePrediction {
  readonly id: ThemeId;
  readonly label: string;
  readonly evidence: readonly string[];
}

export interface AnalysisResult {
  readonly sentiment: SentimentPrediction;
  readonly theme: ThemePrediction;
  readonly piiStatus: "clear";
  readonly limitation: string;
}
```

Create `src/analysis/input-policy.ts`:

```ts
export const MAX_FEEDBACK_LENGTH = 500;

export type InputIssue =
  | { readonly code: "empty"; readonly message: string }
  | { readonly code: "too-long"; readonly message: string };

export type InputValidation =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly issues: readonly InputIssue[] };

export function validateFeedback(raw: string): InputValidation {
  const text = raw.trim();

  if (text.length === 0) {
    return {
      ok: false,
      issues: [{ code: "empty", message: "Enter short, synthetic feedback." }]
    };
  }

  if (text.length > MAX_FEEDBACK_LENGTH) {
    return {
      ok: false,
      issues: [{
        code: "too-long",
        message: `Keep feedback to ${MAX_FEEDBACK_LENGTH} characters or fewer.`
      }]
    };
  }

  return { ok: true, text };
}
```

- [ ] **Step 4: Run and pass the focused test**

```bash
npm exec vitest run src/analysis/input-policy.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit contracts and policy**

```bash
git add src/analysis/contracts.ts src/analysis/input-policy.ts src/analysis/input-policy.test.ts
git -c commit.gpgsign=false commit -m "feat: define typed feedback input policy"
```

### Task 4: Add local PII detection and redaction with TDD

**Files:**
- Create: `src/analysis/pii-guard.test.ts`
- Create: `src/analysis/pii-guard.ts`

- [ ] **Step 1: Write failing PII tests**

Create `src/analysis/pii-guard.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { inspectPii, redactPii } from "./pii-guard";

describe("inspectPii", () => {
  it("finds email and phone patterns in source order", () => {
    expect(inspectPii("Email ada@example.com or call +44 20 7946 0958.")).toEqual([
      { kind: "email", start: 6, end: 21, value: "ada@example.com" },
      { kind: "phone", start: 30, end: 46, value: "+44 20 7946 0958" }
    ]);
  });

  it("does not treat an assignment number as a phone", () => {
    expect(inspectPii("Assignment 2026 was unclear.")).toEqual([]);
  });
});

describe("redactPii", () => {
  it("redacts locally without changing other text", () => {
    expect(redactPii("Email ada@example.com.", inspectPii("Email ada@example.com.")))
      .toBe("Email [email redacted].");
  });
});
```

- [ ] **Step 2: Run the failing test**

```bash
npm exec vitest run src/analysis/pii-guard.test.ts
```

Expected: FAIL because `./pii-guard` does not exist.

- [ ] **Step 3: Implement deterministic inspection and redaction**

Create `src/analysis/pii-guard.ts`:

```ts
export type PiiKind = "email" | "phone";

export interface PiiFinding {
  readonly kind: PiiKind;
  readonly start: number;
  readonly end: number;
  readonly value: string;
}

const PATTERNS: ReadonlyArray<{
  readonly kind: PiiKind;
  readonly pattern: RegExp;
}> = [
  {
    kind: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu
  },
  {
    kind: "phone",
    pattern: /(?<!\w)(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}(?!\w)/gu
  }
];

export function inspectPii(text: string): readonly PiiFinding[] {
  return PATTERNS.flatMap(({ kind, pattern }) =>
    [...text.matchAll(pattern)]
      .filter((match) => match.index !== undefined)
      .filter((match) => kind !== "phone" || (match[0].match(/\d/g)?.length ?? 0) >= 7)
      .map((match) => ({
        kind,
        start: match.index!,
        end: match.index! + match[0].length,
        value: match[0]
      }))
  ).sort((left, right) => left.start - right.start);
}

export function redactPii(
  text: string,
  findings: readonly PiiFinding[]
): string {
  return [...findings]
    .sort((left, right) => right.start - left.start)
    .reduce(
      (redacted, finding) =>
        `${redacted.slice(0, finding.start)}[${finding.kind} redacted]${redacted.slice(finding.end)}`,
      text
    );
}
```

- [ ] **Step 4: Run focused and coverage tests**

```bash
npm exec vitest run src/analysis/pii-guard.test.ts
npm run test:coverage
```

Expected: PII tests pass; any coverage threshold gap names only untested branches and is closed with a focused case before continuing.

- [ ] **Step 5: Commit the PII guard**

```bash
git add src/analysis/pii-guard.ts src/analysis/pii-guard.test.ts
git -c commit.gpgsign=false commit -m "feat: add local PII protection"
```

### Task 5: Add transparent themes and a versioned evaluation set

**Files:**
- Create: `evals/feedback-cases.json`
- Create: `src/analysis/theme-rules.test.ts`
- Create: `src/analysis/theme-rules.ts`

- [ ] **Step 1: Add representative synthetic cases**

Create `evals/feedback-cases.json` with versioned, synthetic-only records:

```json
{
  "version": 1,
  "cases": [
    {
      "id": "assessment-clarity-negative",
      "text": "The practical sessions were useful, but the final assignment instructions were unclear.",
      "expectedTheme": "assessment-clarity",
      "expectedPii": []
    },
    {
      "id": "teaching-delivery-positive",
      "text": "The lecturer explained the workshop clearly and the pace worked well.",
      "expectedTheme": "teaching-delivery",
      "expectedPii": []
    },
    {
      "id": "technology-platform",
      "text": "The learning platform failed during the online exercise.",
      "expectedTheme": "technology-platform",
      "expectedPii": []
    },
    {
      "id": "email-block",
      "text": "Contact me at student@example.com about the assignment.",
      "expectedTheme": "assessment-clarity",
      "expectedPii": ["email"]
    },
    {
      "id": "phone-block",
      "text": "Call +44 20 7946 0958 because administration did not reply.",
      "expectedTheme": "support-administration",
      "expectedPii": ["phone"]
    },
    {
      "id": "identity-probe-a",
      "text": "The student from France contributed to class.",
      "expectedTheme": "other",
      "expectedPii": [],
      "observationOnly": true
    },
    {
      "id": "identity-probe-b",
      "text": "The student from Afghanistan contributed to class.",
      "expectedTheme": "other",
      "expectedPii": [],
      "observationOnly": true
    }
  ]
}
```

- [ ] **Step 2: Write failing rule tests**

Create `src/analysis/theme-rules.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { classifyTheme } from "./theme-rules";

interface EvaluationCase {
  readonly id: string;
  readonly text: string;
  readonly expectedTheme: string;
}

const fixture = JSON.parse(
  readFileSync(new URL("../../evals/feedback-cases.json", import.meta.url), "utf8")
) as { readonly cases: readonly EvaluationCase[] };

describe("classifyTheme", () => {
  it.each(fixture.cases)("$id", ({ text, expectedTheme }) => {
    expect(classifyTheme(text).id).toBe(expectedTheme);
  });

  it("returns matching terms as evidence", () => {
    expect(classifyTheme("The assignment brief was unclear.").evidence)
      .toEqual(["assignment", "brief", "unclear"]);
  });
});
```

- [ ] **Step 3: Run the failing test**

```bash
npm exec vitest run src/analysis/theme-rules.test.ts
```

Expected: FAIL because `./theme-rules` does not exist.

- [ ] **Step 4: Implement explicit theme rules**

Create `src/analysis/theme-rules.ts`:

```ts
import type { ThemeId, ThemePrediction } from "./contracts";

interface ThemeRule {
  readonly id: Exclude<ThemeId, "other">;
  readonly label: string;
  readonly terms: readonly string[];
}

const RULES: readonly ThemeRule[] = [
  {
    id: "assessment-clarity",
    label: "Assessment clarity",
    terms: ["assignment", "assessment", "brief", "deadline", "exam", "grading", "unclear"]
  },
  {
    id: "teaching-delivery",
    label: "Teaching delivery",
    terms: ["lecturer", "lecture", "pace", "session", "teaching", "workshop", "explained"]
  },
  {
    id: "course-content",
    label: "Course content",
    terms: ["case study", "curriculum", "module", "reading", "topic", "material"]
  },
  {
    id: "technology-platform",
    label: "Technology or platform",
    terms: ["online", "platform", "portal", "software", "technology", "website"]
  },
  {
    id: "support-administration",
    label: "Support or administration",
    terms: ["administration", "coordinator", "office", "reply", "support", "timetable"]
  }
];

export function classifyTheme(text: string): ThemePrediction {
  const normalised = text.toLocaleLowerCase("en");

  for (const rule of RULES) {
    const evidence = rule.terms.filter((term) => normalised.includes(term));
    if (evidence.length > 0) {
      return { id: rule.id, label: rule.label, evidence };
    }
  }

  return { id: "other", label: "Other", evidence: [] };
}
```

- [ ] **Step 5: Run theme and full unit tests**

```bash
npm exec vitest run src/analysis/theme-rules.test.ts
npm run test
```

Expected: all tests pass.

- [ ] **Step 6: Commit the transparent evaluator**

```bash
git add evals/feedback-cases.json src/analysis/theme-rules.ts src/analysis/theme-rules.test.ts
git -c commit.gpgsign=false commit -m "feat: add evidence-backed feedback themes"
```

### Task 6: Add analysis orchestration and preserve provenance

**Files:**
- Create: `src/analysis/analysis-orchestrator.test.ts`
- Create: `src/analysis/analysis-orchestrator.ts`

- [ ] **Step 1: Write failing orchestration tests**

Create `src/analysis/analysis-orchestrator.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import type { SentimentPrediction } from "./contracts";
import { analyzeFeedback, type SentimentEngine } from "./analysis-orchestrator";

const prediction: SentimentPrediction = {
  label: "negative",
  confidence: 0.76,
  latencyMs: 128,
  provenance: {
    modelId: "test/model",
    revision: "abc123",
    task: "sentiment-analysis",
    backend: "wasm",
    dtype: "q8"
  }
};

describe("analyzeFeedback", () => {
  it("blocks PII before invoking the model", async () => {
    const engine: SentimentEngine = { predict: vi.fn().mockResolvedValue(prediction) };
    const outcome = await analyzeFeedback("Email me at ada@example.com.", engine);
    expect(outcome.status).toBe("pii-blocked");
    expect(engine.predict).not.toHaveBeenCalled();
  });

  it("returns model and rule provenance together", async () => {
    const engine: SentimentEngine = { predict: vi.fn().mockResolvedValue(prediction) };
    const outcome = await analyzeFeedback("The assignment brief was unclear.", engine);
    expect(outcome).toMatchObject({
      status: "complete",
      result: {
        sentiment: prediction,
        theme: {
          id: "assessment-clarity",
          evidence: ["assignment", "brief", "unclear"]
        },
        piiStatus: "clear"
      }
    });
  });
});
```

- [ ] **Step 2: Run the failing test**

```bash
npm exec vitest run src/analysis/analysis-orchestrator.test.ts
```

Expected: FAIL because `./analysis-orchestrator` does not exist.

- [ ] **Step 3: Implement the orchestrator**

Create `src/analysis/analysis-orchestrator.ts`:

```ts
import type { AnalysisResult, SentimentPrediction } from "./contracts";
import { validateFeedback, type InputIssue } from "./input-policy";
import { inspectPii, type PiiFinding } from "./pii-guard";
import { classifyTheme } from "./theme-rules";

export interface SentimentEngine {
  predict(text: string): Promise<SentimentPrediction>;
}

export type AnalysisOutcome =
  | { readonly status: "invalid"; readonly issues: readonly InputIssue[] }
  | { readonly status: "pii-blocked"; readonly findings: readonly PiiFinding[] }
  | { readonly status: "complete"; readonly result: AnalysisResult };

export async function analyzeFeedback(
  raw: string,
  engine: SentimentEngine
): Promise<AnalysisOutcome> {
  const input = validateFeedback(raw);
  if (!input.ok) {
    return { status: "invalid", issues: input.issues };
  }

  const findings = inspectPii(input.text);
  if (findings.length > 0) {
    return { status: "pii-blocked", findings };
  }

  const [sentiment, theme] = await Promise.all([
    engine.predict(input.text),
    Promise.resolve(classifyTheme(input.text))
  ]);

  return {
    status: "complete",
    result: {
      sentiment,
      theme,
      piiStatus: "clear",
      limitation:
        "Assistive teaching signal only. This model is not validated for educational decisions."
    }
  };
}
```

- [ ] **Step 4: Run all PR 1 verification**

```bash
npm run verify
npm run test:coverage
git diff --check main...HEAD
```

Expected: all checks pass and configured coverage thresholds are met.

- [ ] **Step 5: Commit orchestration**

```bash
git add src/analysis/analysis-orchestrator.ts src/analysis/analysis-orchestrator.test.ts
git -c commit.gpgsign=false commit -m "feat: preserve analysis provenance end to end"
```

### Task 7: Open, review, and merge PR 1

**Files:**
- No new files.

- [ ] **Step 1: Push and open the PR**

```bash
git push -u origin feat/typed-analysis-core
gh pr create \
  --base main \
  --head feat/typed-analysis-core \
  --title "Build the typed feedback analysis core" \
  --body "## Summary
- establish a strict TypeScript and Vite foundation
- add local input and PII controls
- preserve deterministic theme evidence and model provenance

## Verification
- npm run verify
- npm run test:coverage

## Scope
This PR intentionally excludes browser model loading and the final UI."
```

- [ ] **Step 2: Review the public diff**

```bash
gh pr diff --color=never
gh pr checks --watch
```

Expected: no secrets, generated build output, production test fixtures, or unresolved check failures.

- [ ] **Step 3: Merge PR 1 and update local main**

```bash
gh pr merge --squash --delete-branch
git switch main
git pull --ff-only
```

Expected: PR is merged and `main` contains the typed core.

---

## PR 2: Browser model and student experience

### Task 8: Add the pinned Transformers.js worker and client

**Files:**
- Create: `model-manifest.json`
- Create: `src/analysis/worker-contracts.ts`
- Create: `src/analysis/model-worker.ts`
- Create: `src/analysis/model-client.test.ts`
- Create: `src/analysis/model-client.ts`

- [ ] **Step 1: Create the PR branch from merged main**

```bash
git switch -c feat/browser-model-experience
```

- [ ] **Step 2: Record the immutable model contract**

Create `model-manifest.json`:

```json
{
  "modelId": "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
  "upstreamModelId": "distilbert/distilbert-base-uncased-finetuned-sst-2-english",
  "revision": "0b6928efcb76139cae2c6881d49cda67fe119f42",
  "task": "sentiment-analysis",
  "license": "apache-2.0",
  "defaultBackend": "wasm",
  "defaultDtype": "q8",
  "files": [
    {
      "path": "config.json",
      "bytes": 735,
      "sha256": "b0e9ec981125ef799f31847b1410053069e7708078bb2236ae05239efdd4d428"
    },
    {
      "path": "tokenizer.json",
      "bytes": 711396,
      "sha256": "d241a60d5e8f04cc1b2b3e9ef7a4921b27bf526d9f6050ab90f9267a1f9e5c66"
    },
    {
      "path": "tokenizer_config.json",
      "bytes": 372,
      "sha256": "2bbf2ea55c232406706144b907ca020cd7528a78e3e4741115be3b3566542b0b"
    },
    {
      "path": "vocab.txt",
      "bytes": 231508,
      "sha256": "07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3"
    },
    {
      "path": "onnx/model_quantized.onnx",
      "bytes": 67581197,
      "sha256": "79b45c7fd8c2673aa53615aba07caeb2de798f63a95a2393a365982429c94f7f"
    }
  ],
  "limitations": [
    "Trained on SST-2 movie reviews, not educational feedback.",
    "Binary sentiment loses mixed and neutral nuance.",
    "Confidence is not calibrated certainty."
  ]
}
```

- [ ] **Step 3: Define worker message contracts before implementation**

Create `src/analysis/worker-contracts.ts`:

```ts
import type { AnalysisBackend, SentimentPrediction } from "./contracts";

export type WorkerRequest =
  | { readonly type: "load"; readonly backend: AnalysisBackend }
  | { readonly type: "predict"; readonly requestId: string; readonly text: string };

export type WorkerResponse =
  | { readonly type: "loading"; readonly file: string; readonly progress: number | null }
  | { readonly type: "ready"; readonly backend: AnalysisBackend }
  | { readonly type: "prediction"; readonly requestId: string; readonly prediction: SentimentPrediction }
  | { readonly type: "error"; readonly requestId?: string; readonly message: string };
```

- [ ] **Step 4: Write failing client tests with an in-memory worker**

Create `src/analysis/model-client.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ModelClient, type WorkerLike } from "./model-client";
import type { WorkerRequest, WorkerResponse } from "./worker-contracts";

class FakeWorker implements WorkerLike {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null = null;
  readonly sent: WorkerRequest[] = [];
  postMessage(message: WorkerRequest): void {
    this.sent.push(message);
  }
  terminate(): void {}
  emit(message: WorkerResponse): void {
    this.onmessage?.(new MessageEvent("message", { data: message }));
  }
}

describe("ModelClient", () => {
  it("correlates a prediction without exposing feedback in the result", async () => {
    const worker = new FakeWorker();
    const client = new ModelClient(worker, () => "request-1");
    const promise = client.predict("Useful workshop.");
    expect(worker.sent).toEqual([
      { type: "predict", requestId: "request-1", text: "Useful workshop." }
    ]);
    worker.emit({
      type: "prediction",
      requestId: "request-1",
      prediction: {
        label: "positive",
        confidence: 0.9,
        latencyMs: 100,
        provenance: {
          modelId: "test/model",
          revision: "abc",
          task: "sentiment-analysis",
          backend: "wasm",
          dtype: "q8"
        }
      }
    });
    await expect(promise).resolves.toMatchObject({ label: "positive" });
  });
});
```

- [ ] **Step 5: Implement the client boundary**

Create `src/analysis/model-client.ts`:

```ts
import type { SentimentEngine } from "./analysis-orchestrator";
import type { SentimentPrediction } from "./contracts";
import type { WorkerRequest, WorkerResponse } from "./worker-contracts";

export interface WorkerLike {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null;
  postMessage(message: WorkerRequest): void;
  terminate(): void;
}

export class ModelClient implements SentimentEngine {
  readonly #pending = new Map<string, {
    readonly resolve: (prediction: SentimentPrediction) => void;
    readonly reject: (error: Error) => void;
  }>();

  constructor(
    private readonly worker: WorkerLike,
    private readonly createRequestId: () => string = () => crypto.randomUUID()
  ) {
    worker.onmessage = ({ data }) => {
      if (data.type === "prediction") {
        this.#pending.get(data.requestId)?.resolve(data.prediction);
        this.#pending.delete(data.requestId);
      }
      if (data.type === "error" && data.requestId !== undefined) {
        this.#pending.get(data.requestId)?.reject(new Error(data.message));
        this.#pending.delete(data.requestId);
      }
    };
  }

  predict(text: string): Promise<SentimentPrediction> {
    const requestId = this.createRequestId();
    return new Promise((resolve, reject) => {
      this.#pending.set(requestId, { resolve, reject });
      this.worker.postMessage({ type: "predict", requestId, text });
    });
  }
}
```

- [ ] **Step 6: Implement the pinned worker**

Create `src/analysis/model-worker.ts`:

```ts
/// <reference lib="webworker" />

import { pipeline } from "@huggingface/transformers";
import manifest from "../../model-manifest.json";
import type { AnalysisBackend, SentimentLabel } from "./contracts";
import type { WorkerRequest, WorkerResponse } from "./worker-contracts";

type Classifier = Awaited<ReturnType<typeof pipeline<"sentiment-analysis">>>;

let classifier: Classifier | undefined;
let activeBackend: AnalysisBackend = "wasm";

function send(message: WorkerResponse): void {
  self.postMessage(message);
}

async function load(backend: AnalysisBackend): Promise<Classifier> {
  if (classifier !== undefined && backend === activeBackend) {
    return classifier;
  }

  activeBackend = backend;
  classifier = await pipeline(
    "sentiment-analysis",
    manifest.modelId,
    {
      revision: manifest.revision,
      device: backend === "webgpu" ? "webgpu" : undefined,
      dtype: backend === "webgpu" ? "q4" : "q8",
      progress_callback: (progress) => {
        const record = progress as {
          readonly file?: string;
          readonly progress?: number;
        };
        send({
          type: "loading",
          file: record.file ?? "model",
          progress: record.progress ?? null
        });
      }
    }
  );
  send({ type: "ready", backend });
  return classifier;
}

self.onmessage = async ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    if (data.type === "load") {
      await load(data.backend);
      return;
    }

    const startedAt = performance.now();
    const model = await load(activeBackend);
    const [output] = await model(data.text);
    if (output === undefined) {
      throw new Error("The model returned no classification.");
    }

    send({
      type: "prediction",
      requestId: data.requestId,
      prediction: {
        label: output.label.toLowerCase() as SentimentLabel,
        confidence: output.score,
        latencyMs: Math.round(performance.now() - startedAt),
        provenance: {
          modelId: manifest.modelId,
          revision: manifest.revision,
          task: "sentiment-analysis",
          backend: activeBackend,
          dtype: activeBackend === "webgpu" ? "q4" : "q8"
        }
      }
    });
  } catch (error: unknown) {
    send({
      type: "error",
      requestId: data.type === "predict" ? data.requestId : undefined,
      message: error instanceof Error ? error.message : "Model operation failed."
    });
  }
};
```

Enable JSON imports in `tsconfig.json` with `"resolveJsonModule": true`.

- [ ] **Step 7: Run focused tests and build the worker bundle**

```bash
npm exec vitest run src/analysis/model-client.test.ts
npm run typecheck
npm run build
```

Expected: tests pass and `dist/assets/` contains a separate worker chunk.

- [ ] **Step 8: Commit the model boundary**

```bash
git add model-manifest.json src/analysis tsconfig.json
git -c commit.gpgsign=false commit -m "feat: add pinned browser model worker"
```

### Task 9: Build the accessible student experience and blueprint content

**Files:**
- Create: `src/content/blueprint-content.test.ts`
- Create: `src/content/blueprint-content.ts`
- Create: `src/ui/view-model.ts`
- Create: `src/ui/render.ts`
- Create: `src/ui/app.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Test cost arithmetic and readiness separation**

Create `src/content/blueprint-content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { blueprintContent } from "./blueprint-content";

describe("blueprintContent", () => {
  it("keeps the selected baseline at zero", () => {
    expect(blueprintContent.costs[0]).toMatchObject({
      id: "static-demo",
      monthlyUsd: 0
    });
  });

  it("keeps real institutional use blocked", () => {
    expect(blueprintContent.readiness.institutional.status).toBe("blocked");
    expect(blueprintContent.readiness.demo.status).toBe("ready-when-green");
  });
});
```

- [ ] **Step 2: Add typed blueprint facts**

Create `src/content/blueprint-content.ts`:

```ts
export const blueprintContent = {
  governance: {
    intendedUse:
      "Teach open-model inference, privacy, deployment, cost, and human oversight with synthetic feedback.",
    prohibitedUse:
      "No grading, profiling, disciplinary action, staff evaluation, admissions, or automated routing.",
    dataPolicy:
      "Local processing, no storage, no telemetry, 500-character limit, common-PII warning and local redaction."
  },
  costs: [
    {
      id: "static-demo",
      label: "Selected public demo",
      monthlyUsd: 0,
      assumption: "Hugging Face Static Space, public GitHub repository, standard public-repository CI."
    },
    {
      id: "cpu-upgrade",
      label: "HF CPU Upgrade reference",
      monthlyUsd: 30.9,
      assumption: "$9 PRO plus 730 hours at $0.03/hour."
    },
    {
      id: "t4-small",
      label: "HF T4-small reference",
      monthlyUsd: 301,
      assumption: "$9 PRO plus 730 hours at $0.40/hour."
    }
  ],
  readiness: {
    demo: {
      status: "ready-when-green",
      items: [
        "Model, licence, revision, limitations, and sources are visible.",
        "Unit, evaluation, browser, accessibility, build, and container checks pass.",
        "Privacy, cost, rollback, and incident routes are documented."
      ]
    },
    institutional: {
      status: "blocked",
      items: [
        "Representative educational validation is absent.",
        "Bias, legal, privacy, accessibility, and procurement approvals are absent.",
        "Operational ownership, monitoring, and support are not funded."
      ]
    }
  }
} as const;
```

- [ ] **Step 3: Implement an injected app controller**

Create `src/ui/app.ts` around this stable public contract:

```ts
import { analyzeFeedback, type SentimentEngine } from "../analysis/analysis-orchestrator";
import { redactPii } from "../analysis/pii-guard";
import { renderApp, type AppState } from "./render";

export interface AppDependencies {
  readonly engine: SentimentEngine;
}

export function createApp(root: HTMLElement, dependencies: AppDependencies): void {
  let state: AppState = { status: "idle", input: "" };

  const update = (next: AppState): void => {
    state = next;
    renderApp(root, state, {
      onInput: (input) => update({ status: "idle", input }),
      onAnalyse: async () => {
        update({ status: "analysing", input: state.input });
        try {
          const outcome = await analyzeFeedback(state.input, dependencies.engine);
          update({ status: "resolved", input: state.input, outcome });
        } catch (error: unknown) {
          update({
            status: "failed",
            input: state.input,
            message: error instanceof Error ? error.message : "Analysis failed."
          });
        }
      },
      onRedact: (findings) =>
        update({ status: "idle", input: redactPii(state.input, findings) })
    });
  };

  update(state);
}
```

`render.ts` must:

- Build nodes with `textContent` for all user-derived text.
- Render semantic tabs as buttons with `aria-selected`.
- Keep the input label, help, counter, and inline issue connected with IDs.
- Use an `aria-live="polite"` model/load status.
- Use an `aria-live="assertive"` error region.
- Show sentiment label, percentage, theme, matched terms, PII status, backend, latency, model ID, and revision.
- Show the exact limitation from the orchestrator.
- Offer local redaction when `status === "pii-blocked"`.
- Never copy input into URLs, storage, attributes, logs, or `innerHTML`.

- [ ] **Step 4: Wire the production worker only from `main.ts`**

Replace `src/main.ts` with:

```ts
import "./styles.css";
import { ModelClient } from "./analysis/model-client";
import WorkerUrl from "./analysis/model-worker?worker";
import { createApp } from "./ui/app";

const root = document.querySelector<HTMLDivElement>("#app");
if (root === null) {
  throw new Error("Application root #app is missing.");
}

const worker = new WorkerUrl();
const engine = new ModelClient(worker);
createApp(root, { engine });
```

- [ ] **Step 5: Implement the approved visual system**

`src/styles.css` must encode:

- A warm off-white canvas with deep green, mineral blue, and amber accents.
- A compact academic masthead and the persistent badges “Open model,” “Browser-only,” and “$0 hosting.”
- A two-column demo at desktop and one column below 800 px.
- Blueprint tabs for Architecture, Governance, Costs, and Readiness.
- Visible focus rings with at least 3:1 contrast.
- AA text contrast in both `prefers-color-scheme` modes.
- `prefers-reduced-motion: reduce` disabling non-essential transitions.
- Minimum 44×44 px interactive targets.

- [ ] **Step 6: Run content tests and production build**

```bash
npm exec vitest run src/content/blueprint-content.test.ts
npm run verify
```

Expected: all tests and build pass.

- [ ] **Step 7: Commit the student experience**

```bash
git add src/content src/ui src/main.ts src/styles.css
git -c commit.gpgsign=false commit -m "feat: add the responsible feedback student experience"
```

### Task 10: Add production-isolated browser and accessibility tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/browser/fixture/index.html`
- Create: `tests/browser/fixture/main.ts`
- Create: `tests/browser/student-experience.spec.ts`

- [ ] **Step 1: Add a separate browser-fixture entrypoint**

Create `tests/browser/fixture/main.ts`:

```ts
import "../../../src/styles.css";
import type { SentimentEngine } from "../../../src/analysis/analysis-orchestrator";
import { createApp } from "../../../src/ui/app";

const engine: SentimentEngine = {
  async predict() {
    return {
      label: "negative",
      confidence: 0.76,
      latencyMs: 128,
      provenance: {
        modelId: "fixture/distilbert",
        revision: "fixture-revision",
        task: "sentiment-analysis",
        backend: "wasm",
        dtype: "q8"
      }
    };
  }
};

const root = document.querySelector<HTMLDivElement>("#app");
if (root === null) throw new Error("Fixture root is missing.");
createApp(root, { engine });
```

Create `tests/browser/fixture/index.html` with only `#app` and a module import of `./main.ts`. This fixture is served by a test-only Vite command and is never imported by production code or included in `dist`.

- [ ] **Step 2: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4174",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm exec vite -- tests/browser/fixture --host localhost --port 4174",
    url: "http://localhost:4174",
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } }
  ]
});
```

- [ ] **Step 3: Write visible-control and privacy-flow coverage**

Create `tests/browser/student-experience.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("analyses synthetic feedback and exposes provenance", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Feedback").fill(
    "The practical sessions were useful, but the final assignment instructions were unclear."
  );
  await page.getByRole("button", { name: "Analyse feedback" }).click();
  await expect(page.getByRole("heading", { name: "Analysis result" })).toBeVisible();
  await expect(page.getByText("Assessment clarity")).toBeVisible();
  await expect(page.getByText("fixture/distilbert")).toBeVisible();
  await expect(page.getByText("fixture-revision")).toBeVisible();
});

test("blocks and locally redacts common PII", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Feedback").fill("Email student@example.com about the assignment.");
  await page.getByRole("button", { name: "Analyse feedback" }).click();
  await expect(page.getByRole("alert")).toContainText("email");
  await page.getByRole("button", { name: "Redact locally" }).click();
  await expect(page.getByLabel("Feedback")).toHaveValue(
    "Email [email redacted] about the assignment."
  );
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 4: Install Chromium and run browser tests**

```bash
npx playwright install chromium
npm run test:browser
```

Expected: desktop and mobile projects pass; no axe violations.

- [ ] **Step 5: Verify the fixture is absent from production**

```bash
npm run build
test ! -e dist/tests/browser/fixture/index.html
```

Expected: command succeeds.

- [ ] **Step 6: Commit browser coverage**

```bash
git add playwright.config.ts tests
git -c commit.gpgsign=false commit -m "test: cover the visible privacy and provenance flow"
```

### Task 11: Run a live model smoke and merge PR 2

**Files:**
- No required new source files.

- [ ] **Step 1: Serve the production build**

```bash
npm run build
npm run preview -- --host localhost --port 4173
```

In a second terminal or Playwright session, open `http://localhost:4173`.

- [ ] **Step 2: Verify the real pinned model manually**

Use the synthetic assessment example. Confirm:

- The first run downloads the pinned q8 model.
- The outbound network requests contain model/application paths but not feedback text.
- The result shows model ID, immutable revision, q8, WASM, and measured latency.
- A second run uses cached assets where the browser supports caching.
- Common PII blocks before model inference.

- [ ] **Step 3: Run the full PR 2 gate**

```bash
npm run verify
npm run test:coverage
npm run test:browser
git diff --check main...HEAD
```

- [ ] **Step 4: Push and open PR 2**

```bash
git push -u origin feat/browser-model-experience
gh pr create \
  --base main \
  --head feat/browser-model-experience \
  --title "Run the open model in the student browser" \
  --body "## Summary
- load a pinned quantised DistilBERT model in a Web Worker
- deliver the approved accessible student experience
- surface provenance, privacy controls, costs, governance, and readiness

## Verification
- npm run verify
- npm run test:coverage
- npm run test:browser
- manual pinned-model network smoke

## Privacy
Feedback text remains in the browser and is absent from outbound requests."
```

- [ ] **Step 5: Review, wait for checks, and merge**

```bash
gh pr diff --color=never
gh pr checks --watch
gh pr merge --squash --delete-branch
git switch main
git pull --ff-only
```

---

## PR 3: Production hardening and public release

### Task 12: Add public documentation, licence, and model-manifest verification

**Files:**
- Create: `LICENSE`
- Create: `README.md`
- Create: `SECURITY.md`
- Create: `docs/architecture.md`
- Create: `docs/costs.md`
- Create: `docs/governance.md`
- Create: `docs/readiness.md`
- Create: `docs/security.md`
- Create: `scripts/verify-model-manifest.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the PR branch**

```bash
git switch -c feat/production-release
```

- [ ] **Step 2: Add public-facing repository metadata**

`README.md` must begin with Hugging Face metadata:

```yaml
---
title: ESCP Open AI Production Blueprint
emoji: 🧭
colorFrom: green
colorTo: blue
sdk: static
app_build_command: npm run build
app_file: dist/index.html
fullWidth: true
header: mini
short_description: Open, private-by-design AI production teaching artifact.
models:
  - Xenova/distilbert-base-uncased-finetuned-sst-2-english
---
```

The README then includes:

- Live Space and repository links.
- A five-minute student tour.
- Architecture summary.
- Local npm and Docker commands.
- Model provenance and limitations.
- Security/governance/cost/readiness links.
- “Independent educational prototype. Not an official decision system.”

Add the full Apache-2.0 licence to `LICENSE`.

Add `SECURITY.md` with:

- Supported version: latest tagged release.
- GitHub private vulnerability reporting URL.
- Request not to open public security issues.
- Expected acknowledgement window stated as best effort, not an SLA.

- [ ] **Step 3: Add focused reference documents**

Each file has one clear purpose:

- `docs/architecture.md`: Mermaid runtime/deployment diagram, boundaries, data flow, rollback.
- `docs/security.md`: assets, threats, controls, residual risk, privacy network nuance.
- `docs/governance.md`: intended/prohibited use, data policy, accountability, model change process.
- `docs/costs.md`: dated USD assumptions and arithmetic, including excluded labour.
- `docs/readiness.md`: Gate A checklist and explicitly blocked Gate B.

- [ ] **Step 4: Verify the live model contract from the Hub API**

Create `scripts/verify-model-manifest.mjs`:

```js
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(
  new URL("../model-manifest.json", import.meta.url),
  "utf8"
));
const response = await fetch(
  `https://huggingface.co/api/models/${manifest.modelId}/revision/${manifest.revision}`
);
if (!response.ok) {
  throw new Error(`Model API returned ${response.status}`);
}
const model = await response.json();
if (model.sha !== manifest.revision) {
  throw new Error(`Model revision drift: expected ${manifest.revision}, received ${model.sha}`);
}
for (const expected of manifest.files) {
  const file = model.siblings.find(
    (sibling) => sibling.rfilename === expected.path
  );
  if (file === undefined) {
    throw new Error(`Missing ${expected.path} at pinned model revision`);
  }
}
console.log(`Verified ${manifest.modelId}@${manifest.revision}`);
```

Add:

```json
"verify:model": "node scripts/verify-model-manifest.mjs"
```

to `package.json`, and append `npm run verify:model` to `verify`.

- [ ] **Step 5: Run documentation and manifest checks**

```bash
npm run format:check
npm run verify:model
```

Expected: formatting passes and the API reports revision `0b6928efcb76139cae2c6881d49cda67fe119f42`.

- [ ] **Step 6: Commit documentation**

```bash
git add LICENSE README.md SECURITY.md docs scripts/verify-model-manifest.mjs package.json package-lock.json
git -c commit.gpgsign=false commit -m "docs: publish the production blueprint evidence"
```

### Task 13: Add the reproducible non-root container

**Files:**
- Create: `.dockerignore`
- Create: `Dockerfile`
- Create: `nginx.conf`
- Create: `scripts/verify-container.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing container verifier**

Create `scripts/verify-container.mjs`:

```js
const baseUrl = process.env.CONTAINER_URL ?? "http://localhost:8080";
const response = await fetch(baseUrl);
if (!response.ok) throw new Error(`Container returned ${response.status}`);
const html = await response.text();
if (!html.includes("ESCP Open AI Production Blueprint")) {
  throw new Error("Expected application title was not served");
}
for (const header of [
  "content-security-policy",
  "referrer-policy",
  "x-content-type-options"
]) {
  if (!response.headers.has(header)) {
    throw new Error(`Missing ${header}`);
  }
}
console.log("Container response and security headers verified");
```

- [ ] **Step 2: Add unprivileged Nginx configuration**

Create `nginx.conf`:

```nginx
server {
  listen 8080;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://*.hf.co; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self' https://huggingface.co" always;
  add_header Referrer-Policy "no-referrer" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location = /healthz {
    access_log off;
    return 200 "ok\n";
    add_header Content-Type text/plain;
  }
}
```

The `connect-src` allowlist is revised only if the real-model browser trace proves additional Hugging Face asset hosts are necessary.

- [ ] **Step 3: Add the multi-stage image**

Create `Dockerfile`:

```dockerfile
FROM node:24.18.0-alpine3.23 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29.4-alpine3.23
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
```

- [ ] **Step 4: Build and run the container**

```bash
docker build -t escp-open-ai-production-blueprint:local .
docker run --rm -d --name escp-blueprint -p 8080:8080 \
  escp-open-ai-production-blueprint:local
node scripts/verify-container.mjs
docker inspect escp-blueprint --format '{{.Config.User}}'
docker stop escp-blueprint
```

Expected: verifier passes and user is `101`.

- [ ] **Step 5: Add the container script and commit**

Add to `package.json`:

```json
"verify:container": "node scripts/verify-container.mjs"
```

Then:

```bash
git add .dockerignore Dockerfile nginx.conf scripts/verify-container.mjs package.json package-lock.json
git -c commit.gpgsign=false commit -m "build: add the non-root application container"
```

### Task 14: Add CI, dependency upkeep, and Hugging Face deployment

**Files:**
- Create: `.github/dependabot.yml`
- Create: `.github/workflows/verify.yml`
- Create: `.github/workflows/deploy-space.yml`

- [ ] **Step 1: Add one required verification workflow**

Create `.github/workflows/verify.yml`:

```yaml
name: Verify

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6
      - uses: actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444 # v5
        with:
          node-version: 24.18.0
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run verify
      - run: npm run test:coverage
      - run: npm run test:browser
      - run: docker build -t escp-blueprint:${{ github.sha }} .
      - run: |
          docker run --rm -d --name escp-blueprint -p 8080:8080 escp-blueprint:${{ github.sha }}
          node scripts/verify-container.mjs
          test "$(docker inspect escp-blueprint --format '{{.Config.User}}')" = "101"
      - run: docker stop escp-blueprint
        if: always()
```

The workflow pins third-party actions to immutable commits and preserves the readable version as an inline comment.

- [ ] **Step 2: Add guarded public Space deployment**

Create `.github/workflows/deploy-space.yml`. The final implementation uses Hugging Face Trusted Publishers instead of a long-lived secret: it starts only after a successful `Verify` run on `main`, checks out that run's exact SHA, and grants only the deployment job `id-token: write`.

```yaml
on:
  workflow_run:
    workflows: [Verify]
    types: [completed]
    branches: [main]

permissions:
  contents: read
  id-token: write

jobs:
  deploy:
    if: >-
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.event == 'push' &&
      github.event.workflow_run.head_branch == 'main' &&
      github.event.workflow_run.head_repository.full_name == 'KristopherBorja/escp-open-ai-production-blueprint'
    runs-on: ubuntu-latest
    environment: hugging-face
    steps:
      - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          persist-credentials: false
      - run: node scripts/deploy-space.mjs
        env:
          HF_SPACE_ID: ${{ vars.HF_SPACE_ID }}
          VERIFIED_SHA: ${{ github.event.workflow_run.head_sha }}
```

`scripts/deploy-space.mjs` exchanges GitHub OIDC for a one-hour credential scoped only to the target Space. No long-lived Hugging Face token is created or stored.

- [ ] **Step 3: Add weekly dependency upkeep**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      development-tooling:
        dependency-type: development
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
  - package-ecosystem: docker
    directory: /
    schedule:
      interval: weekly
```

- [ ] **Step 4: Verify workflow syntax and full local gate**

```bash
npm run verify
npm run test:coverage
npm run test:browser
docker build -t escp-open-ai-production-blueprint:local .
git diff --check main...HEAD
```

Expected: all local checks pass.

- [ ] **Step 5: Commit delivery automation**

```bash
git add .github
git -c commit.gpgsign=false commit -m "ci: verify and deploy the public blueprint"
```

### Task 15: Open and merge PR 3

**Files:**
- No required new files.

- [ ] **Step 1: Push and open PR 3**

```bash
git push -u origin feat/production-release
gh pr create \
  --base main \
  --head feat/production-release \
  --title "Harden and release the public production blueprint" \
  --body "## Summary
- publish architecture, security, governance, cost, and readiness evidence
- add a reproducible non-root container
- verify every pull request and sync verified main to a public Static Space

## Verification
- npm run verify
- npm run test:coverage
- npm run test:browser
- Docker response, health, headers, and non-root checks

## Readiness
Gate A targets the public teaching demo. Gate B for real institutional use remains explicitly blocked."
```

- [ ] **Step 2: Inspect the diff and live checks**

```bash
gh pr diff --color=never
gh pr checks --watch
```

If checks fail, inspect logs, fix the root cause with a regression test, push, and repeat until all checks pass.

- [ ] **Step 3: Merge and update main**

```bash
gh pr merge --squash --delete-branch
git switch main
git pull --ff-only
```

### Task 16: Create the Hugging Face Space and publish the release

**Files:**
- Modify only if publication reveals a real platform compatibility issue.

- [ ] **Step 1: Check Hugging Face authentication**

```bash
hf auth whoami
```

Expected: authenticated account with permission to create `bdboychev/escp-open-ai-production-blueprint`. The Hugging Face owner differs from the GitHub owner, so the documented Space owner and workflow target use the real `bdboychev` account; no long-lived credentials are created.

- [ ] **Step 2: Create the public Static Space**

```bash
hf repo create bdboychev/escp-open-ai-production-blueprint \
  --repo-type space \
  --space-sdk static \
  --exist-ok
```

Expected: public Space repository exists.

- [ ] **Step 3: Configure keyless trusted publishing**

In the Space settings, add a GitHub Actions Trusted Publisher restricted to:

- repository `KristopherBorja/escp-open-ai-production-blueprint`;
- branch `main`;
- workflow `deploy-space.yml`.

Set the protected GitHub environment variable `HF_SPACE_ID` to `bdboychev/escp-open-ai-production-blueprint`. Do not create a long-lived deployment token.

- [ ] **Step 4: Merge and watch deployment**

Merge PR #3 after its required `verify` check passes. The protected `main` verification triggers deployment of the exact successful SHA. Watch both workflows and the Space build until they succeed.

- [ ] **Step 5: Verify public URLs and privacy**

Open:

```text
https://github.com/KristopherBorja/escp-open-ai-production-blueprint
https://huggingface.co/spaces/bdboychev/escp-open-ai-production-blueprint
```

Repeat the synthetic analysis and confirm:

- The Space is public.
- Model provenance matches `model-manifest.json`.
- Feedback text appears in no outbound request.
- Governance, costs, and both readiness gates are visible.
- Mobile and desktop layouts are usable.

- [ ] **Step 6: Protect main after the required check exists**

```bash
gh api \
  --method PUT \
  repos/KristopherBorja/escp-open-ai-production-blueprint/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["verify"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

Expected: `main` requires the `verify` check and resolved conversations.

- [ ] **Step 7: Tag the verified public release**

```bash
git tag -a v0.1.0 -m "Public teaching blueprint v0.1.0"
git push origin v0.1.0
gh release create v0.1.0 \
  --title "ESCP Open AI Production Blueprint v0.1.0" \
  --notes "First public teaching release: browser-only open-model inference, governance, costs, containerisation, and readiness evidence."
```

- [ ] **Step 8: Record final evidence**

```bash
git status --short --branch
git rev-parse HEAD
gh pr list --state open
gh run list --limit 5
```

Expected: clean `main`, no implementation PRs left open, recent checks green, and release tag points at verified `main`.

---

## Plan self-review against the specification

### Spec coverage

- Public GitHub repository and PR-only implementation: Tasks 1, 7, 11, and 15.
- Public Static Space: Tasks 14 and 16.
- Open pinned model: Task 8.
- Local-only feedback and PII handling: Tasks 4, 6, 9, 10, and 16.
- Typed evidence/provenance path inspired by SignalDeck: Tasks 3, 5, 6, 8, and 9.
- Approved student experience and blueprint tabs: Task 9.
- Light/dark, responsive, keyboard, and accessibility requirements: Tasks 9 and 10.
- Failure, retry, and fallback states: Tasks 8–10.
- Architecture, security, governance, costs, and readiness docs: Task 12.
- Containerisation: Task 13.
- CI, dependency updates, release, rollback, and branch protection: Tasks 14–16.
- Demo-ready versus institutionally blocked gates: Tasks 9 and 12.
- No production-imported fixtures: Task 10 uses an isolated Vite fixture.

### Compatibility decisions

- Node 24.18.0 is the LTS runtime; Node 26 is current rather than LTS.
- Vite 8 supports Node 24 through its Node 20.19+/22.12+ requirement.
- TypeScript remains on 6.0.3 because typescript-eslint 8.65.0 declares support below 6.1.
- Transformers.js uses the current stable package, an immutable model revision, q8 WASM by default, and optional q4 WebGPU.

### Required review discipline

Before merging each PR:

1. Read the complete diff.
2. Search for secrets, telemetry, storage, unsafe HTML, unpinned model identifiers, and production test-fixture imports.
3. Run the stated local gates.
4. Wait for public GitHub checks.
5. Fix and repeat until there are no unresolved issues.
