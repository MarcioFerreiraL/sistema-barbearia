import { beforeEach, describe, expect, it } from "vitest";
import { createDemoApi, DEMO_USERS, type DemoApi } from "../../app/services/demo/api";

// Quarta-feira, 10:30 (a barbearia abre 08:00–18:00 de segunda a sexta).
const AGORA = new Date(2026, 9, 21, 10, 30);

function memoria(): Storage {
  const dados = new Map<string, string>();
  return {
    get length() { return dados.size; },
    clear: () => dados.clear(),
    getItem: (k) => dados.get(k) ?? null,
    key: (i) => [...dados.keys()][i] ?? null,
    removeItem: (k) => void dados.delete(k),
    setItem: (k, v) => void dados.set(k, String(v)),
  };
}

let storage: Storage;
let api: DemoApi;

beforeEach(() => {
  storage = memoria();
  api = createDemoApi({ storage, now: () => AGORA });
});

async function entrarComo(perfil: keyof typeof DEMO_USERS) {
  await api.login(DEMO_USERS[perfil].email, DEMO_USERS[perfil].password);
  const eu = await api.getMe();
  return eu!;
}

async function agendar(hora: string, dia = "2026-10-22", extra: Record<string, unknown> = {}) {
  const eu = await api.getMe();
  const [barbeiro] = await api.getBarbers();
  const [servico] = await api.getServices();
  return api.createAppointment({
    customerId: eu!.id,
    barberId: barbeiro.id,
    serviceItemId: servico.id,
    startTime: `${dia}T${hora}:00`,
    ...extra,
  });
}

describe("sessão", () => {
  it("login com usuário de exemplo devolve token e getMe com o papel", async () => {
    const { token } = await api.login(DEMO_USERS.cliente.email, DEMO_USERS.cliente.password);
    expect(token).toBeTruthy();
    expect(await api.getMe()).toMatchObject({ email: DEMO_USERS.cliente.email, role: "CLIENT" });
  });

  it("senha errada é recusada com a mesma mensagem da API", async () => {
    await expect(api.login(DEMO_USERS.cliente.email, "errada")).rejects.toThrow("E-mail ou senha incorretos.");
  });

  it("logout encerra a sessão", async () => {
    await entrarComo("admin");
    await api.logout();
    expect(await api.getMe()).toBeNull();
  });

  it("cadastro de cliente permite entrar com o novo e-mail", async () => {
    await api.registerCustomer({ fullName: "Ana Lima", email: "ana@exemplo.com", password: "123456", phoneNumber: "81988887777" });
    await api.login("ana@exemplo.com", "123456");
    expect(await api.getMe()).toMatchObject({ role: "CLIENT" });
  });

  it("cadastro com e-mail já usado é recusado", async () => {
    await expect(
      api.registerCustomer({ fullName: "X", email: DEMO_USERS.cliente.email, password: "123456", phoneNumber: "81900000000" }),
    ).rejects.toThrow(/e-mail/i);
  });
});

describe("dados de exemplo", () => {
  it("vêm com serviços, barbeiros ativos e horário de funcionamento", async () => {
    await entrarComo("admin");
    expect((await api.getServices()).length).toBeGreaterThanOrEqual(4);
    expect((await api.getBarbers()).filter((b) => b.active).length).toBeGreaterThanOrEqual(2);
    const horas = await api.getBusinessHours();
    expect(horas).toHaveLength(7);
    expect(horas.find((h) => h.dayOfWeek === 7)?.open).toBe(false);
  });

  it("a agenda de exemplo tem atendimentos hoje, no passado e no futuro", async () => {
    await entrarComo("admin");
    const ags = await api.getAppointments();
    const hoje = "2026-10-21";
    expect(ags.some((a) => a.startTime.startsWith(hoje))).toBe(true);
    expect(ags.some((a) => a.startTime < hoje && a.status === "COMPLETED")).toBe(true);
    expect(ags.some((a) => a.startTime > `${hoje}T23:59` && a.status === "SCHEDULED")).toBe(true);
  });

  it("persiste entre instâncias e volta ao início com resetDemo", async () => {
    await entrarComo("admin");
    const [servico] = await api.getServices();
    await api.toggleServiceStatus(servico.id);
    const outra = createDemoApi({ storage, now: () => AGORA });
    expect((await outra.getServices()).find((s) => s.id === servico.id)?.active).toBe(false);
    outra.resetDemo();
    expect((await outra.getServices()).find((s) => s.id === servico.id)?.active).toBe(true);
  });
});

describe("agendamento", () => {
  beforeEach(async () => {
    await entrarComo("cliente");
  });

  it("cria agendamento com fim = início + duração e status SCHEDULED", async () => {
    const [servico] = await api.getServices();
    const ag = await agendar("15:00");
    expect(ag.status).toBe("SCHEDULED");
    expect(ag.serviceName).toBe(servico.name);
    const fim = new Date(ag.startTime);
    fim.setMinutes(fim.getMinutes() + servico.durationInMinutes);
    expect(new Date(ag.endTime).getTime()).toBe(fim.getTime());
  });

  it("recusa horário no passado", async () => {
    await expect(agendar("09:00", "2026-10-21")).rejects.toThrow("Não é possível agendar um horário no passado.");
  });

  it("recusa dia fechado", async () => {
    await expect(agendar("10:00", "2026-10-25")).rejects.toThrow("A barbearia não funciona aos Domingos.");
  });

  it("recusa início que não termina antes do fechamento", async () => {
    await expect(agendar("17:45")).rejects.toThrow(/fora do horário de funcionamento/);
  });

  it("recusa conflito com agendamento do mesmo barbeiro", async () => {
    await agendar("15:00");
    await expect(agendar("15:00")).rejects.toThrow("O barbeiro selecionado já possui um agendamento neste horário.");
  });

  it("libera o horário de um agendamento cancelado", async () => {
    const ag = await agendar("15:00");
    await api.cancelAppointment(ag.id);
    await expect(agendar("15:00")).resolves.toMatchObject({ status: "SCHEDULED" });
  });

  it("cliente não agenda em nome de outro cliente", async () => {
    await expect(agendar("15:00", "2026-10-22", { customerId: "outro" })).rejects.toThrow(/outros clientes/);
  });

  it("cliente vê só os próprios agendamentos", async () => {
    const eu = await api.getMe();
    const ags = await api.getAppointments();
    expect(ags.length).toBeGreaterThan(0);
    expect(ags.every((a) => a.customerId === eu!.id)).toBe(true);
  });

  it("recusa barbeiro inativo", async () => {
    await api.logout();
    await entrarComo("admin");
    const [barbeiro] = await api.getBarbers();
    await api.toggleBarberStatus(barbeiro.id);
    await api.logout();
    await entrarComo("cliente");
    await expect(agendar("15:00")).rejects.toThrow("Este barbeiro não está mais ativo na empresa.");
  });

  it("não cancela agendamento já cancelado", async () => {
    const ag = await agendar("15:00");
    await api.cancelAppointment(ag.id);
    await expect(api.cancelAppointment(ag.id)).rejects.toThrow("Este agendamento já se encontra cancelado.");
  });
});

describe("conclusão", () => {
  it("barbeiro conclui atendimento que já começou", async () => {
    const eu = await entrarComo("barbeiro");
    const ags = await api.getAppointments();
    expect(ags.every((a) => a.barberId === eu.id)).toBe(true);
    const iniciado = ags.find((a) => a.status === "SCHEDULED" && new Date(a.startTime) <= AGORA)!;
    await api.completeAppointment(iniciado.id);
    expect((await api.getAppointments()).find((a) => a.id === iniciado.id)?.status).toBe("COMPLETED");
  });

  it("não conclui antes do horário marcado", async () => {
    await entrarComo("barbeiro");
    const futuro = (await api.getAppointments()).find((a) => a.status === "SCHEDULED" && new Date(a.startTime) > AGORA)!;
    await expect(api.completeAppointment(futuro.id)).rejects.toThrow(/antes do horário marcado/);
  });

  it("cliente não conclui atendimento", async () => {
    await entrarComo("cliente");
    const [ag] = await api.getAppointments();
    await expect(api.completeAppointment(ag.id)).rejects.toThrow(/Apenas o barbeiro designado/);
  });
});

describe("administração", () => {
  it("não exclui serviço com histórico, mas exclui um sem agendamentos", async () => {
    await entrarComo("admin");
    const [servico] = await api.getServices();
    await expect(api.deleteService(servico.id)).rejects.toThrow(/Desative-o/);
    const novo = await api.createService({ name: "Teste", description: "", price: 10, durationInMinutes: 15 });
    await api.deleteService(novo.id);
    expect((await api.getServices()).some((s) => s.id === novo.id)).toBe(false);
  });

  it("só admin altera o horário de funcionamento", async () => {
    await entrarComo("cliente");
    await expect(api.updateBusinessHours(7, { open: true, openTime: "08:00", closeTime: "12:00" })).rejects.toThrow(/Apenas administradores/);
    await api.logout();
    await entrarComo("admin");
    await api.updateBusinessHours(7, { open: true, openTime: "08:00", closeTime: "12:00" });
    expect((await api.getBusinessHours()).find((h) => h.dayOfWeek === 7)).toMatchObject({ open: true, closeTime: "12:00" });
  });

  it("cria, edita e desativa serviço", async () => {
    await entrarComo("admin");
    const novo = await api.createService({ name: "Pigmentação", description: "Barba", price: 30, durationInMinutes: 30 });
    await api.updateService(novo.id, { price: 35 });
    await api.toggleServiceStatus(novo.id);
    expect((await api.getServices()).find((s) => s.id === novo.id)).toMatchObject({ price: 35, active: false });
  });
});
