// @ts-check
const { defineConfig } = require("@playwright/test");

/**
 * End-to-end smoke test against a local stack:
 *  - backend on :8089 with PAYMENTS_MODE=mock and its own database
 *  - web dev server on :3009 pointed at that backend
 */
const API_PORT = 8089;
const WEB_PORT = 3009;

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 0,
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run build && npm start",
      cwd: "../tickets-backend",
      port: API_PORT,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        PORT: String(API_PORT),
        TICKETS_DB: "mongodb://localhost:27017/tickets_e2e",
        PAYMENTS_MODE: "mock",
        JWT_SECRET: "e2e-secret",
        TICKETS_BCKEND_URL: `http://localhost:${API_PORT}`,
        TICKETS_WEB_URL: `http://localhost:${WEB_PORT}`,
        NODE_ENV: "test",
      },
    },
    {
      // Production build: no cold compiles mid-test, and the same bundle the VM runs.
      command: `npx next build && npx next start -p ${WEB_PORT}`,
      port: WEB_PORT,
      reuseExistingServer: false,
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_TICKETS_BCKEND_URL: `http://localhost:${API_PORT}`,
        NODE_ENV: "production",
      },
    },
  ],
});
