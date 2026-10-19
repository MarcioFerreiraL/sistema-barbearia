import { defineConfig } from "vitest/config";

// Só os testes de unidade; os de tests/e2e são do Playwright.
export default defineConfig({
  test: { include: ["tests/unit/**/*.test.{ts,tsx}"] },
});
