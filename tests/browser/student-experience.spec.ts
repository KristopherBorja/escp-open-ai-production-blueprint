import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const assessmentFeedback =
  "The practical sessions were useful, but the final assignment instructions were unclear.";

test("orients students around the local open-model experience", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Responsible Feedback Analyser" }),
  ).toBeVisible();
  const experience = page.getByRole("region", {
    name: "Responsible Feedback Analyser",
  });
  await expect(
    experience.getByRole("listitem").filter({ hasText: /^Open model$/u }),
  ).toBeVisible();
  await expect(
    experience.getByRole("listitem").filter({ hasText: /^Browser-only$/u }),
  ).toBeVisible();
  await expect(
    experience.getByRole("listitem").filter({ hasText: /^\$0 hosting$/u }),
  ).toBeVisible();
  await expect(page.getByText("Model ready", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Analyse feedback" }),
  ).toBeDisabled();
});

test("analyses synthetic feedback and exposes provenance", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Feedback", exact: true })
    .fill(assessmentFeedback);
  await page.getByRole("button", { name: "Analyse feedback" }).click();

  await expect(
    page.getByRole("heading", { name: "Analysis result" }),
  ).toBeVisible();
  await expect(page.getByText("Assessment clarity")).toBeVisible();
  await expect(page.getByText("fixture/distilbert")).toBeVisible();
  await expect(page.getByText("fixture-revision")).toBeVisible();
  await expect(page.getByText("76% confidence")).toBeVisible();
  await expect(page.getByText("WASM · q8")).toBeVisible();
});

test("blocks and locally redacts common PII before inference", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Feedback", exact: true })
    .fill("Email student@example.com about the assignment.");
  await page.getByRole("button", { name: "Analyse feedback" }).click();

  const alert = page.getByRole("alert");
  await expect(alert).toContainText("email");
  await expect
    .poll(() => page.evaluate(() => window.__fixturePredictionCount))
    .toBe(0);

  await page.getByRole("button", { name: "Redact locally" }).click();
  await expect(
    page.getByRole("textbox", { name: "Feedback", exact: true }),
  ).toHaveValue("Email [email redacted] about the assignment.");
});

test("clears a stale result when input changes during inference", async ({
  page,
}) => {
  await page.goto("/");
  const feedback = page.getByRole("textbox", {
    name: "Feedback",
    exact: true,
  });
  await feedback.fill(assessmentFeedback);
  await page.getByRole("button", { name: "Analyse feedback" }).click();
  await feedback.fill("The workshop pace worked well.");
  await page.waitForTimeout(150);

  await expect(
    page.getByRole("heading", { name: "Analysis result" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "What the result will show" }),
  ).toBeVisible();
});

test("navigates governance, costs, and readiness with semantic tabs", async ({
  page,
}) => {
  await page.goto("/");

  const architecture = page.getByRole("tab", { name: "Architecture" });
  await architecture.focus();
  await architecture.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Governance" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("heading", {
      name: "Useful for teaching. Unsafe for decisions.",
    }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Costs" }).click();
  await expect(
    page.getByRole("cell", { name: "$0", exact: true }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Readiness" }).click();
  await expect(page.getByText("Blocked", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Institutional use" }),
  ).toBeVisible();
});

test("has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page
    .getByRole("textbox", { name: "Feedback", exact: true })
    .fill(assessmentFeedback);
  await page.getByRole("button", { name: "Analyse feedback" }).click();
  await expect(
    page.getByRole("heading", { name: "Analysis result" }),
  ).toBeVisible();

  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
