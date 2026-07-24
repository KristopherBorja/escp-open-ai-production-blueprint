import { describe, expect, it } from "vitest";
import manifest from "../../model-manifest.json";

describe("visible model contract", () => {
  it("records the licence and every required decision caveat", () => {
    expect(manifest.license).toBe("apache-2.0");
    expect(manifest.limitations).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/not educational feedback/iu),
        expect.stringMatching(/mixed and neutral nuance/iu),
        expect.stringMatching(/not calibrated certainty/iu),
        expect.stringMatching(/identity and country terms/iu),
        expect.stringMatching(/must not be used to evaluate people/iu),
      ]),
    );
  });
});
