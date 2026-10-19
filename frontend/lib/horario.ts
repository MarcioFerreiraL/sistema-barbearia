import type { BusinessHours } from "../app/services/types";

/** 1 = segunda … 7 = domingo, como o DayOfWeek do Java. */
export function diaDaSemana(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}

function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Linha "aberto agora / abre quando" mostrada no topo da home. */
export function statusFuncionamento(horas: BusinessHours[], agora: Date): { aberto: boolean; texto: string } {
  const hoje = horas.find((h) => h.dayOfWeek === diaDaSemana(agora));
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();

  if (hoje?.open && agoraMin >= minutos(hoje.openTime) && agoraMin < minutos(hoje.closeTime)) {
    return { aberto: true, texto: `Aberto agora, até as ${hoje.closeTime}` };
  }
  if (hoje?.open && agoraMin < minutos(hoje.openTime)) {
    return { aberto: false, texto: `Fechado agora. Abre hoje às ${hoje.openTime}` };
  }
  for (let i = 1; i <= 7; i++) {
    const dia = horas.find((h) => h.dayOfWeek === ((diaDaSemana(agora) - 1 + i) % 7) + 1);
    if (dia?.open) {
      const quando = i === 1 ? "amanhã" : dia.dayName.toLowerCase();
      return { aberto: false, texto: `Fechado agora. Abre ${quando} às ${dia.openTime}` };
    }
  }
  return { aberto: false, texto: "Fechado no momento" };
}
