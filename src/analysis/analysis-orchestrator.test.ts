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
    dtype: "q8",
  },
};

function createEngine(): {
  readonly engine: SentimentEngine;
  readonly predict: ReturnType<typeof vi.fn>;
} {
  const predict = vi.fn().mockResolvedValue(prediction);
  return { engine: { predict }, predict };
}

describe("analyzeFeedback", () => {
  it("rejects invalid input before invoking the model", async () => {
    const { engine, predict } = createEngine();
    const outcome = await analyzeFeedback("   ", engine);

    expect(outcome).toEqual({
      status: "invalid",
      issues: [{ code: "empty", message: "Enter short, synthetic feedback." }],
    });
    expect(predict).not.toHaveBeenCalled();
  });

  it("blocks PII before invoking the model", async () => {
    const { engine, predict } = createEngine();
    const outcome = await analyzeFeedback(
      "Email me at ada@example.com.",
      engine,
    );

    expect(outcome).toMatchObject({
      status: "pii-blocked",
      findings: [{ kind: "email", value: "ada@example.com" }],
    });
    expect(predict).not.toHaveBeenCalled();
  });

  it("returns model and rule provenance together", async () => {
    const { engine, predict } = createEngine();
    const outcome = await analyzeFeedback(
      "The assignment brief was unclear.",
      engine,
    );

    expect(outcome).toMatchObject({
      status: "complete",
      result: {
        sentiment: prediction,
        theme: {
          id: "assessment-clarity",
          evidence: ["assignment", "brief", "unclear"],
        },
        piiStatus: "clear",
      },
    });
    expect(predict).toHaveBeenCalledWith("The assignment brief was unclear.");
  });
});
