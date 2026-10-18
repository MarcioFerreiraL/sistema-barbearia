"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelAppointment, getAppointments, getCustomerById, updateCustomer } from "../services/api";
import type { Appointment, Person } from "../services/types";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import AppointmentRow from "../components/AppointmentRow";
import PersonForm from "../components/PersonForm";
import { Carregando, Falha, Vazio } from "../components/ui/kit";
import { inicioDoPerfil } from "../../lib/perfil";
import { data, primeiroNome } from "../../lib/formato";
import { useDados } from "../../lib/useDados";

export default function MeusHorarios() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isLoggedIn, role, userId } = useAuth();
  const [cancelando, setCancelando] = useState<string | null>(null);
  const ehCliente = isLoggedIn && role === "CLIENT" && !!userId;
  const { dados, erro, recarregar } = useDados(
    () => Promise.all([getCustomerById(userId!), getAppointments()]) as Promise<[Person, Appointment[]]>,
    ehCliente,
  );
  const [eu, ags] = dados ?? [null, []];

  useEffect(() => {
    if (isLoggedIn && role && role !== "CLIENT") router.replace(inicioDoPerfil(role));
  }, [isLoggedIn, role, router]);

  async function cancelar(ag: Appointment) {
    setCancelando(ag.id);
    try {
      await cancelAppointment(ag.id);
      showToast("Horário cancelado. A vaga ficou livre para outra pessoa.", "success");
      recarregar();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível cancelar.", "error");
    } finally {
      setCancelando(null);
    }
  }

  if (erro) return <div className="mx-auto max-w-3xl px-4 py-12"><Falha texto={erro} onTentar={recarregar} /></div>;
  if (!eu) return <Carregando texto="Carregando seus horários…" />;

  const agora = new Date();
  const ativos = (a: Appointment) => a.status === "SCHEDULED" || a.status === "CONFIRMED" || a.status === "RUNNING";
  const proximos = ags.filter((a) => ativos(a) && data(a.endTime) > agora).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const historico = ags.filter((a) => !proximos.includes(a)).sort((a, b) => b.startTime.localeCompare(a.startTime));
  const cortes = ags.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <h1 className="titulo text-4xl">Olá, {primeiroNome(eu.fullName)}</h1>
      <p className="mt-2 text-lg text-apagado">
        {cortes === 0 ? "Seu primeiro corte com a gente está a um clique." : `${cortes} ${cortes === 1 ? "atendimento concluído" : "atendimentos concluídos"} com a gente.`}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <section aria-labelledby="proximos">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="proximos" className="text-2xl font-bold">Próximos horários</h2>
              <Link href="/appointment" className="btn btn-primario">Marcar horário</Link>
            </div>
            {proximos.length === 0 ? (
              <div className="mt-4"><Vazio>Nenhum horário marcado. <Link href="/appointment" className="font-bold text-anil underline">Marque o próximo corte</Link>.</Vazio></div>
            ) : (
              <ul className="mt-2 divide-y divide-linha">
                {proximos.map((a) => (
                  <AppointmentRow key={a.id} ag={a} mostrar="barbeiro">
                    <button type="button" className="btn btn-perigo w-full sm:w-auto" disabled={cancelando === a.id} onClick={() => cancelar(a)}>
                      {cancelando === a.id ? "Cancelando…" : "Cancelar"}
                    </button>
                  </AppointmentRow>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="historico">
            <h2 id="historico" className="text-2xl font-bold">Histórico</h2>
            {historico.length === 0 ? (
              <div className="mt-4"><Vazio>Seus atendimentos aparecem aqui depois do primeiro corte.</Vazio></div>
            ) : (
              <ul className="mt-2 divide-y divide-linha">
                {historico.map((a) => <AppointmentRow key={a.id} ag={a} mostrar="barbeiro" />)}
              </ul>
            )}
          </section>
        </div>

        <PersonForm
          pessoa={eu}
          salvar={async (d) => {
            await updateCustomer(eu.id, d);
            recarregar();
          }}
        />
      </div>
    </div>
  );
}
