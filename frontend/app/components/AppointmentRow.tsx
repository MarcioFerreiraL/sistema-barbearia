import type { Appointment } from "../services/types";
import { diaCurto, hora } from "../../lib/formato";
import { StatusSelo } from "./ui/kit";

interface Props {
  ag: Appointment;
  /** Quem aparece como "com quem": o barbeiro (visão do cliente), o cliente (do barbeiro) ou os dois (da dona). */
  mostrar: "barbeiro" | "cliente" | "ambos";
  mostrarDia?: boolean;
  children?: React.ReactNode;
}

/** Uma linha de agenda: quando, o quê, com quem, status e ações. */
export default function AppointmentRow({ ag, mostrar, mostrarDia = true, children }: Props) {
  const quem =
    mostrar === "barbeiro" ? `com ${ag.barberName}` : mostrar === "cliente" ? ag.customerName : `${ag.customerName} com ${ag.barberName}`;
  return (
    <li data-agendamento={ag.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4">
      <div className="w-24 shrink-0">
        <p className="text-2xl font-bold leading-none">{hora(ag.startTime)}</p>
        {mostrarDia && <p className="mt-1 text-sm text-apagado">{diaCurto(ag.startTime)}</p>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{ag.serviceName}</p>
        <p className="text-apagado">{quem}</p>
      </div>
      <StatusSelo status={ag.status} />
      {children && <div className="flex w-full justify-end gap-2 sm:w-auto">{children}</div>}
    </li>
  );
}
