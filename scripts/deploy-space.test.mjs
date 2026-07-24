import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAskPassScript, createDeploymentPlan } from "./deploy-space.mjs";

const verifiedSha = "a".repeat(40);

describe("createDeploymentPlan", () => {
  it("targets only the named blueprint Space at the verified commit", () => {
    const plan = createDeploymentPlan({
      actualSha: verifiedSha,
      expectedSha: verifiedSha,
      spaceId: "escp-account/escp-open-ai-production-blueprint",
      token: "hf_test_secret",
    });

    assert.equal(
      plan.remote,
      "https://huggingface.co/spaces/escp-account/escp-open-ai-production-blueprint",
    );
    assert.deepEqual(plan.pushArguments, [
      "push",
      "--force",
      plan.remote,
      `${verifiedSha}:main`,
    ]);
    assert.doesNotMatch(JSON.stringify(plan), /hf_test_secret/u);
  });

  it("rejects a commit that did not pass the hosted verification", () => {
    assert.throws(
      () =>
        createDeploymentPlan({
          actualSha: "b".repeat(40),
          expectedSha: verifiedSha,
          spaceId: "escp-account/escp-open-ai-production-blueprint",
          token: "hf_test_secret",
        }),
      /does not match the verified commit/u,
    );
  });

  it("rejects another repository even when credentials could write to it", () => {
    assert.throws(
      () =>
        createDeploymentPlan({
          actualSha: verifiedSha,
          expectedSha: verifiedSha,
          spaceId: "escp-account/another-space",
          token: "hf_test_secret",
        }),
      /target must end with/u,
    );
  });

  it("requires an environment-scoped token without putting it in the URL", () => {
    assert.throws(
      () =>
        createDeploymentPlan({
          actualSha: verifiedSha,
          expectedSha: verifiedSha,
          spaceId: "escp-account/escp-open-ai-production-blueprint",
          token: "",
        }),
      /HF_TOKEN is required/u,
    );
  });
});

describe("createAskPassScript", () => {
  it("reads the token from the environment instead of embedding it", () => {
    const script = createAskPassScript();

    assert.match(script, /\$HF_TOKEN/u);
    assert.match(script, /\$HF_USERNAME/u);
    assert.doesNotMatch(script, /hf_test_secret/u);
  });
});
