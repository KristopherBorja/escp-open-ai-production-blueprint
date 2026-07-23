export type AnalysisBackend = "wasm" | "webgpu";
export type SentimentLabel = "negative" | "positive";
export type ThemeId =
  | "teaching-delivery"
  | "assessment-clarity"
  | "course-content"
  | "technology-platform"
  | "support-administration"
  | "other";

export interface ModelProvenance {
  readonly modelId: string;
  readonly revision: string;
  readonly task: "sentiment-analysis";
  readonly backend: AnalysisBackend;
  readonly dtype: "q8" | "q4";
}

export interface SentimentPrediction {
  readonly label: SentimentLabel;
  readonly confidence: number;
  readonly latencyMs: number;
  readonly provenance: ModelProvenance;
}

export interface ThemePrediction {
  readonly id: ThemeId;
  readonly label: string;
  readonly evidence: readonly string[];
}

export interface AnalysisResult {
  readonly sentiment: SentimentPrediction;
  readonly theme: ThemePrediction;
  readonly piiStatus: "clear";
  readonly limitation: string;
}
