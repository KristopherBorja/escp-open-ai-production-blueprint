import { execFile } from "node:child_process";
import console from "node:console";
import process from "node:process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);

export function assertCleanArtifactStatus(status) {
  if (status.trim().length > 0) {
    throw new Error(
      `The prebuilt Static Space artifact is stale or incomplete:\n${status.trim()}`,
    );
  }
}

export async function verifyStaticSpaceArtifact({ cwd = process.cwd() } = {}) {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--porcelain", "--untracked-files=all", "--", "dist"],
    { cwd, encoding: "utf8" },
  );
  assertCleanArtifactStatus(stdout);
  return "Verified tracked Static Space artifact";
}

async function main() {
  console.log(await verifyStaticSpaceArtifact());
}

const isDirect =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirect) {
  main().catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Static Space artifact verification failed.",
    );
    process.exitCode = 1;
  });
}
