import type { SentimentLabel } from "./contracts";

export function normalizeSentimentLabel(label: string): SentimentLabel {
  const normalized = label.toLocaleLowerCase("en");
  if (normalized === "positive" || normalized === "negative") {
    return normalized;
  }

  throw new Error(`Unsupported sentiment label: ${label}`);
}
