import type { AnalysisBackend, SentimentPrediction } from "./contracts";

export type WorkerRequest =
  | { readonly type: "load"; readonly backend: AnalysisBackend }
  | {
      readonly type: "predict";
      readonly requestId: string;
      readonly text: string;
    };

export type WorkerResponse =
  | {
      readonly type: "loading";
      readonly file: string;
      readonly progress: number | null;
    }
  | { readonly type: "ready"; readonly backend: AnalysisBackend }
  | {
      readonly type: "prediction";
      readonly requestId: string;
      readonly prediction: SentimentPrediction;
    }
  | {
      readonly type: "error";
      readonly requestId?: string;
      readonly message: string;
    };
