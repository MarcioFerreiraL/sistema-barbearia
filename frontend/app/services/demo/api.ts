/**
 * Backend da demo: as mesmas funções de services/http.ts, rodando no navegador.
 * As regras de agendamento espelham o AppointmentService do backend Spring Boot,
 * com as mesmas mensagens de erro. Os dados ficam no localStorage do visitante.
 */
import type {
  Appointment, AppointmentRequest, BusinessHours, Person, PersonRequest, ServiceItem, ServiceRequest, UserInfo,
} from "../types";
import { createSeed, DEMO_USERS, type DemoState, type StoredUser } from "./seed";
import { dayOfWeek, parseLocal, toLocal } from "./time";

export { DEMO_USERS };

const STATE_KEY = "mandacaru-demo:dados";
const SESSION_KEY = "mandacaru-demo:sessao";

interface Options {
  storage: Storage;
  now: () => Date;
}

function falha(mensagem: string): never {
  throw new Error(mensagem);
}

export function createDemoApi({ storage, now }: Options) {
  function carregar(): DemoState {
    try {
      const salvo = storage.getItem(STATE_KEY);
      if (salvo) return JSON.parse(salvo) as DemoState;
    } catch {
      // Dados corrompidos ou storage indisponível: recomeça dos dados de exemplo.
    }
    const novo = createSeed(now());
    salvar(novo);
    return novo;
  }

  function salvar(estado: DemoState) {
    try {
      storage.setItem(STATE_KEY, JSON.stringify(estado));
    } catch {
      // Sem storage (aba anônima restrita): a demo funciona só até recarregar.
    }
  }

  let estado = carregar();
  let sessaoEmMemoria: string | null = null;

  function mudar<T>(fn: (s: DemoState) => T): T {
    const r = fn(estado);
    salvar(estado);
    return r;
  }

  function sessao(): StoredUser | null {
    let userId = sessaoEmMemoria;
    try {
      userId = storage.getItem(SESSION_KEY) ?? sessaoEmMemoria;
    } catch {
      // usa a sessão em memória
    }
    return estado.users.find((u) => u.id === userId && u.active) ?? null;
  }

  function exigir(...papeis: StoredUser["role"][]): StoredUser {
    const u = sessao();
    if (!u) falha("Sessão expirada. Faça login novamente.");
    if (papeis.length && !papeis.includes(u.role)) falha("Acesso negado.");
    return u;
  }

  const novoId = (prefixo: string) => `${prefixo}-${String(++estado.seq).padStart(4, "0")}`;
  const pessoa = ({ id, fullName, email, phoneNumber, active }: StoredUser): Person => ({ id, fullName, email, phoneNumber, active });
  const daqui = (u: StoredUser["role"]) => estado.users.filter((x) => x.role === u);

  function resposta(a: DemoState["appointments"][number]): Appointment {
    const nome = (id: string) => estado.users.find((u) => u.id === id)?.fullName ?? "Removido";
    return {
      id: a.id,
      customerId: a.customerId,
      customerName: nome(a.customerId),
      barberId: a.barberId,
      barberName: nome(a.barberId),
      serviceName: estado.services.find((s) => s.id === a.serviceItemId)?.name ?? "Serviço removido",
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
    };
  }

  function acharAgendamento(id: string) {
    return estado.appointments.find((a) => a.id === id) ?? falha("Agendamento não encontrado.");
  }

  function emailLivre(email: string, exceto?: string) {
    if (estado.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== exceto)) {
      falha("Este e-mail já está cadastrado.");
    }
  }

  function validarPessoa(dados: Partial<PersonRequest>, exigirSenha: boolean) {
    if (!dados.fullName?.trim()) falha("O nome completo é obrigatório.");
    if (!dados.email?.trim()) falha("O e-mail é obrigatório.");
    if (exigirSenha && (!dados.password || dados.password.length < 6)) falha("A senha deve ter pelo menos 6 caracteres.");
  }

  function criarPessoa(role: StoredUser["role"], prefixo: string, dados: PersonRequest): Person {
    validarPessoa(dados, true);
    emailLivre(dados.email);
    return mudar((s) => {
      const u: StoredUser = {
        id: novoId(prefixo), role, fullName: dados.fullName.trim(), email: dados.email.trim(),
        password: dados.password!, phoneNumber: dados.phoneNumber ?? "", active: true,
      };
      s.users.push(u);
      return pessoa(u);
    });
  }

  function editarPessoa(id: string, role: StoredUser["role"], dados: Partial<PersonRequest>): Person {
    const u = estado.users.find((x) => x.id === id && x.role === role) ?? falha("Usuário não encontrado.");
    if (dados.email !== undefined) emailLivre(dados.email, id);
    validarPessoa({ ...u, ...dados }, false);
    return mudar(() => {
      if (dados.fullName !== undefined) u.fullName = dados.fullName.trim();
      if (dados.email !== undefined) u.email = dados.email.trim();
      if (dados.phoneNumber !== undefined) u.phoneNumber = dados.phoneNumber;
      if (dados.password) u.password = dados.password;
      return pessoa(u);
    });
  }

  return {
    /** Apaga as mudanças do visitante e volta aos dados de exemplo (mantém a sessão). */
    resetDemo() {
      estado = createSeed(now());
      salvar(estado);
    },

    async login(email: string, password: string): Promise<{ token: string }> {
      const u = estado.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password && x.active);
      if (!u) falha("E-mail ou senha incorretos.");
      sessaoEmMemoria = u.id;
      try {
        storage.setItem(SESSION_KEY, u.id);
      } catch {
        // fica só em memória
      }
      return { token: `demo.${u.id}` };
    },

    async logout(): Promise<void> {
      sessaoEmMemoria = null;
      try {
        storage.removeItem(SESSION_KEY);
      } catch {
        // nada a limpar
      }
    },

    async getMe(): Promise<UserInfo | null> {
      const u = sessao();
      return u ? { id: u.id, email: u.email, role: u.role } : null;
    },

    async registerCustomer(dados: PersonRequest): Promise<Person> {
      return criarPessoa("CLIENT", "cli", dados);
    },

    async getServices(): Promise<ServiceItem[]> {
      return estado.services.map((s) => ({ ...s }));
    },

    async getBarbers(): Promise<Person[]> {
      return daqui("BARBER").map(pessoa);
    },

    async getCustomers(): Promise<Person[]> {
      exigir("ADMIN", "BARBER");
      return daqui("CLIENT").map(pessoa);
    },

    async getCustomerById(id: string): Promise<Person> {
      const eu = exigir();
      if (eu.role === "CLIENT" && eu.id !== id) falha("Acesso negado.");
      return pessoa(daqui("CLIENT").find((c) => c.id === id) ?? falha("Cliente não encontrado com o ID fornecido."));
    },

    async getAppointments(): Promise<Appointment[]> {
      const eu = exigir();
      return estado.appointments
        .filter((a) => eu.role === "ADMIN" || (eu.role === "BARBER" ? a.barberId === eu.id : a.customerId === eu.id))
        .map(resposta);
    },

    async createAppointment(req: AppointmentRequest): Promise<Appointment> {
      const eu = exigir();
      if (eu.role === "CLIENT" && eu.id !== req.customerId) {
        falha("Acesso negado. Você não pode criar agendamentos para outros clientes.");
      }
      const cliente = daqui("CLIENT").find((c) => c.id === req.customerId) ?? falha("Cliente não encontrado.");
      const barbeiro = daqui("BARBER").find((b) => b.id === req.barberId) ?? falha("Barbeiro não encontrado.");
      const servico = estado.services.find((s) => s.id === Number(req.serviceItemId)) ?? falha("Serviço não encontrado.");

      const inicio = parseLocal(req.startTime);
      const fim = new Date(inicio.getTime() + servico.durationInMinutes * 60_000);
      if (inicio < now()) falha("Não é possível agendar um horário no passado.");
      const horario = estado.hours.find((h) => h.dayOfWeek === dayOfWeek(inicio))!;
      if (!horario.open) falha(`A barbearia não funciona aos ${horario.dayName.split("-")[0]}s.`);
      const minutos = (hhmm: string) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
      };
      const inicioMin = inicio.getHours() * 60 + inicio.getMinutes();
      if (inicioMin < minutos(horario.openTime) || inicioMin > minutos(horario.closeTime) - servico.durationInMinutes) {
        falha(`O horário selecionado está fora do horário de funcionamento configurado (${horario.openTime} às ${horario.closeTime}).`);
      }
      if (!barbeiro.active) falha("Este barbeiro não está mais ativo na empresa.");
      if (!servico.active) falha("Este serviço não está mais disponível no catálogo.");
      const [ini, fi] = [toLocal(inicio), toLocal(fim)];
      const conflito = estado.appointments.some(
        (a) => a.barberId === barbeiro.id && a.status !== "CANCELLED" && a.status !== "COMPLETED" && a.startTime < fi && a.endTime > ini,
      );
      if (conflito) falha("O barbeiro selecionado já possui um agendamento neste horário.");

      return mudar((s) => {
        const novo = {
          id: novoId("ag"), customerId: cliente.id, barberId: barbeiro.id, serviceItemId: servico.id,
          startTime: ini, endTime: fi, status: "SCHEDULED" as const,
        };
        s.appointments.push(novo);
        return resposta(novo);
      });
    },

    async cancelAppointment(id: string): Promise<void> {
      const eu = exigir();
      const a = acharAgendamento(id);
      const dono = eu.role === "ADMIN" || a.barberId === eu.id || a.customerId === eu.id;
      if (!dono) falha("Acesso negado. Você não tem permissão para acessar este agendamento.");
      if (a.status === "CANCELLED") falha("Este agendamento já se encontra cancelado.");
      if (a.status === "COMPLETED") falha("Não é possível cancelar um agendamento que já foi finalizado.");
      mudar(() => {
        a.status = "CANCELLED";
      });
    },

    async completeAppointment(id: string): Promise<void> {
      const eu = exigir();
      const a = acharAgendamento(id);
      if (eu.role !== "ADMIN" && !(eu.role === "BARBER" && a.barberId === eu.id)) {
        falha("Acesso negado. Apenas o barbeiro designado ou administradores podem concluir o serviço.");
      }
      if (a.status === "CANCELLED") falha("Não é possível finalizar um agendamento cancelado.");
      if (a.status === "COMPLETED") falha("Este agendamento já se encontra finalizado.");
      if (now() < parseLocal(a.startTime)) {
        falha(`Não é possível concluir um agendamento antes do horário marcado (${a.startTime.slice(11, 16)}). Aguarde o início do serviço.`);
      }
      mudar(() => {
        a.status = "COMPLETED";
      });
    },

    async createService(dados: ServiceRequest): Promise<ServiceItem> {
      exigir("ADMIN");
      if (!dados.name?.trim()) falha("O nome do serviço é obrigatório.");
      if (!(Number(dados.price) > 0)) falha("O preço deve ser maior que zero.");
      if (!(Number(dados.durationInMinutes) > 0)) falha("A duração deve ser maior que zero.");
      return mudar((s) => {
        const novo: ServiceItem = {
          id: s.nextServiceId++, name: dados.name.trim(), description: dados.description ?? "",
          price: Number(dados.price), durationInMinutes: Number(dados.durationInMinutes), active: true,
        };
        s.services.push(novo);
        return { ...novo };
      });
    },

    async updateService(id: number, dados: Partial<ServiceRequest>): Promise<ServiceItem> {
      exigir("ADMIN");
      const s = estado.services.find((x) => x.id === id) ?? falha("Serviço não encontrado.");
      return mudar(() => {
        if (dados.name !== undefined) s.name = dados.name;
        if (dados.description !== undefined) s.description = dados.description;
        if (dados.price !== undefined) s.price = Number(dados.price);
        if (dados.durationInMinutes !== undefined) s.durationInMinutes = Number(dados.durationInMinutes);
        return { ...s };
      });
    },

    async toggleServiceStatus(id: number): Promise<ServiceItem> {
      exigir("ADMIN");
      const s = estado.services.find((x) => x.id === id) ?? falha("Serviço não encontrado.");
      return mudar(() => {
        s.active = !s.active;
        return { ...s };
      });
    },

    async deleteService(id: number): Promise<void> {
      exigir("ADMIN");
      if (estado.appointments.some((a) => a.serviceItemId === id)) {
        falha("Este serviço tem agendamentos no histórico. Desative-o em vez de excluir.");
      }
      mudar((s) => {
        s.services = s.services.filter((x) => x.id !== id);
      });
    },

    async createBarber(dados: PersonRequest): Promise<Person> {
      exigir("ADMIN");
      return criarPessoa("BARBER", "bar", dados);
    },

    async updateBarber(id: string, dados: Partial<PersonRequest>): Promise<Person> {
      const eu = exigir("ADMIN", "BARBER");
      if (eu.role === "BARBER" && eu.id !== id) falha("Acesso negado.");
      return editarPessoa(id, "BARBER", dados);
    },

    async toggleBarberStatus(id: string): Promise<Person> {
      exigir("ADMIN");
      const b = daqui("BARBER").find((x) => x.id === id) ?? falha("Barbeiro não encontrado.");
      return mudar(() => {
        b.active = !b.active;
        return pessoa(b);
      });
    },

    async deleteBarber(id: string): Promise<void> {
      exigir("ADMIN");
      if (estado.appointments.some((a) => a.barberId === id)) {
        falha("Este barbeiro tem agendamentos no histórico. Desative-o em vez de excluir.");
      }
      mudar((s) => {
        s.users = s.users.filter((u) => u.id !== id);
      });
    },

    async updateCustomer(id: string, dados: Partial<PersonRequest>): Promise<Person> {
      const eu = exigir();
      if (eu.role === "CLIENT" && eu.id !== id) falha("Acesso negado.");
      return editarPessoa(id, "CLIENT", dados);
    },

    async getAdmins(): Promise<Person[]> {
      exigir("ADMIN");
      return daqui("ADMIN").map(pessoa);
    },

    async updateAdmin(id: string, dados: Partial<PersonRequest>): Promise<Person> {
      exigir("ADMIN");
      return editarPessoa(id, "ADMIN", dados);
    },

    async setupAdmin(dados: PersonRequest): Promise<Person> {
      exigir("ADMIN");
      return criarPessoa("ADMIN", "adm", dados);
    },

    async getBusinessHours(): Promise<BusinessHours[]> {
      return estado.hours.map((h) => ({ ...h }));
    },

    async updateBusinessHours(dia: number, dados: Pick<BusinessHours, "open" | "openTime" | "closeTime">): Promise<BusinessHours> {
      const eu = sessao();
      if (eu?.role !== "ADMIN") falha("Acesso negado. Apenas administradores têm permissão para esta ação.");
      const h = estado.hours.find((x) => x.dayOfWeek === dia) ?? falha(`Dia da semana inválido: ${dia}`);
      if (dados.open && dados.openTime >= dados.closeTime) falha("O horário de abertura deve ser antes do fechamento.");
      return mudar(() => {
        Object.assign(h, { open: dados.open, openTime: dados.openTime, closeTime: dados.closeTime });
        return { ...h };
      });
    },
  };
}

export type DemoApi = ReturnType<typeof createDemoApi>;
