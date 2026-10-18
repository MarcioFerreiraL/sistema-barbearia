import { describe, expect, it } from "vitest";
import { duracao, iniciais, preco, telefone } from "../../lib/formato";

describe("formato", () => {
  it("preço sem centavos quando é inteiro", () => {
    expect(preco(35).replace(/\s/g, " ")).toBe("R$ 35");
    expect(preco(27.5).replace(/\s/g, " ")).toBe("R$ 27,50");
  });
  it("duração em minutos e horas", () => {
    expect(duracao(30)).toBe("30 min");
    expect(duracao(60)).toBe("1 h");
    expect(duracao(90)).toBe("1 h 30 min");
  });
  it("iniciais do primeiro e do último nome", () => {
    expect(iniciais("Pedro Henrique Lima")).toBe("PL");
    expect(iniciais("Josué")).toBe("J");
  });
  it("telefone celular e fixo", () => {
    expect(telefone("81999069172")).toBe("(81) 99906-9172");
    expect(telefone("8133334444")).toBe("(81) 3333-4444");
  });
});

describe("datas", () => {
  it("só a primeira letra maiúscula", async () => {
    const { diaCurto, diaLongo } = await import("../../lib/formato");
    expect(diaLongo("2026-10-21T10:00:00")).toBe("Quarta-feira, 21 de outubro");
    expect(diaCurto("2026-10-21T10:00:00")).toBe("Qua, 21 de out");
  });
});
