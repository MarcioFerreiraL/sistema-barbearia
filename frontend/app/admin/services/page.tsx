"use client";

import { useState } from "react";
import { createService, deleteService, getServices, toggleServiceStatus, updateService } from "../../services/api";
import type { ServiceItem, ServiceRequest } from "../../services/types";
import { useToast } from "../../contexts/ToastContext";
import ConfirmButton from "../../components/ui/ConfirmButton";
import { Carregando, Falha } from "../../components/ui/kit";
import { duracao, preco } from "../../../lib/formato";
import { useDados } from "../../../lib/useDados";

const vazio: ServiceRequest = { name: "", description: "", price: 0, durationInMinutes: 30 };

function FormServico({ inicial, onSalvar, onCancelar }: { inicial: ServiceRequest; onSalvar: (d: ServiceRequest) => Promise<void>; onCancelar: () => void }) {
  const [d, setD] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  return (
    <form
      className="folha grid gap-4 p-5 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
          await onSalvar({ ...d, price: Number(d.price), durationInMinutes: Number(d.durationInMinutes) });
        } finally {
          setEnviando(false);
        }
      }}
    >
      <div className="sm:col-span-2">
        <label htmlFor="sv-nome" className="rotulo">Nome</label>
        <input id="sv-nome" className="campo" required value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="sv-desc" className="rotulo">Descrição</label>
        <input id="sv-desc" className="campo" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} />
      </div>
      <div>
        <label htmlFor="sv-preco" className="rotulo">Preço (R$)</label>
        <input id="sv-preco" type="number" inputMode="decimal" min="1" step="0.5" className="campo" required value={d.price || ""} onChange={(e) => setD({ ...d, price: Number(e.target.value) })} />
      </div>
      <div>
        <label htmlFor="sv-dur" className="rotulo">Duração (minutos)</label>
        <input id="sv-dur" type="number" min="5" step="5" className="campo" required value={d.durationInMinutes || ""} onChange={(e) => setD({ ...d, durationInMinutes: Number(e.target.value) })} />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn btn-primario" disabled={enviando}>{enviando ? "Salvando…" : "Salvar serviço"}</button>
        <button type="button" className="btn btn-secundario" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Servicos() {
  const { showToast } = useToast();
  const { dados: lista, erro, recarregar } = useDados<ServiceItem[]>(getServices);
  const [editando, setEditando] = useState<number | "novo" | null>(null);

  async function tentar(acao: () => Promise<unknown>, ok: string) {
    try {
      await acao();
      showToast(ok, "success");
      setEditando(null);
      recarregar();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
      throw err;
    }
  }

  if (erro) return <Falha texto={erro} onTentar={recarregar} />;
  if (!lista) return <Carregando />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo text-4xl">Serviços e preços</h1>
        {editando !== "novo" && <button type="button" className="btn btn-primario" onClick={() => setEditando("novo")}>Adicionar serviço</button>}
      </div>
      <p className="mt-2 text-apagado">Serviços pausados somem da tabela de preços e do agendamento, mas continuam no histórico.</p>

      {editando === "novo" && (
        <div className="mt-6">
          <FormServico inicial={vazio} onCancelar={() => setEditando(null)} onSalvar={(d) => tentar(() => createService(d), "Serviço adicionado.").catch(() => undefined)} />
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {lista.map((s) =>
          editando === s.id ? (
            <li key={s.id}>
              <FormServico
                inicial={{ name: s.name, description: s.description, price: s.price, durationInMinutes: s.durationInMinutes }}
                onCancelar={() => setEditando(null)}
                onSalvar={(d) => tentar(() => updateService(s.id, d), "Serviço atualizado.").catch(() => undefined)}
              />
            </li>
          ) : (
            <li key={s.id} data-servico={s.name} className={`folha flex flex-wrap items-center gap-x-6 gap-y-3 p-4 ${s.active ? "" : "bg-cal"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">
                  {s.name} {!s.active && <span className="ml-2 rounded-full border-2 border-apagado px-2 text-sm text-apagado">Pausado</span>}
                </p>
                <p className="text-apagado">{s.description}</p>
              </div>
              <p className="w-28 font-bold">{preco(s.price)}<span className="block text-sm font-normal text-apagado">{duracao(s.durationInMinutes)}</span></p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-secundario" onClick={() => setEditando(s.id)}>Editar</button>
                <button type="button" className="btn btn-secundario" onClick={() => tentar(() => toggleServiceStatus(s.id), s.active ? "Serviço pausado." : "Serviço reativado.").catch(() => undefined)}>
                  {s.active ? "Pausar" : "Reativar"}
                </button>
                <ConfirmButton rotulo="Excluir" confirmar="Excluir de vez" onConfirm={() => tentar(() => deleteService(s.id), "Serviço excluído.").catch(() => undefined)} />
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
