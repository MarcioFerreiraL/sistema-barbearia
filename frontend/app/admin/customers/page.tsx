"use client";

import { useEffect, useMemo, useState } from "react";
import { getAppointments, getCustomers } from "../../services/api";
import type { Appointment, Person } from "../../services/types";
import { Carregando, Falha, Vazio } from "../../components/ui/kit";
import { diaCurto, telefone } from "../../../lib/formato";

function semAcento(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Person[] | null>(null);
  const [ags, setAgs] = useState<Appointment[]>([]);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    Promise.all([getCustomers(), getAppointments()])
      .then(([c, a]) => {
        setClientes(c);
        setAgs(a);
      })
      .catch((err) => setErro(err instanceof Error ? err.message : "Não foi possível carregar os clientes."));
  }, []);

  const linhas = useMemo(() => {
    if (!clientes) return [];
    const termo = semAcento(busca.trim());
    return clientes
      .filter((c) => !termo || semAcento(`${c.fullName} ${c.email} ${c.phoneNumber}`).includes(termo))
      .map((c) => {
        const feitos = ags.filter((a) => a.customerId === c.id && a.status === "COMPLETED").sort((a, b) => b.startTime.localeCompare(a.startTime));
        return { c, total: feitos.length, ultimo: feitos[0]?.startTime };
      })
      .sort((a, b) => b.total - a.total);
  }, [clientes, ags, busca]);

  if (erro) return <Falha texto={erro} />;
  if (!clientes) return <Carregando />;

  return (
    <div>
      <h1 className="titulo text-4xl">Clientes</h1>
      <p className="mt-2 text-apagado">{clientes.length} clientes cadastrados, dos mais frequentes para os menos.</p>

      <div className="mt-6 max-w-sm">
        <label htmlFor="busca" className="rotulo">Buscar por nome, e-mail ou celular</label>
        <input id="busca" type="search" className="campo" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {linhas.length === 0 ? (
        <div className="mt-6"><Vazio>Nenhum cliente encontrado para “{busca}”.</Vazio></div>
      ) : (
        <div className="folha mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left">
            <thead className="border-b border-linha text-apagado">
              <tr>
                <th scope="col" className="p-3 font-bold">Cliente</th>
                <th scope="col" className="p-3 font-bold">Celular</th>
                <th scope="col" className="p-3 text-right font-bold">Atendimentos</th>
                <th scope="col" className="p-3 font-bold">Último</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linha">
              {linhas.map(({ c, total, ultimo }) => (
                <tr key={c.id}>
                  <td className="p-3">
                    <span className="block font-bold">{c.fullName}</span>
                    <span className="block text-sm text-apagado">{c.email}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{c.phoneNumber ? telefone(c.phoneNumber) : "–"}</td>
                  <td className="p-3 text-right font-bold">{total}</td>
                  <td className="p-3 whitespace-nowrap">{ultimo ? diaCurto(ultimo) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
