import { describe, expect, it } from "vitest";
import type { ModelStatus } from "../analysis/model-client";
import {
  canAnalyse,
  formatConfidence,
  formatModelStatus,
  formatUsd,
} from "./view-model";

describe("formatModelStatus", () => {
  it("turns model progress into a bounded percentage", () => {
    expect(
      formatModelStatus({
        status: "loading",
        file: "onnx/model_quantized.onnx",
        progress: 142,
      }),
    ).toEqual({
      label: "Loading open model",
      detail: "model_quantized.onnx",
      tone: "loading",
      progress: 100,
    });
  });

  it.each([
    [
      { status: "idle" } satisfies ModelStatus,
      {
        label: "Model waiting",
        detail: "Preparing the local inference worker.",
        tone: "neutral",
        progress: null,
      },
    ],
    [
      { status: "ready", backend: "wasm" } satisfies ModelStatus,
      {
        label: "Model ready",
        detail: "WASM · CPU · local inference",
        tone: "ready",
        progress: 100,
      },
    ],
    [
      { status: "failed", message: "Download failed." } satisfies ModelStatus,
      {
        label: "Model unavailable",
        detail: "Download failed.",
        tone: "failed",
        progress: null,
      },
    ],
  ] as const)("formats %s", (status, expected) => {
    expect(formatModelStatus(status)).toEqual(expected);
  });
});

describe("student-facing number formats", () => {
  it("formats confidence as a rounded percentage", () => {
    expect(formatConfidence(0.756)).toBe("76%");
  });

  it("formats whole-dollar and decimal estimates", () => {
    expect(formatUsd(0)).toBe("$0");
    expect(formatUsd(30.9)).toBe("$30.90");
  });
});

describe("canAnalyse", () => {
  it("requires ready model, valid input, and idle analysis", () => {
    expect(
      canAnalyse(
        "Useful workshop.",
        { status: "ready", backend: "wasm" },
        false,
      ),
    ).toBe(true);
    expect(canAnalyse("", { status: "ready", backend: "wasm" }, false)).toBe(
      false,
    );
    expect(canAnalyse("Useful workshop.", { status: "idle" }, false)).toBe(
      false,
    );
    expect(
      canAnalyse(
        "Useful workshop.",
        { status: "ready", backend: "wasm" },
        true,
      ),
    ).toBe(false);
  });
});
