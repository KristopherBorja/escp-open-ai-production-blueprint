import "../../../src/styles.css";
import type { SentimentEngine } from "../../../src/analysis/analysis-orchestrator";
import type { ModelStatus } from "../../../src/analysis/model-client";
import { createApp, type ModelLifecycle } from "../../../src/ui/app";

declare global {
  interface Window {
    __fixturePredictionCount: number;
  }
}

window.__fixturePredictionCount = 0;

const ready: ModelStatus = { status: "ready", backend: "wasm" };
const listeners = new Set<(status: ModelStatus) => void>();
const model: ModelLifecycle = {
  status: ready,
  load() {
    for (const listener of listeners) {
      listener(ready);
    }
  },
  subscribe(listener) {
    listeners.add(listener);
    listener(ready);
    return () => {
      listeners.delete(listener);
    };
  },
};

const engine: SentimentEngine = {
  async predict() {
    window.__fixturePredictionCount += 1;
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    return {
      label: "negative",
      confidence: 0.76,
      latencyMs: 128,
      provenance: {
        modelId: "fixture/distilbert",
        revision: "fixture-revision",
        task: "sentiment-analysis",
        backend: "wasm",
        dtype: "q8",
      },
    };
  },
};

const root = document.querySelector<HTMLDivElement>("#app");
if (root === null) {
  throw new Error("Fixture root is missing.");
}

createApp(root, { engine, model });
