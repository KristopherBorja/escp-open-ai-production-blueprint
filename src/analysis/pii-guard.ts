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

function overlaps(left: PiiFinding, right: PiiFinding): boolean {
  return left.start < right.end && right.start < left.end;
}

function withoutOverlaps(
  findings: readonly PiiFinding[],
): readonly PiiFinding[] {
  const byPriority = [...findings].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === "email" ? -1 : 1;
    }

    return left.start - right.start;
  });

  const accepted: PiiFinding[] = [];
  for (const finding of byPriority) {
    if (!accepted.some((existing) => overlaps(existing, finding))) {
      accepted.push(finding);
    }
  }

  return accepted.sort((left, right) => left.start - right.start);
}

export function inspectPii(text: string): readonly PiiFinding[] {
  const findings = PATTERNS.flatMap(({ kind, pattern }) =>
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
  );

  return withoutOverlaps(findings);
}

export function redactPii(
  text: string,
  findings: readonly PiiFinding[],
): string {
  return [...withoutOverlaps(findings)]
    .sort((left, right) => right.start - left.start)
    .reduce(
      (redacted, finding) =>
        `${redacted.slice(0, finding.start)}[${finding.kind} redacted]${redacted.slice(finding.end)}`,
      text,
    );
}
