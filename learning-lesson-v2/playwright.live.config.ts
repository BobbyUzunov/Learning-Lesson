import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

if (!process.env.LIVE_CYCLE_CREDENTIALS_FILE) {
  throw new Error("Set LIVE_CYCLE_CREDENTIALS_FILE to dedicated disposable test-account credentials.");
}

// Deliberately separate from fake-auth E2E and the default test command.
export default defineConfig({
  testDir: "./integration",
  testMatch: "classroom-cycle.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  outputDir: "test-results/live-cycle",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3101",
    ...devices["Desktop Chrome"],
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Never record login credentials or session tokens in traces.
    trace: "off",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 -p 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    timeout: 60_000,
    env: { E2E_FAKE_AUTH: "0", ALLOW_E2E_FAKE_AUTH: "0" }
  }
});
