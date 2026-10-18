/** Datas no formato LocalDateTime do backend ("2026-10-21T15:00:00"), sempre no horário local. */

const dois = (n: number) => String(n).padStart(2, "0");

export function toLocal(d: Date): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}T${dois(d.getHours())}:${dois(d.getMinutes())}:00`;
}

export function parseLocal(s: string): Date {
  const [data, hora = "00:00"] = s.split("T");
  const [a, m, d] = data.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  return new Date(a, m - 1, d, h, min);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** 1 = segunda … 7 = domingo, como o DayOfWeek do Java. */
export function dayOfWeek(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}
