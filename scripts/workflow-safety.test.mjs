import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { URL } from "node:url";

const deployWorkflow = await readFile(
  new URL("../.github/workflows/deploy-space.yml", import.meta.url),
  "utf8",
);

describe("Space deployment workflow", () => {
  it("checks out complete history before mirroring the verified commit", () => {
    assert.match(deployWorkflow, /^\s{10}fetch-depth: 0$/mu);
  });
});
