import { defineConfig, devices } from "@playwright/test";

// Testa o build estático da demo (npm run build:demo), servido como na Cloudflare.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3200",
    locale: "pt-BR",
    timezoneId: "America/Recife",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"] } },
    { name: "computador", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "npx serve out -l 3200 --no-port-switching",
    url: "http://localhost:3200",
    reuseExistingServer: !process.env.CI,
  },
});
