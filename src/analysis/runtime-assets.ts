import onnxRuntimeFactoryUrl from "onnxruntime-web/ort-wasm-simd-threaded.asyncify.mjs?url";
import onnxRuntimeWasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.asyncify.wasm?url";

export interface OnnxRuntimeTarget {
  useWasmCache: boolean;
  readonly backends: {
    readonly onnx: {
      readonly wasm?: {
        wasmPaths?:
          | string
          | {
              readonly mjs?: string | URL;
              readonly wasm?: string | URL;
            };
      };
    };
  };
}

export const onnxRuntimeAssetPaths = {
  mjs: onnxRuntimeFactoryUrl,
  wasm: onnxRuntimeWasmUrl,
} as const;

export function configureLocalOnnxRuntime(target: OnnxRuntimeTarget): void {
  const wasm = target.backends.onnx.wasm;
  if (wasm === undefined) {
    throw new Error("The ONNX WASM backend is unavailable.");
  }
  wasm.wasmPaths = onnxRuntimeAssetPaths;
  target.useWasmCache = false;
}
