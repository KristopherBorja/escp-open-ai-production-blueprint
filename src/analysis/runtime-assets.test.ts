import { describe, expect, it } from "vitest";
import {
  configureLocalOnnxRuntime,
  onnxRuntimeAssetPaths,
  type OnnxRuntimeTarget,
} from "./runtime-assets";

describe("configureLocalOnnxRuntime", () => {
  it("uses reviewed local assets instead of a runtime CDN", () => {
    const target: OnnxRuntimeTarget = {
      useWasmCache: true,
      backends: {
        onnx: {
          wasm: {},
        },
      },
    };

    configureLocalOnnxRuntime(target);

    expect(target.backends.onnx.wasm?.wasmPaths).toEqual(onnxRuntimeAssetPaths);
    expect(onnxRuntimeAssetPaths.mjs).not.toMatch(/^https?:/u);
    expect(onnxRuntimeAssetPaths.wasm).not.toMatch(/^https?:/u);
    expect(target.useWasmCache).toBe(false);
  });

  it("fails clearly when the ONNX WASM backend is unavailable", () => {
    expect(() =>
      configureLocalOnnxRuntime({
        useWasmCache: true,
        backends: { onnx: {} },
      }),
    ).toThrow("The ONNX WASM backend is unavailable.");
  });
});
