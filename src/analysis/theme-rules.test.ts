import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ThemeId } from "./contracts";
import { classifyTheme } from "./theme-rules";

interface EvaluationCase {
  readonly id: string;
  readonly text: string;
  readonly repeat?: number;
  readonly expectedTheme?: ThemeId;
}

const fixture = JSON.parse(
  readFileSync(
    new URL("../../evals/feedback-cases.json", import.meta.url),
    "utf8",
  ),
) as { readonly cases: readonly EvaluationCase[] };

interface ThemeEvaluationCase extends EvaluationCase {
  readonly expectedTheme: ThemeId;
}

const themeCases = fixture.cases.filter(
  (evaluationCase): evaluationCase is ThemeEvaluationCase =>
    evaluationCase.expectedTheme !== undefined,
);

describe("classifyTheme", () => {
  it.each(themeCases)("$id", ({ text, expectedTheme }) => {
    expect(classifyTheme(text).id).toBe(expectedTheme);
  });

  it("returns matching terms as evidence", () => {
    expect(classifyTheme("The assignment brief was unclear.").evidence).toEqual(
      ["assignment", "brief", "unclear"],
    );
  });
});
