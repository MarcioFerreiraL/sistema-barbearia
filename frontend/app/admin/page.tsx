"use client";

/**
 * Painel de Controle de Relatórios e Monitoramento (Admin Dashboard)
 * 
 * Exibe as principais métricas do negócio (receitas, volumetria)
 * e o histórico recente dos agendamentos efetuados. Permite também
 * que o administrador cancele agendamentos pendentes diretamente do dashboard.
 */

import { useState, useEffect } from "react";
import { getAppointments, getBarbers, getCustomers, getServices, cancelAppointment } from "../services/api";
import { useToast } from "../contexts/ToastContext";

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    appointments: 0,
    customers: 0,
    barbers: 0,
    services: 0,
    totalRevenue: 0
  });

  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [barberStats, setBarberStats] = useState<any[]>([]);
  const [serviceStats, setServiceStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca e processa as estatísticas e os agendamentos recentes
  const fetchStats = async () => {
    try {
      const [apptsRes, custsRes, barbersRes, servsRes] = await Promise.all([
        getAppointments().catch(() => []),
        getCustomers().catch(() => []),
        getBarbers().catch(() => []),
        getServices().catch(() => [])
      ]);

      // Calcular receita total e popular estatísticas adicionais
      let revenue = 0;
      const bStats: Record<string, number> = {};
      const sStats: Record<string, { count: number, revenue: number }> = {};

      apptsRes.forEach((app: any) => {
        // Ignora agendamentos cancelados no cálculo de receita
        if (app.status !== "CANCELLED") {
          const service = servsRes.find((s: any) => s.name === app.serviceName);
          const price = service ? parseFloat(service.price) : 0;
          revenue += price;

          if (!sStats[app.serviceName]) {
            sStats[app.serviceName] = { count: 0, revenue: 0 };
          }
          sStats[app.serviceName].count += 1;
          sStats[app.serviceName].revenue += price;
        }

        // Estatística por barbeiro
        bStats[app.barberName] = (bStats[app.barberName] || 0) + 1;
      });

      // Ordena barbeiros por quantidade de cortes
      const sortedBarbers = Object.entries(bStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Ordena serviços por popularidade
      const sortedServices = Object.entries(sStats)
        .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
        .sort((a, b) => b.count - a.count);

      // Ordena os agendamentos recentes
      const sortedAppts = [...apptsRes].sort((a: any, b: any) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ).slice(0, 8); // Aumentado para 8 itens para melhorar visualização

      setStats({
        appointments: apptsRes.length || 0,
        customers: custsRes.length || 0,
        barbers: barbersRes.length || 0,
        services: servsRes.length || 0,
        totalRevenue: revenue
      });

      setBarberStats(sortedBarbers);
      setServiceStats(sortedServices);
      setRecentAppointments(sortedAppts);

    } catch (e) {
      console.error("Erro ao carregar dados do dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  /**
   * Permite ao Administrador cancelar um agendamento direto na listagem.
   */
  const handleCancelAppointment = async (id: string) => {
    if (confirm("Deseja realmente cancelar este agendamento?")) {
      try {
        await cancelAppointment(id);
        showToast("Agendamento cancelado com sucesso!", "success");
        
        // Atualiza a listagem local e as estatísticas sem recarregar a página
        fetchStats();
      } catch (err: any) {
        showToast(err.message || "Erro ao cancelar o agendamento.", "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500 border-opacity-70"></div>
      </div>
    );
  }

  // Encontra valores máximos para as barras dos relatórios
  const maxBarberCount = Math.max(...barberStats.map(b => b.count), 1);
  const maxServiceCount = Math.max(...serviceStats.map(s => s.count), 1);

  return (
    <div className="text-zinc-100 space-y-10">
      
      {/* Título da Página */}
      <h1 className="text-3xl font-black text-zinc-50 border-b border-zinc-800 pb-4">
        Visão <span className="text-amber-500">Geral</span>
      </h1>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Receita Total</h3>
          <p className="text-2xl font-black text-emerald-400">R${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Agendamentos</h3>
          <p className="text-2xl font-black text-amber-500">{stats.appointments}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-700"></div>
          <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Clientes</h3>
          <p className="text-2xl font-black text-zinc-100">{stats.customers}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-700"></div>
          <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Barbeiros</h3>
          <p className="text-2xl font-black text-zinc-100">{stats.barbers}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-700"></div>
          <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Serviços</h3>
          <p className="text-2xl font-black text-zinc-100">{stats.services}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Relatório por Barbeiro */}
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-3">Desempenho da Equipa</h2>
          {barberStats.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">Sem dados suficientes.</p>
          ) : (
            <div className="space-y-6">
              {barberStats.map((b, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-zinc-200">{b.name}</span>
                    <span className="text-zinc-400 font-medium">{b.count} corte{b.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-3 border border-zinc-800">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-1000" 
                      style={{ width: `${(b.count / maxBarberCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Relatório por Serviços */}
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-3">Serviços Populares</h2>
          {serviceStats.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">Sem dados suficientes.</p>
          ) : (
            <div className="space-y-6">
              {serviceStats.map((s, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-zinc-200">{s.name}</span>
                    <span className="text-amber-500 font-extrabold">R${s.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-3 border border-zinc-800">
                    <div 
                      className="bg-amber-500/80 h-2.5 rounded-full transition-all duration-1000" 
                      style={{ width: `${(s.count / maxServiceCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1.5 uppercase font-bold tracking-wider">
                    {s.count} corte{s.count !== 1 ? 's' : ''} realizado{s.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Tabela de Últimos Agendamentos */}
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
        <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-3">Últimos Agendamentos</h2>
        {recentAppointments.length === 0 ? (
          <p className="text-zinc-500 text-sm italic">Nenhum agendamento registado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/60 border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-4">Data & Hora</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Serviço</th>
                  <th className="px-5 py-4">Barbeiro</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {recentAppointments.map((app, index) => {
                  const dateObj = new Date(app.startTime);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR');
                  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const isScheduled = app.status === "SCHEDULED" || app.status === "CONFIRMED";
                  
                  return (
                    <tr key={index} className="hover:bg-zinc-950/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-zinc-100">
                        {formattedDate} <span className="text-zinc-500 text-xs font-normal ml-1.5">{formattedTime}</span>
                      </td>
                      <td className="px-5 py-4 text-zinc-300 font-medium">{app.customerName}</td>
                      <td className="px-5 py-4 text-zinc-400">{app.serviceName}</td>
                      <td className="px-5 py-4 text-zinc-400">{app.barberName}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          app.status === 'SCHEDULED' ? 'bg-amber-950/30 text-amber-400 border-amber-800/40' :
                          app.status === 'COMPLETED' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40' :
                          app.status === 'CANCELLED' ? 'bg-red-950/30 text-red-400 border-red-800/40' :
                          'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}>
                          {app.status === 'SCHEDULED' ? 'AGENDADO' : app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {/* Botão de Cancelamento para Admin */}
                        {isScheduled ? (
                          <button
                            onClick={() => handleCancelAppointment(app.id)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-600 font-medium">-</span>
                        )}
                      </td>
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