import { describe, expect, it } from "vitest";
import { horariosLivres, proximosDias } from "../../lib/agenda";
import type { BusinessHours } from "../../app/services/types";

const dias = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const HORAS: BusinessHours[] = dias.map((dayName, i) => ({
  dayOfWeek: i + 1, dayName, open: i < 6,
  openTime: i === 5 ? "09:00" : "08:00", closeTime: i === 5 ? "13:00" : "18:00",
}));
const QUARTA_CEDO = new Date(2026, 9, 21, 6, 0);

describe("horariosLivres", () => {
  it("de 30 em 30 minutos, terminando até o fechamento", () => {
    const h = horariosLivres({ dia: "2026-10-22", horas: HORAS, duracao: 60, agora: QUARTA_CEDO, ocupados: [] });
    expect(h[0]).toBe("08:00");
    expect(h.at(-1)).toBe("17:00");
    expect(h).toHaveLength(19);
  });

  it("dia fechado não tem horários", () => {
    expect(horariosLivres({ dia: "2026-10-25", horas: HORAS, duracao: 30, agora: QUARTA_CEDO, ocupados: [] })).toEqual([]);
  });

  it("hoje: só horários que ainda não começaram", () => {
    const h = horariosLivres({ dia: "2026-10-21", horas: HORAS, duracao: 30, agora: new Date(2026, 9, 21, 16, 10), ocupados: [] });
    expect(h).toEqual(["16:30", "17:00", "17:30"]);
  });

  it("tira horários que se sobrepõem a um ocupado", () => {
    const h = horariosLivres({
      dia: "2026-10-22", horas: HORAS, duracao: 60, agora: QUARTA_CEDO,
      ocupados: [{ startTime: "2026-10-22T10:00:00", endTime: "2026-10-22T10:30:00" }],
    });
    expect(h).not.toContain("09:30");
    expect(h).not.toContain("10:00");
    expect(h).toContain("09:00");
    expect(h).toContain("10:30");
  });
});

describe("proximosDias", () => {
  it("14 dias a partir de hoje, marcando os fechados", () => {
    const d = proximosDias(HORAS, QUARTA_CEDO, 14);
    expect(d).toHaveLength(14);
    expect(d[0]).toMatchObject({ data: "2026-10-21", fechado: false });
    expect(d[4]).toMatchObject({ data: "2026-10-25", fechado: true });
  });
});
