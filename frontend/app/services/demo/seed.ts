/**
 * Dados de exemplo da demo. A agenda é montada em relação a "hoje", para a demo
 * sempre mostrar atendimentos passados, do dia e futuros.
 */
import type { AppointmentStatus, BusinessHours, ServiceItem } from "../types";
import { addDays, dayOfWeek, toLocal } from "./time";

export interface StoredUser {
  id: string;
  role: "CLIENT" | "BARBER" | "ADMIN";
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  active: boolean;
}

export interface StoredAppointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceItemId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
}

export interface DemoState {
  users: StoredUser[];
  services: ServiceItem[];
  hours: BusinessHours[];
  appointments: StoredAppointment[];
  nextServiceId: number;
  seq: number;
}

/** Contas de exemplo mostradas na tela de entrada (um clique por perfil). */
export const DEMO_USERS = {
  cliente: { email: "andre@mandacaru.demo", password: "demo123", label: "Cliente", name: "André Tavares" },
  barbeiro: { email: "josue@mandacaru.demo", password: "demo123", label: "Barbeiro", name: "Josué Andrade" },
  admin: { email: "socorro@mandacaru.demo", password: "demo123", label: "Dona da barbearia", name: "Socorro Melo" },
} as const;

const SERVICES: Omit<ServiceItem, "id" | "active">[] = [
  { name: "Corte", description: "Tesoura e máquina, com lavagem e finalização.", price: 35, durationInMinutes: 30 },
  { name: "Barba", description: "Toalha quente, navalha e hidratação.", price: 25, durationInMinutes: 30 },
  { name: "Corte e barba", description: "O combo completo, com toalha quente.", price: 55, durationInMinutes: 60 },
  { name: "Pezinho e sobrancelha", description: "Acabamento rápido entre um corte e outro.", price: 15, durationInMinutes: 15 },
  { name: "Corte infantil", description: "Até 10 anos, com paciência de sobra.", price: 30, durationInMinutes: 30 },
  { name: "Platinado", description: "Descoloração completa com matização.", price: 120, durationInMinutes: 120 },
];

const HOURS: BusinessHours[] = [
  { dayOfWeek: 1, dayName: "Segunda-feira", open: true, openTime: "08:00", closeTime: "18:00" },
  { dayOfWeek: 2, dayName: "Terça-feira", open: true, openTime: "08:00", closeTime: "18:00" },
  { dayOfWeek: 3, dayName: "Quarta-feira", open: true, openTime: "08:00", closeTime: "18:00" },
  { dayOfWeek: 4, dayName: "Quinta-feira", open: true, openTime: "08:00", closeTime: "18:00" },
  { dayOfWeek: 5, dayName: "Sexta-feira", open: true, openTime: "08:00", closeTime: "18:00" },
  { dayOfWeek: 6, dayName: "Sábado", open: true, openTime: "09:00", closeTime: "13:00" },
  { dayOfWeek: 7, dayName: "Domingo", open: false, openTime: "08:00", closeTime: "18:00" },
];

const CUSTOMERS = [
  "André Tavares", "Gabriel Souza", "Pedro Henrique Lima", "Matheus Araújo", "Davi Cavalcanti",
  "João Victor Silva", "Arthur Barbosa", "Enzo Torres", "Heitor Rocha", "Caio Nascimento",
];

function slug(nome: string) {
  return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(" ")[0];
}

function fone(i: number) {
  return `8199${String(1000000 + i * 7331).slice(-7)}`;
}

export function createSeed(now: Date): DemoState {
  let seq = 0;
  const id = (prefixo: string) => `${prefixo}-${String(++seq).padStart(4, "0")}`;

  const admin: StoredUser = {
    id: id("adm"), role: "ADMIN", fullName: DEMO_USERS.admin.name, email: DEMO_USERS.admin.email,
    password: DEMO_USERS.admin.password, phoneNumber: fone(0), active: true,
  };
  const barbers: StoredUser[] = [
    [DEMO_USERS.barbeiro.name, DEMO_USERS.barbeiro.email, true],
    ["Rafael Siqueira", "rafael@mandacaru.demo", true],
    ["Tiago Bezerra", "tiago@mandacaru.demo", true],
    ["Edson Lira", "edson@mandacaru.demo", false],
  ].map(([fullName, email, active], i) => ({
    id: id("bar"), role: "BARBER" as const, fullName: fullName as string, email: email as string,
    password: "demo123", phoneNumber: fone(10 + i), active: active as boolean,
  }));
  const customers: StoredUser[] = CUSTOMERS.map((fullName, i) => ({
    id: id("cli"), role: "CLIENT" as const, fullName,
    email: i === 0 ? DEMO_USERS.cliente.email : `${slug(fullName)}${i}@exemplo.com`,
    password: "demo123", phoneNumber: fone(20 + i), active: true,
  }));
  const services: ServiceItem[] = SERVICES.map((s, i) => ({ ...s, id: i + 1, active: true }));

  const appointments: StoredAppointment[] = [];
  const ativos = barbers.filter((b) => b.active);
  const andre = customers[0];
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function marcar(dia: Date, hora: number, barberId: string, customerId: string, serviceIndex: number, status?: AppointmentStatus) {
    const horario = HOURS.find((h) => h.dayOfWeek === dayOfWeek(dia))!;
    const servico = services[serviceIndex % services.length];
    const inicio = new Date(dia);
    inicio.setHours(hora, 0, 0, 0);
    const fim = new Date(inicio.getTime() + servico.durationInMinutes * 60_000);
    const [fh, fm] = horario.closeTime.split(":").map(Number);
    const [ah] = horario.openTime.split(":").map(Number);
    if (!horario.open || hora < ah || fim.getHours() * 60 + fim.getMinutes() > fh * 60 + fm) return;
    const ocupado = appointments.some(
      (a) => a.barberId === barberId && a.status !== "CANCELLED" && toLocal(inicio) < a.endTime && toLocal(fim) > a.startTime,
    );
    if (ocupado) return;
    appointments.push({
      id: id("ag"), customerId, barberId, serviceItemId: servico.id,
      startTime: toLocal(inicio), endTime: toLocal(fim),
      status: status ?? (fim <= now ? "COMPLETED" : "SCHEDULED"),
    });
  }

  // Últimas três semanas: atendimentos concluídos e alguns cancelados.
  for (let d = -21; d < 0; d++) {
    const dia = addDays(hoje, d);
    ativos.forEach((b, bi) => {
      [9, 11, 14, 16].forEach((hora, hi) => {
        if ((d + bi + hi) % 3 === 0) return;
        const cliente = customers[Math.abs(d * 3 + bi * 5 + hi) % customers.length];
        const cancelado = (d * 7 + bi + hi) % 11 === 0;
        marcar(dia, hora, b.id, cliente.id, Math.abs(d + bi + hi * 2), cancelado ? "CANCELLED" : "COMPLETED");
      });
    });
  }
  // Hoje: a agenda do Josué cheia, as dos outros pela metade.
  [8, 9, 10, 11, 14, 16].forEach((hora, i) => marcar(hoje, hora, ativos[0].id, customers[(i + 1) % customers.length].id, i));
  [9, 13, 16].forEach((hora, i) => marcar(hoje, hora, ativos[1].id, customers[(i + 4) % customers.length].id, i + 2));
  [10, 14].forEach((hora, i) => marcar(hoje, hora, ativos[2].id, customers[(i + 7) % customers.length].id, i + 1));
  // Próximos sete dias (15h fica sempre livre, para testar um agendamento novo).
  for (let d = 1; d <= 7; d++) {
    const dia = addDays(hoje, d);
    ativos.forEach((b, bi) => {
      [9, 11, 14, 16].forEach((hora, hi) => {
        if ((d + bi + hi) % 2 === 0) return;
        marcar(dia, hora, b.id, customers[1 + ((d + bi * 3 + hi) % (customers.length - 1))].id, d + hi);
      });
    });
  }
  // O cliente de exemplo: histórico e um horário marcado.
  marcar(addDays(hoje, -9), 10, ativos[1].id, andre.id, 2, "COMPLETED");
  marcar(addDays(hoje, -30), 10, ativos[0].id, andre.id, 0, "COMPLETED");
  marcar(addDays(hoje, -16), 13, ativos[2].id, andre.id, 1, "CANCELLED");
  for (let d = 2; d < 9; d++) {
    const antes = appointments.length;
    marcar(addDays(hoje, d), 10, ativos[1].id, andre.id, 2);
    if (appointments.length > antes) break;
  }

  return {
    users: [admin, ...barbers, ...customers],
    services,
    hours: HOURS.map((h) => ({ ...h })),
    appointments,
    nextServiceId: services.length + 1,
    seq,
  };
}
