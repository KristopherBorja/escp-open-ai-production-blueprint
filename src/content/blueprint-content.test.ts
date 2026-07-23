import { describe, expect, it } from "vitest";
import { blueprintContent } from "./blueprint-content";

describe("blueprintContent", () => {
  it("keeps the selected baseline at zero", () => {
    expect(blueprintContent.costs.options[0]).toMatchObject({
      id: "static-demo",
      monthlyUsd: 0,
    });
  });

  it("makes paid monthly estimates reproducible from assumptions", () => {
    for (const option of blueprintContent.costs.options.slice(1)) {
      expect(option.monthlyUsd).toBe(
        option.subscriptionUsd + option.hourlyUsd * option.monthlyHours,
      );
    }
  });

  it("dates every cost source", () => {
    expect(blueprintContent.costs.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(blueprintContent.costs.sources).toHaveLength(2);
  });

  it("keeps real institutional use blocked", () => {
    expect(blueprintContent.readiness.institutional.status).toBe("blocked");
    expect(blueprintContent.readiness.demo.status).toBe("ready-when-green");
  });

  it("names every browser analysis stage in order", () => {
    expect(
      blueprintContent.architecture.browserStages.map((stage) => stage.id),
    ).toEqual(["input-policy", "pii-guard", "open-model", "explained-result"]);
  });
});
