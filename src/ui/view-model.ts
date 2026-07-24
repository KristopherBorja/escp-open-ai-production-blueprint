import type { ModelStatus } from "../analysis/model-client";
import { validateFeedback } from "../analysis/input-policy";

export interface ModelStatusView {
  readonly label: string;
  readonly detail: string;
  readonly tone: "neutral" | "loading" | "ready" | "failed";
  readonly progress: number | null;
}

function boundedProgress(progress: number | null): number | null {
  if (progress === null || !Number.isFinite(progress)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function formatModelStatus(status: ModelStatus): ModelStatusView {
  switch (status.status) {
    case "idle":
      return {
        label: "Model waiting",
        detail: "Preparing the local inference worker.",
        tone: "neutral",
        progress: null,
      };
    case "loading":
      return {
        label: "Loading open model",
        detail: status.file.split("/").at(-1) ?? status.file,
        tone: "loading",
        progress: boundedProgress(status.progress),
      };
    case "ready":
      return {
        label: "Model ready",
        detail:
          status.backend === "wasm"
            ? "WASM · CPU · local inference"
            : "WebGPU · local inference",
        tone: "ready",
        progress: 100,
      };
    case "failed":
      return {
        label: "Model unavailable",
        detail: status.message,
        tone: "failed",
        progress: null,
      };
  }
}

export function formatConfidence(confidence: number): string {
  return `${String(Math.round(confidence * 100))}%`;
}

export function formatUsd(value: number): string {
  return value === 0 ? "$0" : `$${value.toFixed(2)}`;
}

export function canAnalyse(
  input: string,
  modelStatus: ModelStatus,
  isAnalysing: boolean,
): boolean {
  return (
    !isAnalysing && modelStatus.status === "ready" && validateFeedback(input).ok
  );
}
