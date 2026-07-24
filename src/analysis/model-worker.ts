/// <reference lib="webworker" />

import { env, pipeline, type ProgressInfo } from "@huggingface/transformers";
import manifest from "../../model-manifest.json";
import type { AnalysisBackend } from "./contracts";
import { normalizeSentimentLabel } from "./model-output";
import { configureLocalOnnxRuntime } from "./runtime-assets";
import type { WorkerRequest, WorkerResponse } from "./worker-contracts";

type Classifier = Awaited<ReturnType<typeof pipeline<"sentiment-analysis">>>;

let classifier: Classifier | undefined;
let activeBackend: AnalysisBackend = "wasm";

env.allowLocalModels = false;
env.useBrowserCache = true;
configureLocalOnnxRuntime(env);
// Transformers.js 4.2 performs registry metadata probes before forwarding the
// pipeline revision. Pin the worker-wide remote path so those probes cannot
// observe a moving branch either.
env.remotePathTemplate = `{model}/resolve/${manifest.revision}/`;

function send(message: WorkerResponse): void {
  self.postMessage(message);
}

function reportProgress(progress: ProgressInfo): void {
  send({
    type: "loading",
    file: "file" in progress ? progress.file : "model",
    progress: "progress" in progress ? progress.progress : null,
  });
}

async function load(backend: AnalysisBackend): Promise<Classifier> {
  if (classifier !== undefined && backend === activeBackend) {
    send({ type: "ready", backend });
    return classifier;
  }

  if (classifier !== undefined) {
    await classifier.dispose();
    classifier = undefined;
  }

  activeBackend = backend;
  classifier = await pipeline("sentiment-analysis", manifest.modelId, {
    revision: manifest.revision,
    device: backend,
    dtype: backend === "webgpu" ? "q4" : "q8",
    progress_callback: reportProgress,
  });
  send({ type: "ready", backend });
  return classifier;
}

self.onmessage = ({ data }: MessageEvent<WorkerRequest>) => {
  void (async () => {
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
          label: normalizeSentimentLabel(output.label),
          confidence: output.score,
          latencyMs: Math.round(performance.now() - startedAt),
          provenance: {
            modelId: manifest.modelId,
            revision: manifest.revision,
            task: "sentiment-analysis",
            backend: activeBackend,
            dtype: activeBackend === "webgpu" ? "q4" : "q8",
          },
        },
      });
    } catch (error: unknown) {
      send({
        type: "error",
        ...(data.type === "predict" ? { requestId: data.requestId } : {}),
        message:
          error instanceof Error ? error.message : "Model operation failed.",
      });
    }
  })();
};
