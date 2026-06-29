"use client";

/**
 * Painel Administrativo de Gestão de Clientes
 * 
 * Permite ao administrador visualizar todos os clientes cadastrados,
 * pesquisar por nome/e-mail/telefone e monitorar seu status.
 */

import { useState, useEffect } from "react";
import { getCustomers, getAppointments } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

export default function ManageCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para pesquisa/filtragem
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const [custsRes, apptsRes] = await Promise.all([
        getCustomers(),
        getAppointments().catch(() => [])
      ]);
      setCustomers(custsRes);
      setAppointments(apptsRes);
    } catch (e: any) {
      console.error("[ADMIN CUSTOMERS] Erro ao carregar dados:", e);
      showToast("Não foi possível carregar a lista de clientes.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Conta a quantidade de agendamentos para cada cliente
  const getCustomerAppointmentCount = (customerId: string) => {
    return appointments.filter(app => app.customerId === customerId).length;
  };

  // Filtra a lista de clientes com base no termo digitado
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phoneNumber && c.phoneNumber.includes(term))
    );
  });

  return (
    <div className="text-zinc-100 space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-50">
            Gerir <span className="text-amber-500">Clientes</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Consulte a lista de clientes registados na barbearia e filtre seus registos de contacto.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs font-bold text-amber-500 w-fit">
          Total: {customers.length} Clientes
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail ou telemóvel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 pl-12 pr-4 py-3.5 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm placeholder:text-zinc-650"
          />
          {/* Ícone de lupa SVG */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Listagem de Clientes */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500 border-opacity-75"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-zinc-500 text-sm italic text-center py-20">Nenhum cliente correspondente encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/60 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Telemóvel</th>
                  <th className="px-6 py-4">Status da Conta</th>
                  <th className="px-6 py-4 text-center">Nº Visitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredCustomers.map((c) => {
                  const visits = getCustomerAppointmentCount(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-zinc-950/20 transition-colors">
                      <td className="px-6 py-5 font-bold text-zinc-100">{c.fullName}</td>
                      <td className="px-6 py-5 text-zinc-350">{c.email}</td>
                      <td className="px-6 py-5 text-zinc-400">{c.phoneNumber || <span className="text-zinc-600 font-medium italic">Não fornecido</span>}</td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          c.active 
                            ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/40" 
                            : "bg-red-950/30 text-red-400 border-red-800/40"
                        }`}>
                          {c.active ? "ATIVO" : "INATIVO"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-amber-500 text-base">{visits}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
