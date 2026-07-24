import { describe, expect, it } from "vitest";
import { supportsBrowserInference } from "./browser-support";

class FakeWorker {
  readonly supported = true;
}

describe("supportsBrowserInference", () => {
  it("requires both Web Workers and WebAssembly", () => {
    expect(
      supportsBrowserInference({
        Worker: FakeWorker,
        WebAssembly: {},
      }),
    ).toBe(true);
    expect(supportsBrowserInference({ WebAssembly: {} })).toBe(false);
    expect(supportsBrowserInference({ Worker: FakeWorker })).toBe(false);
  });
});
