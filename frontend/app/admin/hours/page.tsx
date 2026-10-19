"use client";

import { useEffect, useState } from "react";
import { getBusinessHours, updateBusinessHours } from "../../services/api";
import type { BusinessHours } from "../../services/types";
import { useToast } from "../../contexts/ToastContext";
import { Carregando, Falha } from "../../components/ui/kit";

function Dia({ inicial, onSalvo }: { inicial: BusinessHours; onSalvo: (h: BusinessHours) => void }) {
  const { showToast } = useToast();
  const [h, setH] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const mudou = h.open !== inicial.open || h.openTime !== inicial.openTime || h.closeTime !== inicial.closeTime;
  const id = `dia-${h.dayOfWeek}`;

  async function salvar() {
    setEnviando(true);
    try {
      const novo = await updateBusinessHours(h.dayOfWeek, { open: h.open, openTime: h.openTime, closeTime: h.closeTime });
      onSalvo(novo);
      showToast(`${h.dayName} salvo.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Não foi possível salvar.", "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4" data-dia={h.dayOfWeek}>
      <p id={id} className="w-36 text-lg font-bold">{h.dayName}</p>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="size-5 accent-anil" checked={h.open} onChange={(e) => setH({ ...h, open: e.target.checked })} aria-describedby={id} />
        Abre
      </label>
      {h.open ? (
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${id}-abre`}>Abre às</label>
          <input id={`${id}-abre`} type="time" step="1800" className="campo w-32" value={h.openTime} onChange={(e) => setH({ ...h, openTime: e.target.value })} />
          <span aria-hidden="true">às</span>
          <label className="sr-only" htmlFor={`${id}-fecha`}>Fecha às</label>
          <input id={`${id}-fecha`} type="time" step="1800" className="campo w-32" value={h.closeTime} onChange={(e) => setH({ ...h, closeTime: e.target.value })} />
        </div>
      ) : (
        <p className="text-apagado">Fechado</p>
      )}
      {mudou && (
        <button type="button" className="btn btn-primario ml-auto" disabled={enviando} onClick={salvar}>
          {enviando ? "Salvando…" : "Salvar"}
        </button>
      )}
    </li>
  );
}

export default function Horarios() {
  const [horas, setHoras] = useState<BusinessHours[] | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getBusinessHours()
      .then(setHoras)
      .catch((err) => setErro(err instanceof Error ? err.message : "Não foi possível carregar os horários."));
  }, []);

  if (erro) return <Falha texto={erro} />;
  if (!horas) return <Carregando />;

  return (
    <div>
      <h1 className="titulo text-4xl">Horário de funcionamento</h1>
      <p className="mt-2 max-w-xl text-apagado">Vale para o agendamento: ninguém marca fora destes horários, e o atendimento precisa terminar antes de fechar.</p>
      <ul className="folha mt-6 divide-y divide-linha px-5">
        {horas.map((h) => (
          <Dia key={`${h.dayOfWeek}-${h.open}-${h.openTime}-${h.closeTime}`} inicial={h} onSalvo={(novo) => setHoras((lista) => lista!.map((x) => (x.dayOfWeek === novo.dayOfWeek ? novo : x)))} />
        ))}
      </ul>
    </div>
  );
}
