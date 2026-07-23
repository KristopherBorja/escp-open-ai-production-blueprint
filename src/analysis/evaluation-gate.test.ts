import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { InputIssue } from "./input-policy";
import { validateFeedback } from "./input-policy";
import type { PiiKind } from "./pii-guard";
import { inspectPii } from "./pii-guard";

interface EvaluationCase {
  readonly id: string;
  readonly text: string;
  readonly repeat?: number;
  readonly expectedInputIssue?: InputIssue["code"];
  readonly expectedPii: readonly PiiKind[];
}

const fixture = JSON.parse(
  readFileSync(
    new URL("../../evals/feedback-cases.json", import.meta.url),
    "utf8",
  ),
) as {
  readonly version: number;
  readonly cases: readonly EvaluationCase[];
};

function evaluationText(evaluationCase: EvaluationCase): string {
  return evaluationCase.text.repeat(evaluationCase.repeat ?? 1);
}

describe("versioned deterministic evaluation gate", () => {
  it("uses an explicit schema version", () => {
    expect(fixture.version).toBe(1);
  });

  it.each(fixture.cases)(
    "$id enforces its declared input boundary",
    (evaluationCase) => {
      const result = validateFeedback(evaluationText(evaluationCase));

      if (evaluationCase.expectedInputIssue === undefined) {
        expect(result.ok).toBe(true);
        return;
      }

      expect(result).toMatchObject({
        ok: false,
        issues: [{ code: evaluationCase.expectedInputIssue }],
      });
    },
  );

  it.each(fixture.cases)(
    "$id enforces its declared PII findings",
    (evaluationCase) => {
      const kinds = inspectPii(evaluationText(evaluationCase)).map(
        (finding) => finding.kind,
      );

      expect(kinds).toEqual(evaluationCase.expectedPii);
    },
  );
});
