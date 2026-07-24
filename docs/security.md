# Security and privacy design

## Assets to protect

- integrity of application code, workflow definitions, and release history;
- integrity and provenance of the model revision and expected files;
- feedback text while it is present in browser memory;
- deployment credentials and repository settings;
- student understanding of what the result can and cannot support.

## Threats, controls, and residual risk

| Threat                                                     | Control in this blueprint                                                                                                    | Residual risk                                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Personal data entered accidentally                         | Synthetic-data notice, 500-character cap, common email/phone stop, local redaction                                           | Pattern matching cannot prove anonymity or detect every identifier.                                    |
| Feedback leaks to a server, URL, log, or analytics product | No application backend, storage, telemetry, or user-derived URL parameters; browser trace coverage                           | Browser extensions, compromised devices, and upstream platform behaviour are outside this repository.  |
| Model substitution or dependency compromise                | Immutable package lock, immutable model revision, file sizes/hashes, live manifest verification, reviewed dependency updates | A compromised trusted upstream or build platform remains possible.                                     |
| Cross-site scripting                                       | User text is assigned with `textContent`; no user-derived HTML; restrictive container CSP                                    | Static Space headers are controlled by the hosting platform.                                           |
| Worker crash or resource exhaustion                        | Input cap, isolated Worker, load/prediction timeouts, terminate/recreate recovery                                            | First load is large and slow on constrained devices.                                                   |
| Container privilege or server defaults                     | Multi-stage image, digest-pinned bases, user `101`, unprivileged port, tested headers and health route                       | A reviewed digest can still contain vulnerable software; production operators should scan and rebuild. |
| Misleading certainty or automated overreach                | Confidence caveat, upstream bias warning, prohibited-use ledger, no action integration, blocked institutional gate           | Users can still ignore visible warnings or copy results elsewhere.                                     |
| Credential exposure in CI                                  | Read-only default permissions, immutable action commits, environment-scoped fine-grained Space token                         | Repository and platform administrators remain trusted.                                                 |

## Network and privacy nuance

Inference occurs in the browser, and feedback text is not sent to an application server. The browser still downloads:

- the application from Hugging Face Spaces or the container host;
- the Transformers.js runtime bundled with the application;
- pinned model configuration, tokenizer, vocabulary, and q8 ONNX weights from Hugging Face.

Those requests expose ordinary network metadata, including IP address, timestamps, user agent, and requested asset paths, to the relevant hosting platform and network intermediaries. The UI discloses this next to the input. “Local inference” must never be described as “no network activity.”

## Security headers on the container route

The Nginx route supplies:

- a restrictive Content Security Policy;
- `Referrer-Policy: no-referrer`;
- `X-Content-Type-Options: nosniff`;
- a restrictive `Permissions-Policy`;
- clickjacking control through `frame-ancestors`.

The allowlist is based on a real-model browser trace and must be revisited when the model host, runtime, or delivery route changes.

## Secrets and reporting

No credential belongs in source, build output, logs, screenshots, or chat. The Hugging Face token must be fine-grained, writable only to the target Space, stored as the `HF_TOKEN` GitHub environment secret, and rotated after suspected exposure.

Report vulnerabilities through the private route in [`SECURITY.md`](../SECURITY.md), not a public issue.

## Out of scope for the public demo gate

Institutional identity, access control, audit logging, formal privacy impact assessment, retention policy, procurement, legal review, accessibility certification, incident staffing, and service-level objectives are not implemented. Their absence blocks real institutional use.
