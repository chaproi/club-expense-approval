import { randomUUID } from "node:crypto";
import { defineConfig } from "@playwright/test";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("Set TEST_DATABASE_URL to a separate PostgreSQL test database.");
const runId = process.env.E2E_RUN_ID ?? randomUUID();
process.env.E2E_RUN_ID = runId;
const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./client/test",
  workers: 1,
  reporter: "list",
  use: { baseURL, browserName: "chromium" },
  webServer: {
    command: "npm run build && npm run db:migrate && npm start",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: databaseUrl,
      APP_ORIGIN: baseURL,
      PORT: "4173",
      DEFAULT_REVIEWER_EMAIL: `reviewer-${runId}@example.test`,
    },
  },
});
