"use client";

import { cancelAppointment, getAppointments, getCustomers, getServices } from "../services/api";
import type { Appointment, Person, ServiceItem } from "../services/types";
import { useToast } from "../contexts/ToastContext";
import AppointmentRow from "../components/AppointmentRow";
import { Carregando, Falha, Numero, Vazio } from "../components/ui/kit";
import { dataISO } from "../../lib/agenda";
import { data, diaLongo, preco } from "../../lib/formato";
import { useDados } from "../../lib/useDados";

/** Ranking em barras horizontais: uma série, número escrito ao lado de cada barra. */
function Barras({ id, titulo, itens }: { id: string; titulo: string; itens: { nome: string; valor: number; detalhe?: string }[] }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <section aria-labelledby={id} className="folha p-5">
      <h2 id={id} className="text-xl font-bold">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="mt-3 text-apagado">Sem atendimentos no período.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {itens.map((i) => (
            <li key={i.nome}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold">{i.nome}</span>
                <span className="whitespace-nowrap">
                  {i.valor}
                  {i.detalhe && <span className="text-apagado"> ({i.detalhe})</span>}
                </span>
              </div>
              <div aria-hidden="true" className="mt-1.5 h-2.5 rounded-r bg-cal">
                <div className="h-full rounded-r bg-anil" style={{ width: `${(i.valor / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function PainelDaDona() {
  const { showToast } = useToast();
  const { dados, erro, recarregar } = useDados(
    () => Promise.all([getAppointments(), getCustomers(), getServices()]) as Promise<[Appointment[], Person[], ServiceItem[]]>,
  );
  const [ags, clientes, servicos] = dados ?? [null, [], []];

  async function cancelar(ag: Appointment) {
    try {
      await cancelAppointment(ag.id);
      showToast("Horário cancelado.", "success");
      recarregar();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível cancelar.", "error");
    }
  }

  if (erro) return <Falha texto={erro} onTentar={recarregar} />;
  if (!ags) return <Carregando texto="Carregando o painel…" />;

  const agora = new Date();
  const hoje = dataISO(agora);
  const inicio30 = new Date(agora.getTime() - 30 * 86_400_000);
  const preco_ = (a: Appointment) => servicos.find((s) => s.name === a.serviceName)?.price ?? 0;
  const ult30 = ags.filter((a) => a.status === "COMPLETED" && data(a.startTime) >= inicio30);
  const faturado = ult30.reduce((t, a) => t + preco_(a), 0);
  const doDia = ags.filter((a) => a.startTime.startsWith(hoje) && a.status !== "CANCELLED").sort((a, b) => a.startTime.localeCompare(b.startTime));

  const contar = (chave: (a: Appointment) => string) =>
    Object.entries(
      ult30.reduce<Record<string, { n: number; v: number }>>((g, a) => {
        const k = chave(a);
        g[k] ??= { n: 0, v: 0 };
        g[k].n += 1;
        g[k].v += preco_(a);
        return g;
      }, {}),
    )
      .map(([nome, { n, v }]) => ({ nome, valor: n, detalhe: preco(v) }))
      .sort((a, b) => b.valor - a.valor);

  return (
    <div>
      <h1 className="titulo text-4xl">Painel</h1>
      <p className="mt-2 text-lg text-apagado">{diaLongo(`${hoje}T00:00`)}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Numero valor={doDia.length} rotulo="horários hoje" />
        <Numero valor={preco(faturado)} rotulo="faturado em 30 dias" />
        <Numero valor={ult30.length ? preco(Math.round(faturado / ult30.length)) : "–"} rotulo="ticket médio" />
        <Numero valor={clientes.length} rotulo="clientes cadastrados" />
      </div>

      <section aria-labelledby="agenda-hoje" className="mt-10">
        <h2 id="agenda-hoje" className="text-2xl font-bold">Agenda de hoje</h2>
        {doDia.length === 0 ? (
          <div className="mt-4"><Vazio>Nenhum horário para hoje.</Vazio></div>
        ) : (
          <ul className="mt-2 divide-y divide-linha">
            {doDia.map((a) => (
              <AppointmentRow key={a.id} ag={a} mostrar="ambos" mostrarDia={false}>
                {a.status !== "COMPLETED" && data(a.endTime) > agora && (
                  <button type="button" className="btn btn-perigo w-full sm:w-auto" onClick={() => cancelar(a)}>
                    Cancelar
                  </button>
                )}
              </AppointmentRow>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Barras id="por-barbeiro" titulo="Atendimentos por barbeiro, últimos 30 dias" itens={contar((a) => a.barberName)} />
        <Barras id="por-servico" titulo="Serviços mais pedidos, últimos 30 dias" itens={contar((a) => a.serviceName)} />
      </div>
    </div>
  );
}
