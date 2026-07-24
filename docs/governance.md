# Governance

## Intended use

Teach how open-model inference, privacy-by-design, deployment, cost estimation, evidence, and human oversight fit together. Use only short, invented English feedback.

## Prohibited use

Do not use this artifact for:

- grading, admissions, profiling, disciplinary action, or staff evaluation;
- automated routing, alerts, interventions, or workflow decisions;
- evaluating a person, cohort, course, or institution;
- processing real student feedback or personal data;
- claiming neutral, multilingual, factual, or calibrated output.

The result is a teaching demonstration, not a recommendation.

## Data policy

- Use the supplied synthetic examples.
- Do not request or paste real feedback.
- Keep input and output in volatile browser memory only.
- Do not add analytics, telemetry, advertising, or session replay.
- Stop common PII before inference and offer local redaction.
- Treat PII detection as an incomplete guard, not anonymisation.

## Model accountability

The selected model is a 67M-parameter DistilBERT checkpoint fine-tuned on SST-2 movie reviews. It is not validated on educational feedback. Binary output loses mixed and neutral nuance; confidence is not calibrated certainty. The upstream model card documents material bias sensitivity, including country terms.

Repository maintainers own the decision to use or change the model. Every model change must:

1. use an immutable revision and compatible open licence;
2. update `model-manifest.json`, expected files, sizes, and hashes;
3. refresh synthetic functional, edge, identity-term, and country-term evaluation probes;
4. repeat the real-browser privacy and asset-host trace;
5. update visible provenance, limitations, security, cost, and architecture evidence;
6. pass review and the complete verification workflow before merge;
7. produce an explicit release note and rollback target.

The application must never silently fall back to another model or moving branch.

## Change and review process

- Changes arrive through reviewable pull requests.
- CI checks format, lint, types, tests, evaluation cases, build, browser behaviour, accessibility, model manifest, container behaviour, headers, non-root execution, and critical container vulnerabilities.
- Direct dependencies, GitHub Actions, and container bases receive weekly update proposals.
- Third-party workflow actions use immutable commit references.
- Security fixes follow the private reporting route and produce a tagged release.

## Review cadence

Review this governance ledger and the cost model at least quarterly and whenever the model, hosting platform, material dependency, data policy, or intended use changes.

## Human responsibility

Students and lecturers remain responsible for interpretation. A sentiment label cannot establish teaching quality, intent, urgency, fairness, or truth. No output from this artifact can trigger a workflow or decision.
