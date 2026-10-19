import { expect, type Page } from "@playwright/test";

// Quarta-feira, 21/10/2026, 10h30 em Recife: a agenda de exemplo tem atendimento em andamento.
export const AGORA = new Date("2026-10-21T10:30:00-03:00");

export async function abrir(page: Page, caminho: string) {
  await page.clock.setFixedTime(AGORA);
  await page.goto(caminho);
}

export async function entrarComo(page: Page, perfil: "cliente" | "barbeiro" | "admin") {
  await abrir(page, "/login");
  await page.locator(`[data-demo-login="${perfil}"]`).click();
  const destino = { cliente: /\/appointment$/, barbeiro: /\/barber-panel$/, admin: /\/admin$/ }[perfil];
  await expect(page).toHaveURL(destino);
}

export async function semRolagemHorizontal(page: Page) {
  const largura = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(largura).toBeLessThanOrEqual(0);
}
