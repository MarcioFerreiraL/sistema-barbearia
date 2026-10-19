"use client";

import { DEMO, resetDemo } from "../../services/api";

/** Faixa fixa da demo: avisa que os dados são fictícios e deixa recomeçar do zero. */
export default function DemoBar() {
  if (!DEMO) return null;

  function restaurar() {
    resetDemo();
    window.location.reload();
  }

  return (
    <div data-demo-bar className="bg-acafrao text-anil text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
        <p>
          <strong>Demonstração</strong> com dados fictícios. O que você mudar fica só no seu navegador.
        </p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={restaurar} className="font-bold underline underline-offset-2">
            Restaurar dados de exemplo
          </button>
          <a href="https://marciodev.com/projetos/barbearia" className="underline underline-offset-2">
            Sobre o projeto
          </a>
        </div>
      </div>
    </div>
  );
}
