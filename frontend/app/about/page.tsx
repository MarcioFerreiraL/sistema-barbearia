import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "A barbearia" };

export default function ABarbearia() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="titulo text-4xl sm:text-5xl">A barbearia</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed">
        <p>
          A Mandacaru começou com uma cadeira e um espelho numa garagem do Centro de Surubim. Hoje são três cadeiras, a mesma
          tabela de preços pintada na parede e o mesmo jeito de atender: sem pressa no corte e sem espera na porta.
        </p>
        <p>
          O agendamento pelo celular veio para acabar com a fila de sábado. Você escolhe o serviço, o barbeiro e o horário,
          e o barbeiro já vê o horário na agenda dele.
        </p>
      </div>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Três cadeiras", "Josué, Rafael e Tiago, cada um com a sua agenda."],
          ["Toalha quente", "Na barba e no combo, sempre."],
          ["Sem fila", "Quem marcou é atendido na hora marcada."],
        ].map(([t, d]) => (
          <div key={t} className="folha p-5">
            <dt className="text-lg font-bold">{t}</dt>
            <dd className="mt-1 text-apagado">{d}</dd>
          </div>
        ))}
      </dl>

      <Link href="/appointment" className="btn btn-primario mt-10 text-lg">Marcar horário</Link>
    </div>
  );
}
