"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAppointment, getAppointments, getBarbers, getBusinessHours, getServices } from "../services/api";
import type { Appointment, BusinessHours, Person, ServiceItem } from "../services/types";
import { useAuth } from "../contexts/AuthContext";
import { horariosLivres, proximosDias } from "../../lib/agenda";
import { diaLongo, duracao, iniciais, preco } from "../../lib/formato";
import { inicioDoPerfil } from "../../lib/perfil";

function Passo({ numero, titulo, ativo, children }: { numero: number; titulo: string; ativo: boolean; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`passo-${numero}`} className="border-t border-linha py-8">
      <h2 id={`passo-${numero}`} className="flex items-center gap-3 text-xl font-bold">
        <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full border-2 border-anil ${ativo ? "bg-anil text-cal" : "text-anil"}`}>
          {numero}
        </span>
        <span>
          <span className="sr-only">Passo {numero}: </span>
          {titulo}
        </span>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const opcao =
  "relative block cursor-pointer rounded-lg border-2 border-linha bg-papel p-4 has-[:checked]:border-anil has-[:checked]:shadow-[4px_4px_0_var(--color-acafrao)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-anil has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-cal has-[:disabled]:border-dashed";

export default function Agendar() {
  const router = useRouter();
  const { isLoggedIn, role, userId } = useAuth();

  const [servicos, setServicos] = useState<ServiceItem[]>([]);
  const [barbeiros, setBarbeiros] = useState<Person[]>([]);
  const [horas, setHoras] = useState<BusinessHours[]>([]);
  const [meus, setMeus] = useState<Appointment[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState("");

  const [servicoId, setServicoId] = useState<number | null>(null);
  const [barbeiroId, setBarbeiroId] = useState("");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [recusados, setRecusados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [marcado, setMarcado] = useState<Appointment | null>(null);
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    if (!isLoggedIn) return;
    if (role && role !== "CLIENT") {
      router.replace(inicioDoPerfil(role));
      return;
    }
    Promise.all([getServices(), getBarbers(), getBusinessHours(), getAppointments()])
      .then(([s, b, h, a]) => {
        setServicos(s.filter((x) => x.active));
        setBarbeiros(b.filter((x) => x.active));
        setHoras(h);
        setMeus(a);
      })
      .catch(() => setErroCarga("Não foi possível carregar os horários. Verifique sua conexão e recarregue a página."))
      .finally(() => setCarregando(false));
  }, [isLoggedIn, role, router]);

  const dias = useMemo(() => (horas.length ? proximosDias(horas, agora, 14) : []), [horas, agora]);
  const servico = servicos.find((s) => s.id === servicoId);
  const barbeiro = barbeiros.find((b) => b.id === barbeiroId);

  const diaEscolhido = dia || (dias.find((d) => !d.fechado)?.data ?? "");

  const livres = useMemo(() => {
    if (!servico || !barbeiro || !diaEscolhido) return [];
    // O cliente só enxerga a própria agenda; conflitos com outros clientes vêm como erro do servidor.
    const ocupados = meus.filter((a) => a.barberId === barbeiro.id && a.status !== "CANCELLED" && a.status !== "COMPLETED");
    return horariosLivres({ dia: diaEscolhido, horas, duracao: servico.durationInMinutes, agora, ocupados }).filter(
      (h) => !recusados.includes(`${barbeiro.id}|${diaEscolhido}|${h}`),
    );
  }, [servico, barbeiro, diaEscolhido, horas, agora, meus, recusados]);
  const horaOk = livres.includes(hora) ? hora : "";


  async function confirmar() {
    if (!servico || !barbeiro || !diaEscolhido || !horaOk || !userId) return;
    setErro("");
    setEnviando(true);
    try {
      const novo = await createAppointment({ customerId: userId, barberId: barbeiro.id, serviceItemId: servico.id, startTime: `${diaEscolhido}T${horaOk}:00` });
      setMarcado(novo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível marcar.";
      if (/já possui um agendamento/.test(msg)) {
        setRecusados((r) => [...r, `${barbeiro.id}|${diaEscolhido}|${horaOk}`]);
        setErro(`O horário das ${horaOk} acabou de ser ocupado. Escolha outro.`);
      } else {
        setErro(msg);
      }
      setAgora(new Date());
    } finally {
      setEnviando(false);
    }
  }

  function recomecar() {
    setMarcado(null);
    setHora("");
    setServicoId(null);
    getAppointments().then(setMeus).catch(() => undefined);
  }

  if (marcado) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16" data-confirmado>
        <div className="rounded-2xl border-4 border-anil bg-papel p-8 text-center shadow-[8px_8px_0_var(--color-acafrao)]">
          <h1 className="letreiro text-5xl text-letreiro">Tá marcado!</h1>
          <p className="mt-6 text-xl font-bold">
            {diaLongo(marcado.startTime)}, às {marcado.startTime.slice(11, 16)}
          </p>
          <p className="mt-2 text-lg">
            {marcado.serviceName} com {marcado.barberName}
          </p>
          <p className="mt-4 text-apagado">Se não puder vir, cancele em Meus horários para liberar a vaga.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/profile" className="btn btn-primario">Ver meus horários</Link>
            <button type="button" className="btn btn-secundario" onClick={recomecar}>Marcar outro</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <h1 className="titulo text-4xl">Marcar horário</h1>
      <p className="mt-2 text-lg text-apagado">Leva menos de um minuto.</p>

      {carregando && <p className="mt-10" role="status">Carregando serviços e horários…</p>}
      {erroCarga && <p role="alert" className="mt-10 font-bold text-letreiro-escuro">{erroCarga}</p>}

      {!carregando && !erroCarga && (
        <div className="mt-8 pb-28 md:pb-0">
          <Passo numero={1} titulo="Serviço" ativo>
            <fieldset>
              <legend className="sr-only">Escolha o serviço</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {servicos.map((s) => (
                  <label key={s.id} className={opcao}>
                    <input type="radio" name="servico" className="sr-only" checked={servicoId === s.id} onChange={() => setServicoId(s.id)} />
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-lg font-bold">{s.name}</span>
                      <span className="font-bold whitespace-nowrap">{preco(s.price)}</span>
                    </span>
                    <span className="mt-1 block text-apagado">{duracao(s.durationInMinutes)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Passo>

          <Passo numero={2} titulo="Barbeiro" ativo={!!servico}>
            <fieldset disabled={!servico}>
              <legend className="sr-only">Escolha o barbeiro</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {barbeiros.map((b) => (
                  <label key={b.id} className={opcao}>
                    <input type="radio" name="barbeiro" className="sr-only" checked={barbeiroId === b.id} onChange={() => setBarbeiroId(b.id)} />
                    <span className="flex items-center gap-3">
                      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-anil text-sm font-bold text-cal">
                        {iniciais(b.fullName)}
                      </span>
                      <span className="font-bold">{b.fullName}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Passo>

          <Passo numero={3} titulo="Dia e hora" ativo={!!servico && !!barbeiro}>
            <fieldset disabled={!servico || !barbeiro}>
              <legend className="sr-only">Escolha o dia</legend>
              <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2">
                {dias.map((d) => (
                  <label key={d.data} className={`${opcao} w-20 shrink-0 snap-start p-3 text-center`}>
                    <input type="radio" name="dia" className="sr-only" disabled={d.fechado} checked={diaEscolhido === d.data} onChange={() => setDia(d.data)} />
                    <span className="block text-sm capitalize">{d.date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span>
                    <span className="block text-2xl font-bold">{d.date.getDate()}</span>
                    <span className="block text-xs text-apagado">{d.fechado ? "fechado" : d.date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {servico && barbeiro && diaEscolhido && (
              <fieldset className="mt-6">
                <legend className="mb-3 font-bold">{diaLongo(`${diaEscolhido}T00:00`)}</legend>
                {livres.length === 0 ? (
                  <p className="text-apagado">Nenhum horário livre neste dia para {barbeiro.fullName.split(" ")[0]}. Tente outro dia.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" data-horarios>
                    {livres.map((h) => (
                      <label key={h} className={`${opcao} p-2 text-center font-bold`}>
                        <input type="radio" name="hora" className="sr-only" checked={horaOk === h} onChange={() => setHora(h)} />
                        {h}
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
            )}
          </Passo>

          <Passo numero={4} titulo="Confirmar" ativo={!!horaOk}>
            {servico && barbeiro && horaOk ? (
              <dl className="folha grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 p-5 text-lg">
                <dt className="text-apagado">Serviço</dt>
                <dd className="font-bold">{servico.name}, {preco(servico.price)}</dd>
                <dt className="text-apagado">Barbeiro</dt>
                <dd className="font-bold">{barbeiro.fullName}</dd>
                <dt className="text-apagado">Quando</dt>
                <dd className="font-bold">{diaLongo(`${diaEscolhido}T00:00`)}, às {horaOk}</dd>
              </dl>
            ) : (
              <p className="text-apagado">Escolha serviço, barbeiro, dia e hora para ver o resumo.</p>
            )}
            {erro && <p role="alert" className="mt-4 rounded-lg border-l-4 border-letreiro bg-papel p-3 font-bold text-letreiro-escuro">{erro}</p>}
            <button type="button" className="btn btn-primario mt-6 hidden w-full text-lg md:flex" disabled={!horaOk || enviando} onClick={confirmar}>
              {enviando ? "Marcando…" : "Confirmar horário"}
            </button>
          </Passo>
        </div>
      )}

      {!carregando && !erroCarga && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-cal/95 p-4 backdrop-blur md:hidden">
          <button type="button" className="btn btn-primario w-full text-lg" disabled={!horaOk || enviando} onClick={confirmar}>
            {enviando ? "Marcando…" : horaOk ? `Confirmar ${horaOk}` : "Escolha um horário"}
          </button>
        </div>
      )}
    </div>
  );
}
