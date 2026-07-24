import type { AnalysisOutcome } from "../analysis/analysis-orchestrator";
import type { ModelStatus } from "../analysis/model-client";
import type { PiiFinding } from "../analysis/pii-guard";
import { MAX_FEEDBACK_LENGTH } from "../analysis/input-policy";
import { blueprintContent } from "../content/blueprint-content";
import manifest from "../../model-manifest.json";
import {
  canAnalyse,
  formatConfidence,
  formatModelStatus,
  formatUsd,
} from "./view-model";

export type BlueprintTab =
  "architecture" | "governance" | "costs" | "readiness";

export type AnalysisState =
  | { readonly status: "idle" }
  | { readonly status: "analysing" }
  | { readonly status: "resolved"; readonly outcome: AnalysisOutcome }
  | { readonly status: "failed"; readonly message: string };

export interface AppState {
  readonly input: string;
  readonly model: ModelStatus;
  readonly analysis: AnalysisState;
  readonly activeTab: BlueprintTab;
}

export interface AppHandlers {
  readonly onInput: (input: string) => void;
  readonly onAnalyse: () => void;
  readonly onRedact: (findings: readonly PiiFinding[]) => void;
  readonly onRetryModel: () => void;
  readonly onTabChange: (tab: BlueprintTab) => void;
  readonly onSample: (sample: string) => void;
}

export interface AppView {
  render(state: AppState): void;
  destroy(): void;
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className !== undefined) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function externalLink(label: string, url: string): HTMLAnchorElement {
  const link = element("a", "text-link", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  return link;
}

function definition(
  label: string,
  value: string,
  detail?: string,
): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const term = element("dt", undefined, label);
  const description = element("dd");
  description.append(element("strong", undefined, value));
  if (detail !== undefined) {
    description.append(element("span", "metric-detail", detail));
  }
  fragment.append(term, description);
  return fragment;
}

function buildArchitecturePanel(): HTMLElement {
  const panel = element("section", "blueprint-panel");
  panel.id = "panel-architecture";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-architecture");

  const intro = element("div", "panel-intro");
  intro.append(
    element("p", "section-index", "Architecture"),
    element("h3", undefined, "One reviewed build. Two delivery routes."),
    element(
      "p",
      "panel-lead",
      "The public Space serves static assets; the same build can also be placed in an unprivileged container. In both routes, inference stays in the browser.",
    ),
  );

  const delivery = element("ol", "delivery-flow");
  for (const [
    index,
    stage,
  ] of blueprintContent.architecture.delivery.entries()) {
    const item = element("li", "delivery-stage");
    item.append(
      element("span", "delivery-number", `0${String(index + 1)}`),
      element("strong", undefined, stage.label),
      element("p", undefined, stage.detail),
    );
    delivery.append(item);
  }

  const pipelineHeading = element(
    "h4",
    "subsection-heading",
    "Analysis pipeline inside the browser",
  );
  const pipeline = element("ol", "browser-pipeline");
  for (const stage of blueprintContent.architecture.browserStages) {
    const item = element("li", "pipeline-stage");
    item.append(
      element("span", "pipeline-number", stage.number),
      element("strong", undefined, stage.label),
      element("p", undefined, stage.detail),
    );
    pipeline.append(item);
  }

  panel.append(intro, delivery, pipelineHeading, pipeline);
  return panel;
}

function buildGovernancePanel(): HTMLElement {
  const panel = element("section", "blueprint-panel");
  panel.id = "panel-governance";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-governance");

  const intro = element("div", "panel-intro");
  intro.append(
    element("p", "section-index", "Governance"),
    element("h3", undefined, "Useful for teaching. Unsafe for decisions."),
    element(
      "p",
      "panel-lead",
      "The boundary is part of the product: intended use is narrow, prohibited use is explicit, and residual risk remains visible.",
    ),
  );

  const boundaries = element("div", "governance-boundaries");
  const intended = element("section", "boundary boundary--intended");
  intended.append(
    element("p", "boundary-label", "Intended"),
    element("h4", undefined, "Synthetic teaching examples"),
    element("p", undefined, blueprintContent.governance.intendedUse),
  );
  const prohibited = element("section", "boundary boundary--prohibited");
  prohibited.append(
    element("p", "boundary-label", "Prohibited"),
    element("h4", undefined, "Consequential use about people"),
    element("p", undefined, blueprintContent.governance.prohibitedUse),
  );
  boundaries.append(intended, prohibited);

  const lists = element("div", "governance-lists");
  for (const [title, items] of [
    ["Controls in this demo", blueprintContent.governance.controls],
    ["Residual risks", blueprintContent.governance.residualRisks],
  ] as const) {
    const section = element("section");
    section.append(element("h4", undefined, title));
    const list = element("ul", "line-list");
    for (const item of items) {
      list.append(element("li", undefined, item));
    }
    section.append(list);
    lists.append(section);
  }

  panel.append(intro, boundaries, lists);
  return panel;
}

function buildCostsPanel(): HTMLElement {
  const panel = element("section", "blueprint-panel");
  panel.id = "panel-costs";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-costs");

  const intro = element("div", "panel-intro panel-intro--cost");
  const costHeadline = element("div", "cost-headline");
  costHeadline.append(
    element("span", "cost-value", "$0"),
    element("span", "cost-period", "/ month baseline"),
  );
  intro.append(
    element("p", "section-index", "Costs"),
    element("h3", undefined, "Start static. Price the server you avoided."),
    element(
      "p",
      "panel-lead",
      "Browser inference removes always-on model compute from the selected teaching demo. Paid hardware remains visible as a dated comparison.",
    ),
    costHeadline,
  );

  const tableWrap = element("div", "table-wrap");
  const table = element("table", "cost-table");
  const caption = element(
    "caption",
    undefined,
    `Monthly estimates checked ${blueprintContent.costs.checkedOn}`,
  );
  const head = element("thead");
  const headRow = element("tr");
  for (const label of ["Route", "Monthly estimate", "Assumption"]) {
    headRow.append(element("th", undefined, label));
  }
  head.append(headRow);
  const body = element("tbody");
  for (const option of blueprintContent.costs.options) {
    const row = element("tr");
    const route = element("td");
    route.append(
      element("strong", undefined, option.label),
      element("span", "table-note", option.note),
    );
    row.append(
      route,
      element("td", "cost-cell", formatUsd(option.monthlyUsd)),
      element(
        "td",
        undefined,
        option.hourlyUsd === 0
          ? "No server runtime."
          : `${formatUsd(option.subscriptionUsd)} plan + ${String(
              option.monthlyHours,
            )}h × ${formatUsd(option.hourlyUsd)}/h`,
      ),
    );
    body.append(row);
  }
  table.append(caption, head, body);
  tableWrap.append(table);

  const note = element("p", "source-note", blueprintContent.costs.assumptions);
  note.append(document.createTextNode(" Sources: "));
  for (const [index, source] of blueprintContent.costs.sources.entries()) {
    if (index > 0) {
      note.append(document.createTextNode(" · "));
    }
    note.append(externalLink(source.label, source.url));
  }

  const exclusions = element(
    "p",
    "cost-exclusions",
    `Excludes ${blueprintContent.costs.exclusions
      .map((item) => item.toLocaleLowerCase())
      .join(", ")}.`,
  );

  panel.append(intro, tableWrap, exclusions, note);
  return panel;
}

function buildReadinessPanel(): HTMLElement {
  const panel = element("section", "blueprint-panel");
  panel.id = "panel-readiness";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-readiness");

  const intro = element("div", "panel-intro");
  intro.append(
    element("p", "section-index", "Readiness"),
    element("h3", undefined, "A green demo is not institutional approval."),
    element(
      "p",
      "panel-lead",
      "Two gates prevent a technically successful demonstration from becoming an unreviewed real-world system.",
    ),
  );

  const gates = element("div", "readiness-gates");
  for (const [kind, gate] of [
    ["demo", blueprintContent.readiness.demo],
    ["institutional", blueprintContent.readiness.institutional],
  ] as const) {
    const section = element(
      "section",
      `readiness-gate readiness-gate--${kind}`,
    );
    const status = element(
      "p",
      "readiness-status",
      gate.status === "ready-when-green" ? "Ready when green" : "Blocked",
    );
    section.append(status, element("h4", undefined, gate.label));
    const list = element("ul", "check-list");
    for (const item of gate.items) {
      list.append(element("li", undefined, item));
    }
    section.append(list);
    gates.append(section);
  }

  panel.append(intro, gates);
  return panel;
}

function renderCompleteResult(
  container: HTMLElement,
  outcome: Extract<AnalysisOutcome, { readonly status: "complete" }>,
): void {
  const { sentiment, theme, limitation } = outcome.result;
  const headline = element("div", "result-headline");
  const sentimentValue = element(
    "p",
    `sentiment sentiment--${sentiment.label}`,
    sentiment.label,
  );
  const confidence = element(
    "p",
    "confidence",
    `${formatConfidence(sentiment.confidence)} confidence`,
  );
  headline.append(sentimentValue, confidence);

  const metrics = element("dl", "result-metrics");
  metrics.append(
    definition(
      "Theme",
      theme.label,
      theme.evidence.length > 0
        ? `Matched: ${theme.evidence.join(", ")}`
        : "No deterministic theme term matched.",
    ),
    definition("PII status", "Clear", "No common pattern detected."),
    definition(
      "Runtime",
      `${sentiment.provenance.backend.toUpperCase()} · ${sentiment.provenance.dtype}`,
      `${String(sentiment.latencyMs)} ms local inference`,
    ),
    definition(
      "Open model",
      sentiment.provenance.modelId,
      `Revision ${sentiment.provenance.revision}`,
    ),
    definition(
      "Model licence",
      "Apache-2.0",
      `Upstream: ${manifest.upstreamModelId}`,
    ),
  );

  const limitationBox = element("aside", "limitation");
  limitationBox.append(
    element("strong", undefined, "Interpret with care"),
    element("p", undefined, limitation),
  );
  const limitations = element("ul", "limitation-list");
  for (const item of manifest.limitations) {
    limitations.append(element("li", undefined, item));
  }
  limitationBox.append(limitations);

  container.append(headline, metrics, limitationBox);
}

function renderPiiBlocked(
  container: HTMLElement,
  outcome: Extract<AnalysisOutcome, { readonly status: "pii-blocked" }>,
  handlers: AppHandlers,
): void {
  const alert = element("div", "pii-alert");
  alert.setAttribute("role", "alert");
  const kinds = [...new Set(outcome.findings.map((finding) => finding.kind))];
  alert.append(
    element("p", "alert-kicker", "Analysis stopped locally"),
    element("h3", undefined, "Remove personal data before inference"),
    element(
      "p",
      undefined,
      `Detected common ${kinds.join(" and ")} pattern${
        kinds.length === 1 ? "" : "s"
      }. The model was not called.`,
    ),
  );
  const redact = element(
    "button",
    "button button--secondary",
    "Redact locally",
  );
  redact.type = "button";
  redact.addEventListener("click", () => handlers.onRedact(outcome.findings));
  alert.append(redact);
  container.append(alert);
}

export function createAppView(
  root: HTMLElement,
  handlers: AppHandlers,
): AppView {
  const masthead = element("header", "masthead");
  const brand = element("a", "brand");
  brand.href = "#experience";
  brand.append(
    element("span", "brand-mark", "ESCP"),
    element("span", "brand-name", "Open AI Production Blueprint"),
  );
  const repository = externalLink(
    "View source ↗",
    "https://github.com/KristopherBorja/escp-open-ai-production-blueprint",
  );
  repository.classList.add("masthead-link");
  masthead.append(brand, repository);

  const main = element("main");
  const experience = element("section", "experience");
  experience.id = "experience";
  experience.setAttribute("aria-labelledby", "page-title");

  const hero = element("header", "experience-header");
  hero.append(
    element("p", "eyebrow", "Open model → reviewed application"),
    element("h1", undefined, "Responsible Feedback Analyser"),
    element(
      "p",
      "hero-copy",
      "A small production blueprint that makes privacy, provenance, cost, and deployment visible while sentiment inference runs on your device.",
    ),
  );
  hero.querySelector("h1")?.setAttribute("id", "page-title");
  const badges = element("ul", "badges");
  for (const badge of ["Open model", "Browser-only", "$0 hosting"]) {
    badges.append(element("li", undefined, badge));
  }
  hero.append(badges);

  const modelStrip = element("section", "model-strip");
  modelStrip.setAttribute("aria-live", "polite");
  modelStrip.setAttribute("aria-atomic", "true");
  const modelDot = element("span", "status-dot");
  modelDot.setAttribute("aria-hidden", "true");
  const modelCopy = element("div", "model-copy");
  const modelLabel = element("strong");
  const modelDetail = element("span");
  modelCopy.append(modelLabel, modelDetail);
  const progressTrack = element("div", "progress-track");
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-label", "Open model loading progress");
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", "100");
  const progressBar = element("span", "progress-bar");
  progressTrack.append(progressBar);
  const retryModel = element("button", "retry-button", "Retry model");
  retryModel.type = "button";
  retryModel.addEventListener("click", handlers.onRetryModel);
  modelStrip.append(modelDot, modelCopy, progressTrack, retryModel);

  const demo = element("div", "demo-grid");
  const workspace = element("section", "workspace");
  workspace.setAttribute("aria-labelledby", "feedback-heading");
  workspace.append(
    element("p", "step-label", "01 / Feedback"),
    element("h2", undefined, "Try a synthetic example"),
  );
  workspace.querySelector("h2")?.setAttribute("id", "feedback-heading");

  const sampleLabel = element("p", "sample-label", "Start with a safe sample");
  const samples = element("div", "sample-buttons");
  const sampleValues = [
    {
      label: "Assessment",
      text: "The practical sessions were useful, but the final assignment instructions were unclear.",
    },
    {
      label: "Teaching",
      text: "The lecturer explained the workshop clearly and the pace worked well.",
    },
    {
      label: "PII stop",
      text: "Email student@example.com about the assignment.",
    },
  ];
  for (const sample of sampleValues) {
    const button = element("button", "sample-button", sample.label);
    button.type = "button";
    button.addEventListener("click", () => handlers.onSample(sample.text));
    samples.append(button);
  }

  const field = element("div", "field");
  const labelRow = element("div", "label-row");
  const label = element("label", undefined, "Feedback");
  label.htmlFor = "feedback-input";
  const counter = element("span", "character-counter", "0 / 500");
  labelRow.append(label, counter);
  const help = element(
    "p",
    "field-help",
    "English only. Use short, invented feedback—never real student data.",
  );
  help.id = "feedback-help";
  const textarea = element("textarea");
  textarea.id = "feedback-input";
  textarea.name = "feedback";
  textarea.rows = 7;
  textarea.maxLength = MAX_FEEDBACK_LENGTH;
  textarea.placeholder =
    "e.g. The workshop was useful, but the assignment brief was unclear.";
  textarea.setAttribute("aria-describedby", "feedback-help feedback-issue");
  textarea.addEventListener("input", () => handlers.onInput(textarea.value));
  const fieldIssue = element("p", "field-issue");
  fieldIssue.id = "feedback-issue";
  field.append(labelRow, help, textarea, fieldIssue);

  const actionRow = element("div", "action-row");
  const analyse = element(
    "button",
    "button button--primary",
    "Analyse feedback",
  );
  analyse.type = "button";
  analyse.addEventListener("click", handlers.onAnalyse);
  const privacyNote = element(
    "p",
    "privacy-note",
    blueprintContent.governance.privacyDisclosure,
  );
  actionRow.append(analyse, privacyNote);
  workspace.append(sampleLabel, samples, field, actionRow);

  const resultPanel = element("section", "result-panel");
  resultPanel.setAttribute("aria-labelledby", "result-heading");
  resultPanel.setAttribute("role", "status");
  resultPanel.setAttribute("aria-live", "polite");
  resultPanel.setAttribute("aria-atomic", "true");
  resultPanel.append(element("p", "step-label", "02 / Result"));
  const resultHeading = element("h2", undefined, "What the result will show");
  resultHeading.id = "result-heading";
  const resultBody = element("div", "result-body");
  const errorRegion = element("div", "error-region");
  errorRegion.setAttribute("role", "alert");
  errorRegion.setAttribute("aria-live", "assertive");
  errorRegion.hidden = true;
  resultPanel.append(resultHeading, resultBody, errorRegion);
  demo.append(workspace, resultPanel);
  experience.append(hero, modelStrip, demo);

  const blueprint = element("section", "blueprint");
  blueprint.setAttribute("aria-labelledby", "blueprint-heading");
  const blueprintHeader = element("header", "blueprint-header");
  blueprintHeader.append(
    element("p", "eyebrow", "The production lesson"),
    element("h2", undefined, "From open model to accountable delivery"),
    element(
      "p",
      undefined,
      "The demo is only one layer. Inspect the route, the controls, the price, and the gate.",
    ),
  );
  blueprintHeader.querySelector("h2")?.setAttribute("id", "blueprint-heading");

  const tabList = element("div", "tab-list");
  tabList.setAttribute("role", "tablist");
  tabList.setAttribute("aria-label", "Production blueprint");
  const tabs = new Map<BlueprintTab, HTMLButtonElement>();
  const panels = new Map<BlueprintTab, HTMLElement>();
  const tabOrder: readonly BlueprintTab[] = [
    "architecture",
    "governance",
    "costs",
    "readiness",
  ];
  for (const [tab, labelText, builder] of [
    ["architecture", "Architecture", buildArchitecturePanel],
    ["governance", "Governance", buildGovernancePanel],
    ["costs", "Costs", buildCostsPanel],
    ["readiness", "Readiness", buildReadinessPanel],
  ] as const) {
    const button = element("button", "tab-button", labelText);
    button.type = "button";
    button.id = `tab-${tab}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `panel-${tab}`);
    button.addEventListener("click", () => handlers.onTabChange(tab));
    tabs.set(tab, button);
    tabList.append(button);
    const panel = builder();
    panels.set(tab, panel);
  }
  for (const [tab, button] of tabs) {
    button.addEventListener("keydown", (event) => {
      const currentIndex = tabOrder.indexOf(tab);
      const targetIndex =
        event.key === "ArrowRight"
          ? (currentIndex + 1) % tabOrder.length
          : event.key === "ArrowLeft"
            ? (currentIndex - 1 + tabOrder.length) % tabOrder.length
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? tabOrder.length - 1
                : undefined;
      if (targetIndex === undefined) {
        return;
      }

      event.preventDefault();
      const target = tabOrder[targetIndex];
      if (target !== undefined) {
        handlers.onTabChange(target);
        tabs.get(target)?.focus();
      }
    });
  }
  const panelContainer = element("div", "panel-container");
  panelContainer.append(...panels.values());
  blueprint.append(blueprintHeader, tabList, panelContainer);

  main.append(experience, blueprint);

  const footer = element("footer", "site-footer");
  const footerBrand = element("div");
  footerBrand.append(
    element("strong", undefined, "ESCP Open AI Production Blueprint"),
    element(
      "p",
      undefined,
      "A public teaching artifact. Synthetic feedback only.",
    ),
  );
  const footerLinks = element("nav", "footer-links");
  footerLinks.setAttribute("aria-label", "Project sources");
  footerLinks.append(
    externalLink(
      "GitHub repository",
      "https://github.com/KristopherBorja/escp-open-ai-production-blueprint",
    ),
    externalLink(
      "Open model",
      "https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    ),
  );
  footer.append(footerBrand, footerLinks);

  root.replaceChildren(masthead, main, footer);

  function renderEmptyResult(): void {
    resultBody.replaceChildren(
      element("p", "result-kicker", "Waiting for a synthetic example"),
      element(
        "p",
        "empty-result",
        "You will see sentiment and confidence from the open model, a transparent theme, local latency, and the exact model revision.",
      ),
    );
  }

  return {
    render(state) {
      if (textarea.value !== state.input) {
        textarea.value = state.input;
      }
      counter.textContent = `${String(state.input.length)} / ${String(
        MAX_FEEDBACK_LENGTH,
      )}`;

      const isAnalysing = state.analysis.status === "analysing";
      analyse.disabled = !canAnalyse(state.input, state.model, isAnalysing);
      analyse.textContent = isAnalysing
        ? "Analysing locally…"
        : "Analyse feedback";

      const invalidOutcome =
        state.analysis.status === "resolved" &&
        state.analysis.outcome.status === "invalid"
          ? state.analysis.outcome
          : undefined;
      const issue = invalidOutcome?.issues[0]?.message ?? "";
      fieldIssue.textContent = issue;
      fieldIssue.hidden = issue.length === 0;
      textarea.setAttribute(
        "aria-invalid",
        issue.length > 0 ? "true" : "false",
      );

      const modelView = formatModelStatus(state.model);
      modelStrip.dataset.tone = modelView.tone;
      modelLabel.textContent = modelView.label;
      modelDetail.textContent = modelView.detail;
      retryModel.hidden = state.model.status !== "failed";
      progressTrack.hidden =
        state.model.status !== "loading" && state.model.status !== "ready";
      if (modelView.progress === null) {
        progressTrack.removeAttribute("aria-valuenow");
        progressBar.style.width = "18%";
      } else {
        progressTrack.setAttribute("aria-valuenow", String(modelView.progress));
        progressBar.style.width = `${String(modelView.progress)}%`;
      }

      errorRegion.hidden = state.analysis.status !== "failed";
      errorRegion.textContent =
        state.analysis.status === "failed" ? state.analysis.message : "";

      resultBody.replaceChildren();
      if (state.analysis.status === "analysing") {
        resultHeading.textContent = "Analysis running";
        const loading = element("div", "analysis-loading");
        loading.append(
          element("span", "analysis-pulse"),
          element("strong", undefined, "Running locally"),
          element(
            "p",
            undefined,
            "The worker is evaluating sentiment; no application server receives the text.",
          ),
        );
        resultBody.append(loading);
      } else if (
        state.analysis.status === "resolved" &&
        state.analysis.outcome.status === "complete"
      ) {
        resultHeading.textContent = "Analysis result";
        renderCompleteResult(resultBody, state.analysis.outcome);
      } else if (
        state.analysis.status === "resolved" &&
        state.analysis.outcome.status === "pii-blocked"
      ) {
        resultHeading.textContent = "Privacy check";
        renderPiiBlocked(resultBody, state.analysis.outcome, handlers);
      } else {
        resultHeading.textContent = "What the result will show";
        renderEmptyResult();
      }

      for (const [tab, button] of tabs) {
        const selected = tab === state.activeTab;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        panels.get(tab)?.toggleAttribute("hidden", !selected);
      }
    },
    destroy() {
      root.replaceChildren();
    },
  };
}
