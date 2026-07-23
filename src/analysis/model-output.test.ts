import { describe, expect, it } from "vitest";
import { normalizeSentimentLabel } from "./model-output";

describe("normalizeSentimentLabel", () => {
  it.each([
    ["POSITIVE", "positive"],
    ["negative", "negative"],
  ] as const)("normalises %s", (input, expected) => {
    expect(normalizeSentimentLabel(input)).toBe(expected);
  });

  it("rejects labels outside the published binary contract", () => {
    expect(() => normalizeSentimentLabel("NEUTRAL")).toThrow(
      "Unsupported sentiment label: NEUTRAL",
    );
  });
});
