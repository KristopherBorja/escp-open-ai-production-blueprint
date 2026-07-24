# Security policy

## Supported version

Only the latest tagged release receives security updates. This public teaching prototype has no availability or support SLA.

## Report a vulnerability privately

Do not open a public issue containing exploit details, credentials, personal data, or an unpatched vulnerability.

Use [GitHub private vulnerability reporting](https://github.com/KristopherBorja/escp-open-ai-production-blueprint/security/advisories/new). Include:

- the affected release or commit;
- the browser, container, or workflow involved;
- reproducible steps using synthetic data;
- the likely impact;
- a suggested mitigation, if known.

Never include real student feedback or personal information in a report.

## What to expect

Maintainers aim to acknowledge a complete report within five business days on a best-effort basis. This is a teaching project, so that target is not an SLA. Confirmed issues are handled through a private advisory, a reviewed fix, fresh verification, and a tagged release. Public disclosure is coordinated after users have a reasonable opportunity to update.

## Scope notes

The browser contacts Hugging Face to download pinned model assets. Ordinary network metadata such as IP address is therefore visible to the hosting platform even though feedback text remains in the browser. Model quality, bias, and misuse concerns are documented in [governance](docs/governance.md); they are not automatically security vulnerabilities.
