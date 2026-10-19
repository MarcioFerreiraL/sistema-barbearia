/** Formatos de exibição em pt-BR. */

export function preco(valor: number): string {
  const inteiro = Number.isInteger(Number(valor));
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: inteiro ? 0 : 2,
  });
}

export function duracao(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** "2026-10-21T15:00:00" → Date local. */
export function data(local: string): Date {
  const [d, t = "00:00"] = local.split("T");
  const [a, m, dia] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  return new Date(a, m - 1, dia, h, min);
}

export function hora(local: string): string {
  return local.slice(11, 16);
}

function maiuscula(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Qua, 21 de out" */
export function diaCurto(local: string): string {
  return maiuscula(data(local).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, ""));
}

/** "Quarta-feira, 21 de outubro" */
export function diaLongo(local: string): string {
  return maiuscula(data(local).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }));
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0];
}

export function telefone(numero: string): string {
  const n = numero.replace(/\D/g, "");
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return numero;
}
