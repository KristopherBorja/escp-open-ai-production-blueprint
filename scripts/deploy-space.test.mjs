import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAskPassScript,
  createDeploymentPlan,
  exchangeHuggingFaceToken,
} from "./deploy-space.mjs";

const verifiedSha = "a".repeat(40);

describe("createDeploymentPlan", () => {
  it("targets only the named blueprint Space at the verified commit", () => {
    const plan = createDeploymentPlan({
      actualSha: verifiedSha,
      expectedSha: verifiedSha,
      spaceId: "escp-account/escp-open-ai-production-blueprint",
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
  });

  it("rejects a commit that did not pass the hosted verification", () => {
    assert.throws(
      () =>
        createDeploymentPlan({
          actualSha: "b".repeat(40),
          expectedSha: verifiedSha,
          spaceId: "escp-account/escp-open-ai-production-blueprint",
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
        }),
      /target must end with/u,
    );
  });
});

describe("exchangeHuggingFaceToken", () => {
  it("exchanges the GitHub identity for a short-lived Space-scoped token", async () => {
    const requests = [];
    const token = await exchangeHuggingFaceToken({
      fetchImpl: async (url, init = {}) => {
        requests.push({ url, init });
        if (requests.length === 1) {
          return new globalThis.Response(
            JSON.stringify({ value: "github-identity" }),
          );
        }
        return new globalThis.Response(
          JSON.stringify({
            access_token: "hf_short_lived",
            expires_in: 3600,
            token_type: "bearer",
          }),
        );
      },
      idTokenRequestToken: "github-request-token",
      idTokenRequestUrl: "https://github.test/oidc?job=deploy",
      spaceId: "escp-account/escp-open-ai-production-blueprint",
    });

    assert.equal(token, "hf_short_lived");
    assert.equal(
      requests[0]?.url,
      "https://github.test/oidc?job=deploy&audience=https%3A%2F%2Fhuggingface.co",
    );
    assert.equal(
      requests[0]?.init.headers?.Authorization,
      "bearer github-request-token",
    );
    assert.deepEqual(JSON.parse(requests[1]?.init.body), {
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      resource: "spaces/escp-account/escp-open-ai-production-blueprint",
      subject_token: "github-identity",
      subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
    });
  });

  it("requires GitHub Actions OIDC without accepting a stored token", async () => {
    await assert.rejects(
      exchangeHuggingFaceToken({
        idTokenRequestToken: "",
        idTokenRequestUrl: "",
        spaceId: "escp-account/escp-open-ai-production-blueprint",
      }),
      /GitHub OIDC is unavailable/u,
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
