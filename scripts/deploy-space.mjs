import { execFile } from "node:child_process";
import console from "node:console";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const SPACE_NAME = "escp-open-ai-production-blueprint";
const SHA_PATTERN = /^[0-9a-f]{40}$/u;
const OWNER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/u;

export function createAskPassScript() {
  return `#!/bin/sh
case "$1" in
  *Username*) printf '%s\\n' "$HF_USERNAME" ;;
  *Password*) printf '%s\\n' "$HF_TOKEN" ;;
  *) exit 1 ;;
esac
`;
}

export function createDeploymentPlan({
  actualSha,
  expectedSha,
  spaceId,
  token,
}) {
  if (token.length === 0) {
    throw new Error("HF_TOKEN is required.");
  }
  if (!SHA_PATTERN.test(expectedSha) || actualSha !== expectedSha) {
    throw new Error(
      "The checked-out commit does not match the verified commit.",
    );
  }

  const [owner, name, extra] = spaceId.split("/");
  if (
    owner === undefined ||
    !OWNER_PATTERN.test(owner) ||
    name !== SPACE_NAME ||
    extra !== undefined
  ) {
    throw new Error(`The Space target must end with /${SPACE_NAME}.`);
  }

  const remote = `https://huggingface.co/spaces/${spaceId}`;
  return {
    owner,
    remote,
    pushArguments: ["push", "--force", remote, `${expectedSha}:main`],
  };
}

export async function deploySpace({
  token = process.env.HF_TOKEN ?? "",
  spaceId = process.env.HF_SPACE_ID ?? "",
  expectedSha = process.env.VERIFIED_SHA ?? "",
} = {}) {
  const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  });
  const plan = createDeploymentPlan({
    actualSha: stdout.trim(),
    expectedSha,
    spaceId,
    token,
  });

  const credentialDirectory = await mkdtemp(
    join(tmpdir(), "escp-hugging-face-"),
  );
  const askPassPath = join(credentialDirectory, "askpass.sh");
  await writeFile(askPassPath, createAskPassScript(), { mode: 0o700 });

  try {
    await execFileAsync("git", plan.pushArguments, {
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_ASKPASS: askPassPath,
        GIT_TERMINAL_PROMPT: "0",
        HF_TOKEN: token,
        HF_USERNAME: plan.owner,
      },
      maxBuffer: 10 * 1024 * 1024,
    });
  } finally {
    await rm(credentialDirectory, { force: true, recursive: true });
  }

  return `Deployed verified commit ${expectedSha} to ${spaceId}`;
}

async function main() {
  console.log(await deploySpace());
}

const isDirect =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirect) {
  main().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Space deployment failed.",
    );
    process.exitCode = 1;
  });
}
