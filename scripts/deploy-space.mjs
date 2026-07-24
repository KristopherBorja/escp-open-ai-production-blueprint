import { execFile } from "node:child_process";
import console from "node:console";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { pathToFileURL, URL } from "node:url";

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

export function createDeploymentPlan({ actualSha, expectedSha, spaceId }) {
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

export async function exchangeHuggingFaceToken({
  spaceId,
  idTokenRequestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL ?? "",
  idTokenRequestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN ?? "",
  fetchImpl = globalThis.fetch,
}) {
  if (idTokenRequestUrl.length === 0 || idTokenRequestToken.length === 0) {
    throw new Error("GitHub OIDC is unavailable.");
  }

  const identityUrl = new URL(idTokenRequestUrl);
  identityUrl.searchParams.set("audience", "https://huggingface.co");
  const identityResponse = await fetchImpl(identityUrl.toString(), {
    headers: {
      Authorization: `bearer ${idTokenRequestToken}`,
    },
  });
  if (!identityResponse.ok) {
    throw new Error(
      `GitHub OIDC request returned ${String(identityResponse.status)}.`,
    );
  }
  const identity = await identityResponse.json();
  if (
    typeof identity !== "object" ||
    identity === null ||
    !("value" in identity) ||
    typeof identity.value !== "string" ||
    identity.value.length === 0
  ) {
    throw new Error("GitHub OIDC returned an invalid identity token.");
  }

  const exchangeResponse = await fetchImpl(
    "https://huggingface.co/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        resource: `spaces/${spaceId}`,
        subject_token: identity.value,
        subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
      }),
    },
  );
  if (!exchangeResponse.ok) {
    throw new Error(
      `Hugging Face token exchange returned ${String(exchangeResponse.status)}.`,
    );
  }
  const exchange = await exchangeResponse.json();
  if (
    typeof exchange !== "object" ||
    exchange === null ||
    !("access_token" in exchange) ||
    typeof exchange.access_token !== "string" ||
    exchange.access_token.length === 0
  ) {
    throw new Error("Hugging Face returned an invalid access token.");
  }
  return exchange.access_token;
}

export async function deploySpace({
  spaceId = process.env.HF_SPACE_ID ?? "",
  expectedSha = process.env.VERIFIED_SHA ?? "",
  fetchImpl = globalThis.fetch,
} = {}) {
  const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  });
  const plan = createDeploymentPlan({
    actualSha: stdout.trim(),
    expectedSha,
    spaceId,
  });
  const token = await exchangeHuggingFaceToken({ fetchImpl, spaceId });

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
