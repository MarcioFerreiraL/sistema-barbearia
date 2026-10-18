"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServices } from "../services/api";
import type { ServiceItem } from "../services/types";
import { duracao, preco } from "../../lib/formato";

/** A tabela de preços pintada na parede: quadro anil, pontilhado até o preço. */
export default function PriceBoard({ id }: { id?: string }) {
  const [servicos, setServicos] = useState<ServiceItem[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    getServices()
      .then((s) => setServicos(s.filter((x) => x.active)))
      .catch(() => setErro(true));
  }, []);

  return (
    <section id={id} aria-labelledby="precos-titulo" className="rounded-2xl border-[6px] border-anil bg-quadro p-6 text-cal shadow-[8px_8px_0_var(--color-acafrao)] sm:p-10">
      <h2 id="precos-titulo" className="letreiro text-4xl text-papel sm:text-5xl">
        Tabela de preços
      </h2>

      {erro && <p className="mt-6">Não deu para carregar os preços agora. Recarregue a página para tentar de novo.</p>}
      {!erro && !servicos && <p className="mt-6 text-cal/80">Carregando preços…</p>}
      {servicos && servicos.length === 0 && <p className="mt-6">Nenhum serviço disponível no momento.</p>}

      {servicos && servicos.length > 0 && (
        <ul className="mt-8 space-y-6" data-price-list>
          {servicos.map((s) => (
            <li key={s.id}>
              <div className="flex items-baseline gap-3 text-xl font-bold sm:text-2xl">
                <span className="text-papel">{s.name}</span>
                <span aria-hidden="true" className="flex-1 translate-y-[-0.3em] border-b-[3px] border-dotted border-cal/40" />
                <span className="whitespace-nowrap text-acafrao">{preco(s.price)}</span>
              </div>
              <p className="mt-1 text-cal/80">
                {s.description} <span className="whitespace-nowrap">({duracao(s.durationInMinutes)})</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      <Link href="/appointment" className="btn mt-10 bg-acafrao text-anil hover:bg-papel">
        Marcar horário
      </Link>
    </section>
  );
}
