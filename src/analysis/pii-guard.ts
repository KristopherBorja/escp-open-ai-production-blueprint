export type PiiKind = "email" | "phone";

export interface PiiFinding {
  readonly kind: PiiKind;
  readonly start: number;
  readonly end: number;
  readonly value: string;
}

const PATTERNS: readonly {
  readonly kind: PiiKind;
  readonly pattern: RegExp;
}[] = [
  {
    kind: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,
  },
  {
    kind: "phone",
    pattern:
      /(?<!\w)(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}(?!\w)/gu,
  },
];

export function inspectPii(text: string): readonly PiiFinding[] {
  return PATTERNS.flatMap(({ kind, pattern }) =>
    [...text.matchAll(pattern)]
      .filter(
        (match) =>
          kind !== "phone" || (match[0].match(/\d/g)?.length ?? 0) >= 7,
      )
      .map((match) => ({
        kind,
        start: match.index,
        end: match.index + match[0].length,
        value: match[0],
      })),
  ).sort((left, right) => left.start - right.start);
}

export function redactPii(
  text: string,
  findings: readonly PiiFinding[],
): string {
  return [...findings]
    .sort((left, right) => right.start - left.start)
    .reduce(
      (redacted, finding) =>
        `${redacted.slice(0, finding.start)}[${finding.kind} redacted]${redacted.slice(finding.end)}`,
      text,
    );
}
