import { describe, expect, it } from "vitest";
import { inspectPii, redactPii } from "./pii-guard";

describe("inspectPii", () => {
  it("finds email and phone patterns in source order", () => {
    expect(
      inspectPii("Email ada@example.com or call +44 20 7946 0958."),
    ).toEqual([
      { kind: "email", start: 6, end: 21, value: "ada@example.com" },
      { kind: "phone", start: 30, end: 46, value: "+44 20 7946 0958" },
    ]);
  });

  it("does not treat an assignment number as a phone", () => {
    expect(inspectPii("Assignment 2026 was unclear.")).toEqual([]);
  });

  it("does not duplicate numeric text inside an email as a phone", () => {
    expect(inspectPii("Email 1234567@example.com.")).toEqual([
      {
        kind: "email",
        start: 6,
        end: 25,
        value: "1234567@example.com",
      },
    ]);
  });

  it("keeps multiple findings of the same kind in source order", () => {
    expect(
      inspectPii("First ada@example.com, then grace@example.org.").map(
        (finding) => finding.value,
      ),
    ).toEqual(["ada@example.com", "grace@example.org"]);
  });
});

describe("redactPii", () => {
  it("redacts locally without changing other text", () => {
    const text = "Email ada@example.com.";
    expect(redactPii(text, inspectPii(text))).toBe("Email [email redacted].");
  });

  it("redacts multiple findings without shifting later offsets", () => {
    const text = "Email ada@example.com or call +44 20 7946 0958.";
    expect(redactPii(text, inspectPii(text))).toBe(
      "Email [email redacted] or call [phone redacted].",
    );
  });

  it("redacts a numeric email once without corrupting surrounding text", () => {
    const text = "Email 1234567@example.com.";
    expect(redactPii(text, inspectPii(text))).toBe("Email [email redacted].");
  });

  it("uses a compact marker when redaction would exceed the input limit", () => {
    const text = `${"x".repeat(493)} a@b.co`;
    expect(text).toHaveLength(500);

    const redacted = redactPii(text, inspectPii(text));

    expect(redacted).toHaveLength(499);
    expect(redacted).toMatch(/\[PII\]$/u);
    expect(inspectPii(redacted)).toEqual([]);
  });
});
