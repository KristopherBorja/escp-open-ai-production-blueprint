import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4174",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "npm exec vite -- tests/browser/fixture --host localhost --port 4174",
    url: "http://localhost:4174",
    reuseExistingServer: process.env.CI !== "true",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
