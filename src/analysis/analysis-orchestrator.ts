import type { AnalysisResult, SentimentPrediction } from "./contracts";
import { validateFeedback, type InputIssue } from "./input-policy";
import { inspectPii, type PiiFinding } from "./pii-guard";
import { classifyTheme } from "./theme-rules";

export interface SentimentEngine {
  predict(text: string): Promise<SentimentPrediction>;
}

export type AnalysisOutcome =
  | { readonly status: "invalid"; readonly issues: readonly InputIssue[] }
  | { readonly status: "pii-blocked"; readonly findings: readonly PiiFinding[] }
  | { readonly status: "complete"; readonly result: AnalysisResult };

export async function analyzeFeedback(
  raw: string,
  engine: SentimentEngine,
): Promise<AnalysisOutcome> {
  const input = validateFeedback(raw);
  if (!input.ok) {
    return { status: "invalid", issues: input.issues };
  }

  const findings = inspectPii(input.text);
  if (findings.length > 0) {
    return { status: "pii-blocked", findings };
  }

  const [sentiment, theme] = await Promise.all([
    engine.predict(input.text),
    Promise.resolve(classifyTheme(input.text)),
  ]);

  return {
    status: "complete",
    result: {
      sentiment,
      theme,
      piiStatus: "clear",
      limitation:
        "Assistive teaching signal only. This model is not validated for educational decisions.",
    },
  };
}
