import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { abrir, entrarComo, semRolagemHorizontal } from "./ajuda";

async function semViolacoesGraves(page: import("@playwright/test").Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
}

test("home mostra o letreiro, a tabela de preços e o aviso da demo", async ({ page }) => {
  await abrir(page, "/");
  await expect(page.getByRole("heading", { level: 1, name: "Mandacaru" })).toBeVisible();
  await expect(page.locator("[data-price-list] li")).toHaveCount(6);
  await expect(page.locator("[data-demo-bar]")).toContainText("dados fictícios");
  await expect(page.getByText("Aberto agora, até as 18:00")).toBeVisible();
  await semRolagemHorizontal(page);
  await semViolacoesGraves(page);
});

test("cliente marca um horário e vê em Meus horários", async ({ page }) => {
  await entrarComo(page, "cliente");
  await page.getByText("Corte e barba", { exact: true }).click();
  await page.getByText("Tiago Bezerra").click();
  const horario = page.locator("[data-horarios] label").first();
  const hora = (await horario.innerText()).trim();
  await horario.click();
  await page.getByRole("button", { name: new RegExp(`Confirmar (horário|${hora})`) }).filter({ visible: true }).click();
  await expect(page.locator("[data-confirmado]")).toContainText(`às ${hora}`);
  await semRolagemHorizontal(page);
  await page.getByRole("link", { name: "Ver meus horários" }).click();
  await expect(page.getByRole("heading", { name: "Próximos horários" })).toBeVisible();
  await expect(page.locator("main")).toContainText("com Tiago Bezerra");
});

test("tela de agendamento sem problemas de acessibilidade", async ({ page }) => {
  await entrarComo(page, "cliente");
  await page.getByText("Corte", { exact: true }).click();
  await page.getByText("Josué Andrade").click();
  await expect(page.locator("[data-horarios]")).toBeVisible();
  await semRolagemHorizontal(page);
  await semViolacoesGraves(page);
});

test("cliente cancela um horário marcado", async ({ page }) => {
  await entrarComo(page, "cliente");
  await abrir(page, "/profile");
  const proximos = page.locator("section", { has: page.getByRole("heading", { name: "Próximos horários" }) });
  const antes = await proximos.locator("li").count();
  expect(antes).toBeGreaterThan(0);
  await proximos.getByRole("button", { name: "Cancelar" }).first().click();
  await expect(page.getByText("Horário cancelado.")).toBeVisible();
  await expect(proximos.locator("li")).toHaveCount(antes - 1);
});

test("barbeiro conclui o atendimento em andamento", async ({ page }) => {
  await entrarComo(page, "barbeiro");
  await expect(page.getByRole("heading", { name: /Bom dia, Josué/ })).toBeVisible();
  const concluir = page.getByRole("button", { name: "Concluir" }).and(page.locator(":enabled")).first();
  await concluir.click();
  await expect(page.getByText(/Atendimento de .+ concluído\./)).toBeVisible();
  await semRolagemHorizontal(page);
  await semViolacoesGraves(page);
});

test("dona pausa um serviço e ele some da tabela de preços; restaurar traz de volta", async ({ page }) => {
  await entrarComo(page, "admin");
  await expect(page.getByText("faturado em 30 dias")).toBeVisible();
  await semViolacoesGraves(page);
  await page.goto("/admin/services");
  await page.locator('[data-servico="Platinado"]').getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByText("Serviço pausado.")).toBeVisible();
  await page.goto("/");
  await expect(page.locator("[data-price-list] li")).toHaveCount(5);
  await page.getByRole("button", { name: "Restaurar dados de exemplo" }).click();
  await expect(page.locator("[data-price-list] li")).toHaveCount(6);
});

test("cliente não entra no painel da dona", async ({ page }) => {
  await entrarComo(page, "cliente");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/appointment$/);
});

test("páginas internas cabem no celular", async ({ page }) => {
  await entrarComo(page, "admin");
  for (const rota of ["/admin/barbers", "/admin/services", "/admin/customers", "/admin/hours", "/admin/profile"]) {
    await page.goto(rota);
    await expect(page.locator("h1")).toBeVisible();
    await semRolagemHorizontal(page);
  }
});

test("endereço inexistente mostra a 404 da barbearia", async ({ page }) => {
  const resp = await page.goto("/nao-existe");
  expect(resp?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Essa página não existe" })).toBeVisible();
});
