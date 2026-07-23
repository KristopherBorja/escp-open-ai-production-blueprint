export const MAX_FEEDBACK_LENGTH = 500;

export type InputIssue =
  | { readonly code: "empty"; readonly message: string }
  | { readonly code: "too-long"; readonly message: string };

export type InputValidation =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly issues: readonly InputIssue[] };

export function validateFeedback(raw: string): InputValidation {
  const text = raw.trim();

  if (text.length === 0) {
    return {
      ok: false,
      issues: [{ code: "empty", message: "Enter short, synthetic feedback." }],
    };
  }

  if (text.length > MAX_FEEDBACK_LENGTH) {
    return {
      ok: false,
      issues: [
        {
          code: "too-long",
          message: `Keep feedback to ${String(MAX_FEEDBACK_LENGTH)} characters or fewer.`,
        },
      ],
    };
  }

  return { ok: true, text };
}
