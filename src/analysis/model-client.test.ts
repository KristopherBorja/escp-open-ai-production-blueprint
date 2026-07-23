import { describe, expect, it, vi } from "vitest";
import { ModelClient, type ModelStatus, type WorkerLike } from "./model-client";
import type { WorkerRequest, WorkerResponse } from "./worker-contracts";

class FakeWorker implements WorkerLike {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  readonly sent: WorkerRequest[] = [];
  readonly terminate = vi.fn();

  postMessage(message: WorkerRequest): void {
    this.sent.push(message);
  }

  emit(message: WorkerResponse): void {
    this.onmessage?.(new MessageEvent("message", { data: message }));
  }

  emitRuntimeError(message: string): void {
    this.onerror?.(new ErrorEvent("error", { message }));
  }
}

const prediction: WorkerResponse = {
  type: "prediction",
  requestId: "request-1",
  prediction: {
    label: "positive",
    confidence: 0.9,
    latencyMs: 100,
    provenance: {
      modelId: "test/model",
      revision: "abc",
      task: "sentiment-analysis",
      backend: "wasm",
      dtype: "q8",
    },
  },
};

function readyClient(): {
  readonly worker: FakeWorker;
  readonly client: ModelClient;
} {
  const worker = new FakeWorker();
  const client = new ModelClient(worker, () => "request-1");
  client.load("wasm");
  worker.emit({ type: "ready", backend: "wasm" });
  return { worker, client };
}

describe("ModelClient", () => {
  it("publishes loading progress and readiness", () => {
    const worker = new FakeWorker();
    const client = new ModelClient(worker);
    const statuses: ModelStatus[] = [];
    client.subscribe((status) => statuses.push(status));

    client.load("wasm");
    worker.emit({
      type: "loading",
      file: "onnx/model_quantized.onnx",
      progress: 42,
    });
    worker.emit({ type: "ready", backend: "wasm" });

    expect(worker.sent).toEqual([{ type: "load", backend: "wasm" }]);
    expect(client.status).toEqual({ status: "ready", backend: "wasm" });
    expect(statuses).toEqual([
      { status: "idle" },
      { status: "loading", file: "model", progress: null },
      {
        status: "loading",
        file: "onnx/model_quantized.onnx",
        progress: 42,
      },
      { status: "ready", backend: "wasm" },
    ]);
  });

  it("rejects prediction before the model is ready", async () => {
    const worker = new FakeWorker();
    const client = new ModelClient(worker);

    await expect(client.predict("Useful workshop.")).rejects.toThrow(
      "The model is not ready.",
    );
    expect(worker.sent).toEqual([]);
  });

  it("correlates a prediction without adding feedback to the result", async () => {
    const { worker, client } = readyClient();
    const promise = client.predict("Useful workshop.");

    expect(worker.sent.at(-1)).toEqual({
      type: "predict",
      requestId: "request-1",
      text: "Useful workshop.",
    });
    worker.emit(prediction);

    await expect(promise).resolves.toEqual(prediction.prediction);
  });

  it("rejects a request-scoped model error", async () => {
    const { worker, client } = readyClient();
    const promise = client.predict("Useful workshop.");

    worker.emit({
      type: "error",
      requestId: "request-1",
      message: "Inference failed.",
    });

    await expect(promise).rejects.toThrow("Inference failed.");
  });

  it("publishes load and runtime failures so the UI can retry", () => {
    const worker = new FakeWorker();
    const client = new ModelClient(worker);
    const statuses: ModelStatus[] = [];
    client.subscribe((status) => statuses.push(status));

    client.load("wasm");
    worker.emit({ type: "error", message: "Download failed." });
    client.load("wasm");
    worker.emitRuntimeError("Worker crashed.");

    expect(statuses.at(-1)).toEqual({
      status: "failed",
      message: "Worker crashed.",
    });
    expect(worker.sent).toEqual([
      { type: "load", backend: "wasm" },
      { type: "load", backend: "wasm" },
    ]);
  });

  it("uses a safe fallback and rejects pending work when the worker crashes", async () => {
    const { worker, client } = readyClient();
    const promise = client.predict("Useful workshop.");

    worker.emitRuntimeError("");

    await expect(promise).rejects.toThrow("The model worker failed.");
    expect(client.status).toEqual({
      status: "failed",
      message: "The model worker failed.",
    });
  });

  it("stops publishing to an unsubscribed status listener", () => {
    const worker = new FakeWorker();
    const client = new ModelClient(worker);
    const listener = vi.fn();
    const unsubscribe = client.subscribe(listener);

    unsubscribe();
    client.load("wasm");

    expect(listener).toHaveBeenCalledOnce();
  });

  it("terminates the worker and rejects pending work on dispose", async () => {
    const { worker, client } = readyClient();
    const promise = client.predict("Useful workshop.");

    client.dispose();

    await expect(promise).rejects.toThrow("The model client was disposed.");
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("makes disposal idempotent and rejects later operations", async () => {
    const worker = new FakeWorker();
    const client = new ModelClient(worker);
    client.dispose();
    client.dispose();
    client.load("wasm");

    await expect(client.predict("Useful workshop.")).rejects.toThrow(
      "The model client was disposed.",
    );
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.sent).toEqual([]);
  });

  it("ignores responses that do not match pending request ids", () => {
    const { worker, client } = readyClient();

    expect(() => {
      worker.emit({ ...prediction, requestId: "unknown" });
      worker.emit({
        type: "error",
        requestId: "unknown",
        message: "Late failure.",
      });
    }).not.toThrow();
    expect(client.status).toEqual({ status: "ready", backend: "wasm" });
  });
});
