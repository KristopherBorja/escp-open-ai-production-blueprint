import type { ThemeId, ThemePrediction } from "./contracts";

interface ThemeRule {
  readonly id: Exclude<ThemeId, "other">;
  readonly label: string;
  readonly terms: readonly string[];
}

const RULES: readonly ThemeRule[] = [
  {
    id: "assessment-clarity",
    label: "Assessment clarity",
    terms: [
      "assignment",
      "assessment",
      "brief",
      "deadline",
      "exam",
      "grading",
      "unclear",
    ],
  },
  {
    id: "teaching-delivery",
    label: "Teaching delivery",
    terms: [
      "lecturer",
      "lecture",
      "pace",
      "session",
      "teaching",
      "workshop",
      "explained",
    ],
  },
  {
    id: "course-content",
    label: "Course content",
    terms: [
      "case study",
      "curriculum",
      "module",
      "reading",
      "topic",
      "material",
    ],
  },
  {
    id: "technology-platform",
    label: "Technology or platform",
    terms: [
      "online",
      "platform",
      "portal",
      "software",
      "technology",
      "website",
    ],
  },
  {
    id: "support-administration",
    label: "Support or administration",
    terms: [
      "administration",
      "coordinator",
      "office",
      "reply",
      "support",
      "timetable",
    ],
  },
];

export function classifyTheme(text: string): ThemePrediction {
  const normalised = text.toLocaleLowerCase("en");

  for (const rule of RULES) {
    const evidence = rule.terms.filter((term) => normalised.includes(term));
    if (evidence.length > 0) {
      return { id: rule.id, label: rule.label, evidence };
    }
  }

  return { id: "other", label: "Other", evidence: [] };
}
