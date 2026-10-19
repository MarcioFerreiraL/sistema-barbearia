import type { BusinessHours } from "../app/services/types";
import { diaDaSemana } from "./horario";

const dois = (n: number) => String(n).padStart(2, "0");

export function dataISO(d: Date): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function hhmm(min: number): string {
  return `${dois(Math.floor(min / 60))}:${dois(min % 60)}`;
}

/** Os próximos dias para escolher, com os dias fechados marcados. */
export function proximosDias(horas: BusinessHours[], agora: Date, quantidade: number) {
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
    const config = horas.find((h) => h.dayOfWeek === diaDaSemana(d));
    return { data: dataISO(d), date: d, fechado: !config?.open };
  });
}

interface Pedido {
  dia: string; // "2026-10-22"
  horas: BusinessHours[];
  duracao: number; // minutos
  agora: Date;
  ocupados: { startTime: string; endTime: string }[];
  passo?: number;
}

/**
 * Inícios possíveis no dia: dentro do expediente (o serviço termina até o fechamento),
 * ainda não começados e sem sobrepor um horário ocupado. Mesmas regras do backend.
 */
export function horariosLivres({ dia, horas, duracao, agora, ocupados, passo = 30 }: Pedido): string[] {
  const [a, m, d] = dia.split("-").map(Number);
  const config = horas.find((h) => h.dayOfWeek === diaDaSemana(new Date(a, m - 1, d)));
  if (!config?.open) return [];

  const ehHoje = dia === dataISO(agora);
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  const doDia = ocupados
    .filter((o) => o.startTime.startsWith(dia))
    .map((o) => [minutos(o.startTime.slice(11, 16)), minutos(o.endTime.slice(11, 16))]);

  const livres: string[] = [];
  for (let ini = minutos(config.openTime); ini + duracao <= minutos(config.closeTime); ini += passo) {
    if (ehHoje && ini < agoraMin) continue;
    const fim = ini + duracao;
    if (doDia.some(([oi, of]) => oi < fim && of > ini)) continue;
    livres.push(hhmm(ini));
  }
  return livres;
}
