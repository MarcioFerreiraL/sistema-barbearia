import type { AppointmentStatus } from "../../services/types";

const STATUS: Record<AppointmentStatus, { texto: string; classe: string }> = {
  SCHEDULED: { texto: "Marcado", classe: "border-anil text-anil" },
  CONFIRMED: { texto: "Confirmado", classe: "border-anil text-anil" },
  RUNNING: { texto: "Em atendimento", classe: "border-acafrao bg-acafrao text-anil" },
  COMPLETED: { texto: "Concluído", classe: "border-anil bg-anil text-cal" },
  CANCELLED: { texto: "Cancelado", classe: "border-letreiro text-letreiro-escuro line-through decoration-1" },
};

export function StatusSelo({ status }: { status: AppointmentStatus }) {
  const s = STATUS[status] ?? STATUS.SCHEDULED;
  return <span className={`inline-block rounded-full border-2 px-2.5 py-0.5 text-sm font-bold whitespace-nowrap ${s.classe}`}>{s.texto}</span>;
}

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <p role="status" className="py-16 text-center text-lg text-apagado">
      {texto}
    </p>
  );
}

export function Falha({ texto, onTentar }: { texto: string; onTentar?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border-l-4 border-letreiro bg-papel p-4">
      <p className="font-bold text-letreiro-escuro">{texto}</p>
      {onTentar && (
        <button type="button" className="btn btn-secundario mt-3" onClick={onTentar}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border-2 border-dashed border-linha p-6 text-center text-apagado">{children}</div>;
}

export function Numero({ valor, rotulo }: { valor: string | number; rotulo: string }) {
  return (
    <div className="folha p-4">
      <p className="text-3xl font-bold">{valor}</p>
      <p className="text-apagado">{rotulo}</p>
    </div>
  );
}
