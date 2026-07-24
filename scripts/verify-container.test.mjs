import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyContainer } from "./verify-container.mjs";

const securityHeaders = {
  "content-security-policy": "default-src 'self'",
  "permissions-policy": "camera=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
};

function validFetch(url) {
  if (url.endsWith("/healthz")) {
    return Promise.resolve(new globalThis.Response("ok\n"));
  }
  if (url.endsWith("/assets/index-test.js")) {
    return Promise.resolve(
      new globalThis.Response(
        'new URL("./model-worker-test.js",import.meta.url)',
      ),
    );
  }
  if (url.endsWith("/assets/model-worker-test.js")) {
    return Promise.resolve(
      new globalThis.Response(
        '"/assets/ort-wasm-simd-threaded.asyncify-test.mjs";"/assets/ort-wasm-simd-threaded.asyncify-test.wasm"',
      ),
    );
  }
  if (url.endsWith(".mjs")) {
    return Promise.resolve(
      new globalThis.Response("", {
        headers: { "content-type": "application/javascript" },
      }),
    );
  }
  if (url.endsWith(".wasm")) {
    return Promise.resolve(
      new globalThis.Response("", {
        headers: { "content-type": "application/wasm" },
      }),
    );
  }
  return Promise.resolve(
    new globalThis.Response(
      '<title>ESCP Open AI Production Blueprint</title><script type="module" src="./assets/index-test.js"></script>',
      { headers: securityHeaders },
    ),
  );
}

describe("verifyContainer", () => {
  it("checks the application, health route, and security headers", async () => {
    await assert.doesNotReject(
      verifyContainer({
        baseUrl: "http://container.test:8080",
        fetchImpl: validFetch,
      }),
    );
  });

  it("rejects a missing security header", async () => {
    await assert.rejects(
      verifyContainer({
        baseUrl: "http://container.test:8080",
        fetchImpl: async (url) =>
          url.endsWith("/healthz")
            ? new globalThis.Response("ok\n")
            : new globalThis.Response(
                "<title>ESCP Open AI Production Blueprint</title>",
                {
                  headers: { "content-security-policy": "default-src 'self'" },
                },
              ),
      }),
      /Missing referrer-policy/u,
    );
  });

  it("rejects an unhealthy health route", async () => {
    await assert.rejects(
      verifyContainer({
        baseUrl: "http://container.test:8080",
        fetchImpl: async (url) =>
          url.endsWith("/healthz")
            ? new globalThis.Response("unavailable", { status: 503 })
            : validFetch(url),
      }),
      /Health endpoint returned 503/u,
    );
  });

  it("rejects a runtime module served with a non-module MIME type", async () => {
    await assert.rejects(
      verifyContainer({
        baseUrl: "http://container.test:8080",
        fetchImpl: async (url, options) => {
          const response = await validFetch(url, options);
          return url.endsWith(".mjs")
            ? new globalThis.Response("", {
                headers: { "content-type": "application/octet-stream" },
              })
            : response;
        },
      }),
      /Runtime module must be JavaScript/u,
    );
  });
});
