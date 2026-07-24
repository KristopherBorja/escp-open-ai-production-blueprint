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
  readonly timeout: ReturnType<typeof setTimeout>;
}

export interface ModelClientTimeouts {
  readonly loadTimeoutMs?: number;
  readonly predictionTimeoutMs?: number;
}

const DEFAULT_LOAD_TIMEOUT_MS = 120_000;
const DEFAULT_PREDICTION_TIMEOUT_MS = 30_000;

export class ModelClient implements SentimentEngine {
  readonly #pending = new Map<string, PendingPrediction>();
  readonly #listeners = new Set<(status: ModelStatus) => void>();
  readonly #loadTimeoutMs: number;
  readonly #predictionTimeoutMs: number;
  #worker: WorkerLike;
  #loadTimeout: ReturnType<typeof setTimeout> | undefined;
  #status: ModelStatus = { status: "idle" };
  #disposed = false;

  constructor(
    private readonly createWorker: () => WorkerLike,
    private readonly createRequestId: () => string = () => crypto.randomUUID(),
    timeouts: ModelClientTimeouts = {},
  ) {
    this.#loadTimeoutMs = timeouts.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;
    this.#predictionTimeoutMs =
      timeouts.predictionTimeoutMs ?? DEFAULT_PREDICTION_TIMEOUT_MS;
    this.#worker = this.createWorker();
    this.#bindWorker();
  }

  #bindWorker(): void {
    this.#worker.onmessage = ({ data }) => this.#handleMessage(data);
    this.#worker.onerror = ({ message }) => {
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
    this.#worker.postMessage({ type: "load", backend });
    this.#armLoadTimeout();
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
      const timeout = setTimeout(() => {
        if (this.#pending.has(requestId)) {
          this.#fail(
            "Local model analysis timed out. Retry with a fresh worker.",
          );
        }
      }, this.#predictionTimeoutMs);
      this.#pending.set(requestId, { resolve, reject, timeout });
      this.#worker.postMessage({ type: "predict", requestId, text });
    });
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }

    this.#disposed = true;
    this.#clearLoadTimeout();
    this.#detachAndTerminateWorker();
    this.#rejectPending(new Error("The model client was disposed."));
    this.#listeners.clear();
  }

  #handleMessage(data: WorkerResponse): void {
    switch (data.type) {
      case "loading":
        this.#armLoadTimeout();
        this.#setStatus({
          status: "loading",
          file: data.file,
          progress: data.progress,
        });
        break;
      case "ready":
        this.#clearLoadTimeout();
        this.#setStatus({ status: "ready", backend: data.backend });
        break;
      case "prediction": {
        const pending = this.#pending.get(data.requestId);
        if (pending !== undefined) {
          clearTimeout(pending.timeout);
        }
        pending?.resolve(data.prediction);
        this.#pending.delete(data.requestId);
        break;
      }
      case "error": {
        if (data.requestId === undefined) {
          this.#fail(data.message);
          break;
        }

        const pending = this.#pending.get(data.requestId);
        if (pending !== undefined) {
          clearTimeout(pending.timeout);
          pending.reject(new Error(data.message));
        }
        this.#pending.delete(data.requestId);
        break;
      }
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
    this.#clearLoadTimeout();
    this.#setStatus({ status: "failed", message });
    this.#rejectPending(error);
    this.#recreateWorker();
  }

  #rejectPending(error: Error): void {
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.#pending.clear();
  }

  #armLoadTimeout(): void {
    this.#clearLoadTimeout();
    this.#loadTimeout = setTimeout(() => {
      this.#fail("The model download timed out. Check the network and retry.");
    }, this.#loadTimeoutMs);
  }

  #clearLoadTimeout(): void {
    if (this.#loadTimeout !== undefined) {
      clearTimeout(this.#loadTimeout);
      this.#loadTimeout = undefined;
    }
  }

  #recreateWorker(): void {
    if (this.#disposed) {
      return;
    }

    this.#detachAndTerminateWorker();
    this.#worker = this.createWorker();
    this.#bindWorker();
  }

  #detachAndTerminateWorker(): void {
    this.#worker.onmessage = null;
    this.#worker.onerror = null;
    this.#worker.terminate();
  }
}
