import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { TextEncoder } from "node:util";
import { verifyModelManifest } from "./verify-model-manifest.mjs";

const config = new TextEncoder().encode('{"model_type":"distilbert"}');
const configSha = createHash("sha256").update(config).digest("hex");

const manifest = {
  modelId: "example/model",
  revision: "0123456789abcdef0123456789abcdef01234567",
  files: [
    {
      path: "config.json",
      bytes: config.byteLength,
      sha256: configSha,
    },
    {
      path: "onnx/model_quantized.onnx",
      bytes: 42,
      sha256: "a".repeat(64),
    },
  ],
};

function validFetch(url) {
  if (url.includes("/api/models/")) {
    return Promise.resolve(
      globalThis.Response.json({
        sha: manifest.revision,
        siblings: [
          { rfilename: "config.json", size: config.byteLength },
          {
            rfilename: "onnx/model_quantized.onnx",
            size: 42,
            lfs: { sha256: "a".repeat(64), size: 42 },
          },
        ],
      }),
    );
  }

  return Promise.resolve(new globalThis.Response(config));
}

describe("verifyModelManifest", () => {
  it("checks the pinned revision, file sizes, and available hashes", async () => {
    const result = await verifyModelManifest(manifest, {
      fetchImpl: validFetch,
    });

    assert.equal(
      result,
      "Verified example/model@0123456789abcdef0123456789abcdef01234567 (2 files)",
    );
  });

  it("rejects revision drift", async () => {
    await assert.rejects(
      verifyModelManifest(manifest, {
        fetchImpl: async () =>
          globalThis.Response.json({ sha: "moving-revision", siblings: [] }),
      }),
      /Model revision drift/u,
    );
  });

  it("rejects a missing expected file", async () => {
    await assert.rejects(
      verifyModelManifest(manifest, {
        fetchImpl: async () =>
          globalThis.Response.json({ sha: manifest.revision, siblings: [] }),
      }),
      /Missing config\.json/u,
    );
  });

  it("rejects an LFS hash mismatch without downloading the large file", async () => {
    await assert.rejects(
      verifyModelManifest(manifest, {
        fetchImpl: async (url) =>
          url.includes("/api/models/")
            ? globalThis.Response.json({
                sha: manifest.revision,
                siblings: [
                  { rfilename: "config.json", size: config.byteLength },
                  {
                    rfilename: "onnx/model_quantized.onnx",
                    size: 42,
                    lfs: { sha256: "b".repeat(64), size: 42 },
                  },
                ],
              })
            : new globalThis.Response(config),
      }),
      /Hash mismatch for onnx\/model_quantized\.onnx/u,
    );
  });
});
