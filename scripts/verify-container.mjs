import console from "node:console";
import process from "node:process";
import { pathToFileURL } from "node:url";

const REQUIRED_HEADERS = [
  "content-security-policy",
  "referrer-policy",
  "x-content-type-options",
  "permissions-policy",
];

function requiredAsset(source, pattern, label) {
  const match = source.match(pattern);
  const asset = match?.[1];
  if (asset === undefined) {
    throw new Error(`Could not discover the ${label} asset`);
  }
  return asset;
}

async function fetchTextAsset(fetchImpl, url, label) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`${label} returned ${String(response.status)}`);
  }
  return response.text();
}

export async function verifyContainer({
  baseUrl = "http://localhost:8080",
  fetchImpl = globalThis.fetch,
} = {}) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, "");
  const response = await fetchImpl(normalizedBaseUrl);
  if (!response.ok) {
    throw new Error(`Container returned ${String(response.status)}`);
  }

  const html = await response.text();
  if (!html.includes("ESCP Open AI Production Blueprint")) {
    throw new Error("Expected application title was not served");
  }

  for (const header of REQUIRED_HEADERS) {
    if (!response.headers.has(header)) {
      throw new Error(`Missing ${header}`);
    }
  }

  const entryName = requiredAsset(
    html,
    /(?:\.\/)?assets\/([^"' ]+\.js)/u,
    "entry JavaScript",
  );
  const entry = await fetchTextAsset(
    fetchImpl,
    `${normalizedBaseUrl}/assets/${entryName}`,
    "Entry JavaScript",
  );
  const workerName = requiredAsset(
    entry,
    /(model-worker-[A-Za-z0-9_-]+\.js)/u,
    "model worker",
  );
  const worker = await fetchTextAsset(
    fetchImpl,
    `${normalizedBaseUrl}/assets/${workerName}`,
    "Model worker",
  );
  const runtimeModuleName = requiredAsset(
    worker,
    /(ort-wasm-simd-threaded\.asyncify-[A-Za-z0-9_-]+\.mjs)/u,
    "ONNX runtime module",
  );
  const runtimeWasmName = requiredAsset(
    worker,
    /(ort-wasm-simd-threaded\.asyncify-[A-Za-z0-9_-]+\.wasm)/u,
    "ONNX WASM binary",
  );

  const runtimeModule = await fetchImpl(
    `${normalizedBaseUrl}/assets/${runtimeModuleName}`,
    { method: "HEAD" },
  );
  if (!runtimeModule.ok) {
    throw new Error(`Runtime module returned ${String(runtimeModule.status)}`);
  }
  if (
    !/javascript|ecmascript/iu.test(
      runtimeModule.headers.get("content-type") ?? "",
    )
  ) {
    throw new Error("Runtime module must be JavaScript");
  }

  const runtimeWasm = await fetchImpl(
    `${normalizedBaseUrl}/assets/${runtimeWasmName}`,
    { method: "HEAD" },
  );
  if (!runtimeWasm.ok) {
    throw new Error(`WASM binary returned ${String(runtimeWasm.status)}`);
  }
  if (
    runtimeWasm.headers.get("content-type")?.split(";")[0]?.trim() !==
    "application/wasm"
  ) {
    throw new Error("Runtime WASM binary must use application/wasm");
  }

  const health = await fetchImpl(`${normalizedBaseUrl}/healthz`);
  if (!health.ok) {
    throw new Error(`Health endpoint returned ${String(health.status)}`);
  }
  if ((await health.text()).trim() !== "ok") {
    throw new Error("Health endpoint returned an unexpected body");
  }

  return `Container response, runtime MIME types, health route, and ${String(REQUIRED_HEADERS.length)} security headers verified`;
}

async function main() {
  console.log(
    await verifyContainer({
      baseUrl: process.env.CONTAINER_URL ?? "http://localhost:8080",
    }),
  );
}

const isDirect =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirect) {
  main().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Container verification failed.",
    );
    process.exitCode = 1;
  });
}
