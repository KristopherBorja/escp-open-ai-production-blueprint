import type { SentimentEngine } from "./analysis-orchestrator";
import type { AnalysisBackend, SentimentPrediction } from "./contracts";
import type { WorkerRequest, WorkerResponse } from "./worker-contracts";

export type ModelStatus =
  | { readonly status: "idle" }
  | {
      readonly status: "loading";
      readonly file: string;
      readonly progress: number | null;
    }
  | { readonly status: "ready"; readonly backend: AnalysisBackend }
  | { readonly status: "failed"; readonly message: string };

export interface WorkerLike {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: WorkerRequest): void;
  terminate(): void;
}

interface PendingPrediction {
  readonly resolve: (prediction: SentimentPrediction) => void;
  readonly reject: (error: Error) => void;
}

export class ModelClient implements SentimentEngine {
  readonly #pending = new Map<string, PendingPrediction>();
  readonly #listeners = new Set<(status: ModelStatus) => void>();
  #status: ModelStatus = { status: "idle" };
  #disposed = false;

  constructor(
    private readonly worker: WorkerLike,
    private readonly createRequestId: () => string = () => crypto.randomUUID(),
  ) {
    worker.onmessage = ({ data }) => this.#handleMessage(data);
    worker.onerror = ({ message }) => {
      this.#fail(message || "The model worker failed.");
    };
  }

  get status(): ModelStatus {
    return this.#status;
  }

  subscribe(listener: (status: ModelStatus) => void): () => void {
    this.#listeners.add(listener);
    listener(this.#status);
    return () => this.#listeners.delete(listener);
  }

  load(backend: AnalysisBackend = "wasm"): void {
    if (this.#disposed) {
      return;
    }

    this.#setStatus({ status: "loading", file: "model", progress: null });
    this.worker.postMessage({ type: "load", backend });
  }

  predict(text: string): Promise<SentimentPrediction> {
    if (this.#disposed) {
      return Promise.reject(new Error("The model client was disposed."));
    }

    if (this.#status.status !== "ready") {
      return Promise.reject(new Error("The model is not ready."));
    }

    const requestId = this.createRequestId();
    return new Promise((resolve, reject) => {
      this.#pending.set(requestId, { resolve, reject });
      this.worker.postMessage({ type: "predict", requestId, text });
    });
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }

    this.#disposed = true;
    this.worker.terminate();
    this.#rejectPending(new Error("The model client was disposed."));
    this.#listeners.clear();
  }

  #handleMessage(data: WorkerResponse): void {
    switch (data.type) {
      case "loading":
        this.#setStatus({
          status: "loading",
          file: data.file,
          progress: data.progress,
        });
        break;
      case "ready":
        this.#setStatus({ status: "ready", backend: data.backend });
        break;
      case "prediction": {
        const pending = this.#pending.get(data.requestId);
        pending?.resolve(data.prediction);
        this.#pending.delete(data.requestId);
        break;
      }
      case "error":
        if (data.requestId === undefined) {
          this.#fail(data.message);
          break;
        }

        this.#pending.get(data.requestId)?.reject(new Error(data.message));
        this.#pending.delete(data.requestId);
        break;
    }
  }

  #setStatus(status: ModelStatus): void {
    this.#status = status;
    for (const listener of this.#listeners) {
      listener(status);
    }
  }

  #fail(message: string): void {
    const error = new Error(message);
    this.#setStatus({ status: "failed", message });
    this.#rejectPending(error);
  }

  #rejectPending(error: Error): void {
    for (const pending of this.#pending.values()) {
      pending.reject(error);
    }
    this.#pending.clear();
  }
}
