import {
  analyzeFeedback,
  type SentimentEngine,
} from "../analysis/analysis-orchestrator";
import type { ModelStatus } from "../analysis/model-client";
import { redactPii } from "../analysis/pii-guard";
import { createAppView, type AppState, type BlueprintTab } from "./render";

export interface ModelLifecycle {
  readonly status: ModelStatus;
  load(backend?: "wasm" | "webgpu"): void;
  subscribe(listener: (status: ModelStatus) => void): () => void;
}

export interface AppDependencies {
  readonly engine: SentimentEngine;
  readonly model: ModelLifecycle;
}

export function createApp(
  root: HTMLElement,
  dependencies: AppDependencies,
): () => void {
  let state: AppState = {
    input: "",
    model: dependencies.model.status,
    analysis: { status: "idle" },
    activeTab: "architecture",
  };
  let generation = 0;

  const update = (patch: Partial<AppState>): void => {
    state = { ...state, ...patch };
    view.render(state);
  };

  const setInput = (input: string): void => {
    generation += 1;
    update({ input, analysis: { status: "idle" } });
  };

  const analyse = async (): Promise<void> => {
    const run = ++generation;
    const input = state.input;
    update({ analysis: { status: "analysing" } });

    try {
      const outcome = await analyzeFeedback(input, dependencies.engine);
      if (run !== generation) {
        return;
      }
      update({ analysis: { status: "resolved", outcome } });
    } catch (error: unknown) {
      if (run !== generation) {
        return;
      }
      update({
        analysis: {
          status: "failed",
          message: error instanceof Error ? error.message : "Analysis failed.",
        },
      });
    }
  };

  const view = createAppView(root, {
    onInput: setInput,
    onAnalyse: () => {
      void analyse();
    },
    onRedact: (findings) => {
      setInput(redactPii(state.input, findings));
    },
    onRetryModel: () => dependencies.model.load("wasm"),
    onTabChange: (activeTab: BlueprintTab) => update({ activeTab }),
    onSample: setInput,
  });

  view.render(state);
  const unsubscribe = dependencies.model.subscribe((model) => {
    update({ model });
  });
  dependencies.model.load("wasm");

  return () => {
    generation += 1;
    unsubscribe();
    view.destroy();
  };
}
