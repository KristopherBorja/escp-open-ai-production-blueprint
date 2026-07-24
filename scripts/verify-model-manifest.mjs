import { Buffer } from "node:buffer";
import console from "node:console";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL, URL } from "node:url";

function repositoryPath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function assertResponse(response, label) {
  if (!response.ok) {
    throw new Error(`${label} returned ${response.status}`);
  }
}

export async function verifyModelManifest(
  manifest,
  { fetchImpl = globalThis.fetch } = {},
) {
  const modelPath = repositoryPath(manifest.modelId);
  const revision = encodeURIComponent(manifest.revision);
  const apiResponse = await fetchImpl(
    `https://huggingface.co/api/models/${modelPath}/revision/${revision}?blobs=true`,
  );
  assertResponse(apiResponse, "Model API");
  const model = await apiResponse.json();

  if (model.sha !== manifest.revision) {
    throw new Error(
      `Model revision drift: expected ${manifest.revision}, received ${String(model.sha)}`,
    );
  }

  for (const expected of manifest.files) {
    const file = model.siblings?.find(
      (sibling) => sibling.rfilename === expected.path,
    );
    if (file === undefined) {
      throw new Error(
        `Missing ${expected.path} at pinned model revision ${manifest.revision}`,
      );
    }

    const reportedSize = file.lfs?.size ?? file.size;
    if (typeof reportedSize === "number" && reportedSize !== expected.bytes) {
      throw new Error(
        `Size mismatch for ${expected.path}: expected ${String(expected.bytes)}, received ${String(reportedSize)}`,
      );
    }

    if (typeof file.lfs?.sha256 === "string") {
      if (file.lfs.sha256 !== expected.sha256) {
        throw new Error(
          `Hash mismatch for ${expected.path}: expected ${expected.sha256}, received ${file.lfs.sha256}`,
        );
      }
      continue;
    }

    const assetResponse = await fetchImpl(
      `https://huggingface.co/${modelPath}/resolve/${revision}/${repositoryPath(expected.path)}`,
    );
    assertResponse(assetResponse, expected.path);
    const bytes = Buffer.from(await assetResponse.arrayBuffer());
    if (bytes.byteLength !== expected.bytes) {
      throw new Error(
        `Size mismatch for ${expected.path}: expected ${String(expected.bytes)}, received ${String(bytes.byteLength)}`,
      );
    }
    const actualSha = createHash("sha256").update(bytes).digest("hex");
    if (actualSha !== expected.sha256) {
      throw new Error(
        `Hash mismatch for ${expected.path}: expected ${expected.sha256}, received ${actualSha}`,
      );
    }
  }

  return `Verified ${manifest.modelId}@${manifest.revision} (${String(manifest.files.length)} files)`;
}

async function main() {
  const manifest = JSON.parse(
    await readFile(new URL("../model-manifest.json", import.meta.url), "utf8"),
  );
  console.log(await verifyModelManifest(manifest));
}

const isDirect =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirect) {
  main().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Model verification failed.",
    );
    process.exitCode = 1;
  });
}
