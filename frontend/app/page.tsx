"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PriceBoard from "./components/PriceBoard";
import { getBarbers, getBusinessHours } from "./services/api";
import type { BusinessHours, Person } from "./services/types";
import { statusFuncionamento, diaDaSemana } from "../lib/horario";
import { iniciais } from "../lib/formato";

export default function Home() {
  const [horas, setHoras] = useState<BusinessHours[]>([]);
  const [barbeiros, setBarbeiros] = useState<Person[] | null>(null);
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    getBusinessHours()
      .then((h) => {
        setHoras(h);
        setAgora(new Date());
      })
      .catch(() => setHoras([]));
    getBarbers().then((b) => setBarbeiros(b.filter((x) => x.active))).catch(() => setBarbeiros([]));
  }, []);

  const status = agora && horas.length ? statusFuncionamento(horas, agora) : null;
  const hoje = agora ? diaDaSemana(agora) : 0;

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 lg:grid-cols-[1.1fr_1fr] md:pt-16 md:pb-20">
        <div className="rounded-[1.75rem] border-4 border-anil bg-papel p-2">
          <div className="rounded-[1.25rem] border-2 border-anil px-3 py-8 text-center sm:px-10 sm:py-12">
            <p className="text-lg font-bold">Barbearia</p>
            <h1 className="letreiro mt-2 text-[clamp(2.5rem,11vw,6.5rem)] text-letreiro">Mandacaru</h1>
            <p className="mt-4 text-lg font-bold">Surubim, Pernambuco</p>
          </div>
        </div>

        <div>
          <p className="max-w-md text-xl leading-relaxed sm:text-2xl">
            Corte, barba e acabamento sem fila. Escolha o barbeiro, marque pelo celular e chegue na hora.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/appointment" className="btn btn-primario px-6 text-lg">
              Marcar horário
            </Link>
            <Link href="#precos" className="btn btn-secundario px-6 text-lg">
              Ver preços
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 font-bold" aria-live="polite">
            {status && (
              <>
                <span aria-hidden="true" className={`size-3 rounded-full ${status.aberto ? "bg-letreiro" : "border-2 border-apagado"}`} />
                {status.texto}
              </>
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        <PriceBoard id="precos" />
      </div>

      <section className="border-t border-linha bg-papel">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="titulo text-3xl">Quem corta</h2>
            {barbeiros === null && <p className="mt-4 text-apagado">Carregando a equipe…</p>}
            {barbeiros?.length === 0 && <p className="mt-4 text-apagado">Você escolhe o barbeiro na hora de marcar.</p>}
            {barbeiros && barbeiros.length > 0 && (
              <ul className="mt-6 space-y-4">
                {barbeiros.map((b) => (
                  <li key={b.id} className="flex items-center gap-4">
                    <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-anil font-bold text-cal">
                      {iniciais(b.fullName)}
                    </span>
                    <span className="text-lg font-bold">{b.fullName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="titulo text-3xl">Horário de funcionamento</h2>
            <table className="mt-6 w-full max-w-sm text-lg">
              <caption className="sr-only">Horário de funcionamento por dia da semana</caption>
              <tbody>
                {horas.map((h) => (
                  <tr key={h.dayOfWeek} className={`border-b border-linha ${h.dayOfWeek === hoje ? "font-bold" : ""}`}>
                    <th scope="row" className="py-2 text-left font-[inherit]">
                      {h.dayName}
                      {h.dayOfWeek === hoje && <span className="sr-only"> (hoje)</span>}
                    </th>
                    <td className="py-2 text-right">{h.open ? `${h.openTime} às ${h.closeTime}` : "Fechado"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
