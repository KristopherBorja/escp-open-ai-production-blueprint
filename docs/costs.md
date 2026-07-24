# Cost estimates

Checked **24 July 2026**. Currency: **USD**.

These are transparent teaching estimates, not quotations. Tax, regional variation, future price changes, exchange rates, and usage outside the stated assumptions are excluded.

## Selected public teaching demo

| Item                      | Monthly platform estimate | Assumption                                                             |
| ------------------------- | ------------------------: | ---------------------------------------------------------------------- |
| Hugging Face Static Space |                        $0 | Static Spaces are served without a compute runtime.                    |
| Public GitHub repository  |                        $0 | Public source repository.                                              |
| Standard GitHub-hosted CI |                        $0 | Standard runners for a public repository; larger runners are excluded. |
| Server inference          |                        $0 | Inference runs on each student's device.                               |
| Local Docker run          |            $0 incremental | Existing machine; electricity and device ownership excluded.           |
| **Baseline total**        |              **$0/month** | Platform baseline only.                                                |

The baseline excludes labour, teaching preparation, institutional support, legal and accessibility review, procurement, custom domains, monitoring, incident response, backups, service management, electricity, and student devices. It is not a total cost of ownership.

## Always-on server comparisons

Assume **730 hours/month** (24 hours × 30.4 days). To keep the comparison conservative and reproducible, the examples include a separate **$9/month Hugging Face PRO** line even though the browser-first design does not require PRO.

| Route           | Arithmetic              | Monthly reference |
| --------------- | ----------------------- | ----------------: |
| CPU Upgrade     | $9 + (730 × $0.03/hour) |        **$30.90** |
| Nvidia T4 small | $9 + (730 × $0.40/hour) |       **$301.00** |

These comparisons show only listed platform rates. A server route would also add API design, authentication, rate limiting, scaling, output validation, observability, incident response, data handling, and a different privacy threat model.

## Sources

- [Hugging Face pricing](https://huggingface.co/pricing) — CPU Basic free; CPU Upgrade $0.03/hour; T4 small $0.40/hour; PRO $9/month when checked.
- [Hugging Face Static Spaces](https://huggingface.co/docs/hub/spaces-sdks-static) — static delivery is free and does not run a compute Space.
- [GitHub Actions billing](https://docs.github.com/en/actions/concepts/billing-and-usage) — standard GitHub-hosted runners are free for public repositories.

Recheck all prices before presenting the comparison or changing architecture.
