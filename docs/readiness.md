# Production-readiness checklist

Two gates prevent a successful teaching demo from being mistaken for approval to process real institutional data.

## Gate A — public teaching demo

Target state for release `v0.1.0`: **ready when every item is green**.

### Product and model

- [x] English-only, 500-character synthetic feedback boundary is visible.
- [x] Common email and phone patterns stop before inference.
- [x] PII redaction remains local and cannot expand input beyond the cap.
- [x] Model ID, immutable revision, upstream model, task, licence, backend, dtype, and limitations are visible.
- [x] Sentiment, confidence, deterministic theme evidence, latency, and provenance are explained.
- [x] Unsupported-browser, worker crash, load timeout, inference timeout, and retry states are bounded.

### Verification

- [x] Unit and versioned synthetic evaluation tests pass.
- [x] Coverage thresholds pass.
- [x] Desktop and mobile browser scenarios pass.
- [x] Automated accessibility checks pass in initial and result states.
- [x] Real-model trace confirms immutable asset requests and no feedback in outbound URLs.
- [x] Production build excludes test fixtures.
- [x] Live model-manifest verification passes.
- [x] Dependency audit reports no high-severity findings.

### Delivery and operations

- [x] Public source repository and reviewed pull-request history exist.
- [x] Static Space metadata builds `dist/index.html`.
- [x] Reproducible multi-stage container runs as non-root user `101`.
- [x] Container health route and security headers are tested.
- [x] CI uses pinned action commits and read-only default permissions.
- [x] Space deployment is guarded by environment and repository scope.
- [x] Architecture, rollback, security, governance, costs, and private reporting are documented.

## Gate B — real institutional use

Status: **blocked**.

- [ ] Representative educational validation across courses, languages, and cohorts exists.
- [ ] Bias and fairness evaluation is approved for the proposed context.
- [ ] A lawful basis, privacy impact assessment, retention policy, and data-controller responsibilities are approved.
- [ ] Accessibility is independently assessed with supported browsers and assistive technologies.
- [ ] Security, identity, access control, audit, procurement, and vendor risk are approved.
- [ ] Named operational ownership, monitoring, incident response, support, and service objectives are funded.
- [ ] Human appeal, contestability, and misuse controls exist.
- [ ] A legitimate case for consequential decisions about people is approved.

Gate B cannot be unlocked by green tests, a successful demo, or a model accuracy score. It requires institutional authority and evidence outside this repository.

## Release sign-off

Before tagging:

1. run the complete local and hosted verification gates;
2. verify the public repository and Space from a signed-out browser;
3. repeat the synthetic analysis and PII stop on desktop and mobile;
4. confirm the model revision and q8 asset in the network trace;
5. confirm feedback text appears in no outbound request;
6. confirm Gate B remains visibly blocked;
7. record the verified commit and rollback tag in the release.
