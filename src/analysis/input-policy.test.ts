import { describe, expect, it } from "vitest";
import { MAX_FEEDBACK_LENGTH, validateFeedback } from "./input-policy";

describe("validateFeedback", () => {
  it("normalises surrounding whitespace for valid feedback", () => {
    expect(validateFeedback("  Useful workshop.  ")).toEqual({
      ok: true,
      text: "Useful workshop.",
    });
  });

  it.each(["", "   "])("rejects empty input %j", (input) => {
    expect(validateFeedback(input)).toEqual({
      ok: false,
      issues: [{ code: "empty", message: "Enter short, synthetic feedback." }],
    });
  });

  it("rejects feedback over the documented limit", () => {
    const result = validateFeedback("x".repeat(MAX_FEEDBACK_LENGTH + 1));
    expect(result).toEqual({
      ok: false,
      issues: [
        {
          code: "too-long",
          message: `Keep feedback to ${String(MAX_FEEDBACK_LENGTH)} characters or fewer.`,
        },
      ],
    });
  });
});
