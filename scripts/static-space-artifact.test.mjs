import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import { URL } from "node:url";
import { assertCleanArtifactStatus } from "./verify-static-space-artifact.mjs";

const execFileAsync = promisify(execFile);
const repositoryRoot = new URL("../", import.meta.url);
const readme = await readFile(new URL("README.md", repositoryRoot), "utf8");

describe("free-tier Static Space artifact", () => {
  it("serves a prebuilt entrypoint without a Hugging Face build job", () => {
    assert.match(readme, /^app_file: dist\/index\.html$/mu);
    assert.doesNotMatch(readme, /^app_build_command:/mu);
  });

  it("keeps the generated entrypoint in the verified release tree", async () => {
    const entrypoint = await readFile(
      new URL("dist/index.html", repositoryRoot),
      "utf8",
    );
    assert.match(entrypoint, /src="\.\/assets\//u);

    const { stdout } = await execFileAsync(
      "git",
      ["ls-files", "--error-unmatch", "dist/index.html"],
      { cwd: repositoryRoot },
    );
    assert.equal(stdout.trim(), "dist/index.html");
  });

  it("rejects an untracked generated asset", () => {
    assert.throws(
      () =>
        assertCleanArtifactStatus(
          "?? dist/assets/untracked-verification-probe.tmp",
        ),
      /stale or incomplete/u,
    );
  });

  it("ships the third-party notices required by bundled runtimes", async () => {
    const notices = await readFile(
      new URL("THIRD_PARTY_NOTICES.md", repositoryRoot),
      "utf8",
    );
    const sourceMaps = await Promise.all(
      [
        "dist/assets/index-CyvtMEa_.js.map",
        "dist/assets/model-worker-BmZJHUj_.js.map",
      ].map((path) => readFile(new URL(path, repositoryRoot), "utf8")),
    );
    const bundledPackages = new Set(
      sourceMaps.flatMap((sourceMap) =>
        [...sourceMap.matchAll(/node_modules\/((?:@[^/]+\/)?[^/"]+)/gu)]
          .map((match) => match[1])
          .filter((name) => name !== undefined && name !== ".pnpm"),
      ),
    );

    assert.deepEqual([...bundledPackages].sort(), [
      "@huggingface/jinja",
      "@huggingface/tokenizers",
      "@huggingface/transformers",
      "onnxruntime-common",
      "onnxruntime-web",
    ]);
    for (const packageName of bundledPackages) {
      assert.match(notices, new RegExp(packageName.replace("/", "\\/"), "u"));
    }
    assert.match(notices, /MIT License/u);
    assert.match(notices, /Apache License, Version 2\.0/u);
  });
});
