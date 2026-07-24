const MONTHLY_HOURS = 730;
const PRO_SUBSCRIPTION_USD = 9;

export const blueprintContent = {
  architecture: {
    delivery: [
      {
        id: "github",
        label: "Public GitHub repository",
        detail:
          "Reviewed source, tests, container recipe, and release history.",
      },
      {
        id: "space",
        label: "Hugging Face Static Space",
        detail:
          "Serves immutable HTML, CSS, JavaScript, and the model manifest.",
      },
      {
        id: "browser",
        label: "Student browser",
        detail: "Downloads the app and runs inference locally in a Web Worker.",
      },
    ],
    browserStages: [
      {
        id: "input-policy",
        number: "01",
        label: "Input boundary",
        detail:
          "English-only synthetic feedback, trimmed and capped at 500 characters.",
      },
      {
        id: "pii-guard",
        number: "02",
        label: "PII guard",
        detail:
          "Common email and phone patterns stop analysis before the model.",
      },
      {
        id: "open-model",
        number: "03",
        label: "Open model",
        detail: "Pinned quantised DistilBERT runs on CPU through WASM.",
      },
      {
        id: "explained-result",
        number: "04",
        label: "Explained result",
        detail:
          "Sentiment, confidence, theme evidence, latency, and provenance stay visible.",
      },
    ],
  },
  governance: {
    intendedUse:
      "Teach open-model inference, privacy, deployment, cost, and human oversight with synthetic feedback.",
    prohibitedUse:
      "No grading, profiling, disciplinary action, staff evaluation, admissions, or automated routing.",
    privacyDisclosure:
      "Inference stays on this device and your text is not sent to an application server. The browser contacts Hugging Face to download model files, which exposes normal network metadata such as your IP address.",
    controls: [
      "Local processing with no application server, storage, analytics, or telemetry.",
      "A 500-character input limit and a common-PII stop before inference.",
      "An immutable model revision, visible provenance, and versioned synthetic evaluations.",
      "Human interpretation only; no result can trigger a workflow or decision.",
    ],
    residualRisks: [
      "The PII guard cannot guarantee that text is anonymous.",
      "The model was trained on movie reviews, not educational feedback.",
      "Binary sentiment loses neutral, mixed, contextual, and multilingual nuance.",
      "A public browser cannot prevent users from entering real personal data.",
    ],
  },
  costs: {
    checkedOn: "2026-07-24",
    currency: "USD",
    assumptions:
      "730 hours represents an always-on 30.4-day month. Paid references add a $9 PRO subscription; actual billing is usage-based and may differ.",
    exclusions: [
      "Labour",
      "Institutional support",
      "Legal and accessibility review",
      "Custom domains",
      "Monitoring and incident response",
    ],
    options: [
      {
        id: "static-demo",
        label: "Selected static demo",
        monthlyUsd: 0,
        subscriptionUsd: 0,
        hourlyUsd: 0,
        monthlyHours: 0,
        note: "Public Static Space + public repository + standard public-repository CI.",
      },
      {
        id: "cpu-upgrade",
        label: "Always-on CPU reference",
        monthlyUsd: PRO_SUBSCRIPTION_USD + 0.03 * MONTHLY_HOURS,
        subscriptionUsd: PRO_SUBSCRIPTION_USD,
        hourlyUsd: 0.03,
        monthlyHours: MONTHLY_HOURS,
        note: "Reference only; this browser-first design does not require server inference.",
      },
      {
        id: "t4-small",
        label: "Always-on T4 reference",
        monthlyUsd: PRO_SUBSCRIPTION_USD + 0.4 * MONTHLY_HOURS,
        subscriptionUsd: PRO_SUBSCRIPTION_USD,
        hourlyUsd: 0.4,
        monthlyHours: MONTHLY_HOURS,
        note: "Reference only; GPU hosting would change the threat model and operations.",
      },
    ],
    sources: [
      {
        label: "Hugging Face Spaces pricing",
        url: "https://huggingface.co/pricing",
      },
      {
        label: "GitHub Actions billing",
        url: "https://docs.github.com/en/actions/concepts/billing-and-usage",
      },
    ],
  },
  readiness: {
    demo: {
      status: "ready-when-green",
      label: "Public teaching demo",
      items: [
        "Model, licence, revision, limitations, and sources are visible.",
        "Unit, evaluation, browser, accessibility, build, and container checks pass.",
        "Privacy, cost, rollback, dependency, and incident routes are documented.",
        "The public Space and container serve the same reviewed build.",
      ],
    },
    institutional: {
      status: "blocked",
      label: "Institutional use",
      items: [
        "Representative educational validation is absent.",
        "Bias, legal, privacy, accessibility, and procurement approvals are absent.",
        "Operational ownership, monitoring, retention, and support are not funded.",
        "No lawful or ethical basis exists for consequential decisions about people.",
      ],
    },
  },
} as const;
