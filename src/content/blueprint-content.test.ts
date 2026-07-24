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

  it("keeps labour and institutional production work outside the zero baseline", () => {
    expect(blueprintContent.costs.exclusions).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/labour/iu),
        expect.stringMatching(/institutional support/iu),
        expect.stringMatching(/legal and accessibility review/iu),
        expect.stringMatching(/custom domains/iu),
        expect.stringMatching(/monitoring/iu),
      ]),
    );
  });

  it("keeps real institutional use blocked", () => {
    expect(blueprintContent.readiness.institutional.status).toBe("blocked");
    expect(blueprintContent.readiness.demo.status).toBe("ready-when-green");
  });

  it("discloses the network metadata exposed by model downloads", () => {
    expect(blueprintContent.governance.privacyDisclosure).toMatch(
      /contacts Hugging Face/u,
    );
    expect(blueprintContent.governance.privacyDisclosure).toMatch(
      /IP address/u,
    );
  });

  it("names every browser analysis stage in order", () => {
    expect(
      blueprintContent.architecture.browserStages.map((stage) => stage.id),
    ).toEqual(["input-policy", "pii-guard", "open-model", "explained-result"]);
  });
});
