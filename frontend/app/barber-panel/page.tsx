"use client";

import { useState } from "react";
import { cancelAppointment, completeAppointment, getAppointments, getBarbers, getServices } from "../services/api";
import type { Appointment, Person, ServiceItem } from "../services/types";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import AppointmentRow from "../components/AppointmentRow";
import { Carregando, Falha, Numero, Vazio } from "../components/ui/kit";
import { dataISO } from "../../lib/agenda";
import { data, diaLongo, preco, primeiroNome } from "../../lib/formato";
import { useDados } from "../../lib/useDados";

function saudacao(d: Date) {
  const h = d.getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function MinhaAgenda() {
  const { userId } = useAuth();
  const { showToast } = useToast();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const { dados, erro, recarregar } = useDados(
    () => Promise.all([getAppointments(), getBarbers(), getServices()]) as Promise<[Appointment[], Person[], ServiceItem[]]>,
    !!userId,
  );
  const ags = dados ? dados[0].filter((x) => x.barberId === userId) : null;
  const eu = dados?.[1].find((x) => x.id === userId) ?? null;
  const servicos = dados?.[2] ?? [];

  async function agir(ag: Appointment, acao: "concluir" | "cancelar") {
    setOcupado(ag.id);
    try {
      if (acao === "concluir") await completeAppointment(ag.id);
      else await cancelAppointment(ag.id);
      showToast(acao === "concluir" ? `Atendimento de ${primeiroNome(ag.customerName)} concluído.` : "Horário cancelado.", "success");
      recarregar();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível atualizar.", "error");
    } finally {
      setOcupado(null);
    }
  }

  if (erro) return <Falha texto={erro} onTentar={recarregar} />;
  if (!ags) return <Carregando texto="Carregando sua agenda…" />;

  const agora = new Date();
  const hoje = dataISO(agora);
  const ativo = (a: Appointment) => a.status !== "CANCELLED" && a.status !== "COMPLETED";
  const doDia = ags.filter((a) => a.startTime.startsWith(hoje) && a.status !== "CANCELLED").sort((a, b) => a.startTime.localeCompare(b.startTime));
  const proximos = ags.filter((a) => a.startTime.slice(0, 10) > hoje && ativo(a)).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const historico = ags.filter((a) => a.startTime.slice(0, 10) < hoje).sort((a, b) => b.startTime.localeCompare(a.startTime)).slice(0, 30);
  const valor = (a: Appointment) => servicos.find((s) => s.name === a.serviceName)?.price ?? 0;
  const concluidosHoje = doDia.filter((a) => a.status === "COMPLETED");
  const previsto = doDia.reduce((t, a) => t + valor(a), 0);

  const porDia = proximos.reduce<Record<string, Appointment[]>>((g, a) => {
    (g[a.startTime.slice(0, 10)] ??= []).push(a);
    return g;
  }, {});

  return (
    <div>
      <h1 className="titulo text-4xl">{saudacao(agora)}, {eu ? primeiroNome(eu.fullName) : ""}</h1>
      <p className="mt-2 text-lg text-apagado">{diaLongo(`${hoje}T00:00`)}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Numero valor={doDia.length} rotulo={doDia.length === 1 ? "atendimento hoje" : "atendimentos hoje"} />
        <Numero valor={concluidosHoje.length} rotulo="concluídos" />
        <Numero valor={preco(previsto)} rotulo="previsto no dia" />
      </div>

      <section aria-labelledby="hoje" className="mt-10">
        <h2 id="hoje" className="text-2xl font-bold">Hoje</h2>
        {doDia.length === 0 ? (
          <div className="mt-4"><Vazio>Nenhum horário marcado para hoje.</Vazio></div>
        ) : (
          <ul className="mt-2 divide-y divide-linha">
            {doDia.map((a) => {
              const comecou = data(a.startTime) <= agora;
              return (
                <AppointmentRow key={a.id} ag={a} mostrar="cliente" mostrarDia={false}>
                  {ativo(a) && comecou && (
                    <>
                      <button type="button" className="btn btn-primario flex-1 sm:flex-none" disabled={ocupado === a.id} onClick={() => agir(a, "concluir")}>
                        Concluir
                      </button>
                      <button type="button" className="btn btn-perigo flex-1 sm:flex-none" disabled={ocupado === a.id} onClick={() => agir(a, "cancelar")}>
                        Cancelar
                      </button>
                    </>
                  )}
                  {ativo(a) && !comecou && (
                    <button type="button" className="btn btn-discreto text-letreiro-escuro" disabled={ocupado === a.id} onClick={() => agir(a, "cancelar")}>
                      Cancelar horário
                    </button>
                  )}
                </AppointmentRow>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="proximos" className="mt-10">
        <h2 id="proximos" className="text-2xl font-bold">Próximos dias</h2>
        {proximos.length === 0 ? (
          <div className="mt-4"><Vazio>Nenhum horário marcado nos próximos dias.</Vazio></div>
        ) : (
          Object.entries(porDia).map(([dia, lista]) => (
            <div key={dia} className="mt-6">
              <h3 className="font-bold text-apagado">{diaLongo(`${dia}T00:00`)}</h3>
              <ul className="divide-y divide-linha">
                {lista.map((a) => (
                  <AppointmentRow key={a.id} ag={a} mostrar="cliente" mostrarDia={false}>
                    <button type="button" className="btn btn-discreto text-letreiro-escuro" disabled={ocupado === a.id} onClick={() => agir(a, "cancelar")}>
                      Cancelar horário
                    </button>
                  </AppointmentRow>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <details className="mt-10">
        <summary className="cursor-pointer text-2xl font-bold">Histórico recente</summary>
        <ul className="mt-2 divide-y divide-linha">
          {historico.map((a) => <AppointmentRow key={a.id} ag={a} mostrar="cliente" />)}
        </ul>
      </details>
    </div>
  );
}
