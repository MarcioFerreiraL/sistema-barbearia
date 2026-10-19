"use client";

import { useState } from "react";
import { createBarber, deleteBarber, getAppointments, getBarbers, toggleBarberStatus, updateBarber } from "../../services/api";
import type { Appointment, Person, PersonRequest } from "../../services/types";
import { useToast } from "../../contexts/ToastContext";
import ConfirmButton from "../../components/ui/ConfirmButton";
import { Carregando, Falha } from "../../components/ui/kit";
import { iniciais, telefone } from "../../../lib/formato";
import { useDados } from "../../../lib/useDados";

function FormBarbeiro({ inicial, novo, onSalvar, onCancelar }: { inicial: PersonRequest; novo: boolean; onSalvar: (d: PersonRequest) => Promise<void>; onCancelar: () => void }) {
  const [d, setD] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const campo = (k: keyof PersonRequest) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value });
  return (
    <form
      className="folha grid gap-4 p-5 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
          await onSalvar(d.password ? d : { fullName: d.fullName, email: d.email, phoneNumber: d.phoneNumber });
        } finally {
          setEnviando(false);
        }
      }}
    >
      <div className="sm:col-span-2">
        <label htmlFor="bb-nome" className="rotulo">Nome completo</label>
        <input id="bb-nome" className="campo" required value={d.fullName} onChange={campo("fullName")} />
      </div>
      <div>
        <label htmlFor="bb-email" className="rotulo">E-mail</label>
        <input id="bb-email" type="email" className="campo" required value={d.email} onChange={campo("email")} />
      </div>
      <div>
        <label htmlFor="bb-fone" className="rotulo">Celular</label>
        <input id="bb-fone" type="tel" className="campo" value={d.phoneNumber} onChange={campo("phoneNumber")} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="bb-senha" className="rotulo">{novo ? "Senha de acesso" : "Nova senha"}</label>
        <input id="bb-senha" type="password" autoComplete="new-password" className="campo" minLength={6} required={novo} value={d.password ?? ""} onChange={campo("password")} />
        {!novo && <p className="mt-1 text-sm text-apagado">Deixe em branco para manter a senha atual.</p>}
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn btn-primario" disabled={enviando}>{enviando ? "Salvando…" : novo ? "Adicionar barbeiro" : "Salvar"}</button>
        <button type="button" className="btn btn-secundario" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Barbeiros() {
  const { showToast } = useToast();
  const { dados, erro, recarregar } = useDados(() => Promise.all([getBarbers(), getAppointments()]) as Promise<[Person[], Appointment[]]>);
  const [editando, setEditando] = useState<string | null>(null);
  const [lista, ags] = dados ?? [null, []];

  async function tentar(acao: () => Promise<unknown>, ok: string) {
    try {
      await acao();
      showToast(ok, "success");
      setEditando(null);
      recarregar();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
    }
  }

  if (erro) return <Falha texto={erro} onTentar={recarregar} />;
  if (!lista) return <Carregando />;

  const atendidos = (id: string) => ags.filter((a) => a.barberId === id && a.status === "COMPLETED").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo text-4xl">Barbeiros</h1>
        {editando !== "novo" && <button type="button" className="btn btn-primario" onClick={() => setEditando("novo")}>Adicionar barbeiro</button>}
      </div>
      <p className="mt-2 text-apagado">Barbeiro afastado não aparece para os clientes, mas o histórico dele fica guardado.</p>

      {editando === "novo" && (
        <div className="mt-6">
          <FormBarbeiro novo inicial={{ fullName: "", email: "", phoneNumber: "", password: "" }} onCancelar={() => setEditando(null)} onSalvar={(d) => tentar(() => createBarber(d), "Barbeiro adicionado.")} />
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {lista.map((b) =>
          editando === b.id ? (
            <li key={b.id}>
              <FormBarbeiro novo={false} inicial={{ fullName: b.fullName, email: b.email, phoneNumber: b.phoneNumber, password: "" }} onCancelar={() => setEditando(null)} onSalvar={(d) => tentar(() => updateBarber(b.id, d), "Dados atualizados.")} />
            </li>
          ) : (
            <li key={b.id} data-barbeiro={b.fullName} className={`folha flex flex-wrap items-center gap-x-5 gap-y-3 p-4 ${b.active ? "" : "bg-cal"}`}>
              <span aria-hidden="true" className={`grid size-12 shrink-0 place-items-center rounded-full font-bold ${b.active ? "bg-anil text-cal" : "border-2 border-apagado text-apagado"}`}>
                {iniciais(b.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">
                  {b.fullName} {!b.active && <span className="ml-2 rounded-full border-2 border-apagado px-2 text-sm text-apagado">Afastado</span>}
                </p>
                <p className="break-all text-apagado">{b.email}{b.phoneNumber && `, ${telefone(b.phoneNumber)}`}</p>
              </div>
              <p className="w-32 text-apagado"><span className="font-bold text-anil">{atendidos(b.id)}</span> atendimentos</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-secundario" onClick={() => setEditando(b.id)}>Editar</button>
                <button type="button" className="btn btn-secundario" onClick={() => tentar(() => toggleBarberStatus(b.id), b.active ? "Barbeiro afastado." : "Barbeiro de volta à agenda.")}>
                  {b.active ? "Afastar" : "Trazer de volta"}
                </button>
                <ConfirmButton rotulo="Excluir" confirmar="Excluir de vez" onConfirm={() => tentar(() => deleteBarber(b.id), "Barbeiro excluído.")} />
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
