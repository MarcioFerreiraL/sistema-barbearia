import { describe, expect, it } from "vitest";
import { statusFuncionamento } from "../../lib/horario";
import type { BusinessHours } from "../../app/services/types";

const dias = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const HORAS: BusinessHours[] = dias.map((dayName, i) => ({
  dayOfWeek: i + 1,
  dayName,
  open: i < 6,
  openTime: i === 5 ? "09:00" : "08:00",
  closeTime: i === 5 ? "13:00" : "18:00",
}));

describe("statusFuncionamento", () => {
  it("aberto: diz até que horas", () => {
    expect(statusFuncionamento(HORAS, new Date(2026, 9, 21, 10, 30))).toEqual({ aberto: true, texto: "Aberto agora, até as 18:00" });
  });

  it("antes de abrir no mesmo dia", () => {
    expect(statusFuncionamento(HORAS, new Date(2026, 9, 21, 7, 0))).toEqual({ aberto: false, texto: "Fechado agora. Abre hoje às 08:00" });
  });

  it("depois de fechar: próximo dia aberto é amanhã", () => {
    expect(statusFuncionamento(HORAS, new Date(2026, 9, 21, 19, 0)).texto).toBe("Fechado agora. Abre amanhã às 08:00");
  });

  it("sábado à tarde pula o domingo fechado", () => {
    expect(statusFuncionamento(HORAS, new Date(2026, 9, 24, 14, 0)).texto).toBe("Fechado agora. Abre segunda-feira às 08:00");
  });

  it("tudo fechado", () => {
    expect(statusFuncionamento(HORAS.map((h) => ({ ...h, open: false })), new Date(2026, 9, 21, 10)).texto).toBe("Fechado no momento");
  });
});
