"use client";

import { useState, useEffect } from "react";
import { getAppointments, getBarbers, getCustomers, getServices } from "../services/api";

export default function AdminDashboardPage() {
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [apptsRes, custsRes, barbersRes, servsRes] = await Promise.all([
          getAppointments().catch(() => []),
          getCustomers().catch(() => []),
          getBarbers().catch(() => []),
          getServices().catch(() => [])
        ]);

        // Calcular receita total e popular dados adicionais
        let revenue = 0;
        const bStats: Record<string, number> = {};
        const sStats: Record<string, { count: number, revenue: number }> = {};

        apptsRes.forEach((app: any) => {
          // Relatório por barbeiro
          bStats[app.barberName] = (bStats[app.barberName] || 0) + 1;
          
          // Relatório por serviço e receita
          const service = servsRes.find((s: any) => s.name === app.serviceName);
          const price = service ? parseFloat(service.price) : 0;
          revenue += price;

          if (!sStats[app.serviceName]) {
            sStats[app.serviceName] = { count: 0, revenue: 0 };
          }
          sStats[app.serviceName].count += 1;
          sStats[app.serviceName].revenue += price;
        });

        // Formatar para os gráficos (Arrays ordenados)
        const sortedBarbers = Object.entries(bStats)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        const sortedServices = Object.entries(sStats)
          .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
          .sort((a, b) => b.count - a.count);

        // Agendamentos recentes (ordem decrescente)
        const sortedAppts = [...apptsRes].sort((a: any, b: any) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ).slice(0, 5);

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
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="text-zinc-500 animate-pulse text-center py-20">Carregando relatórios...</div>;
  }

  // Encontrar valores máximos para os gráficos de barra
  const maxBarberCount = Math.max(...barberStats.map(b => b.count), 1);
  const maxServiceCount = Math.max(...serviceStats.map(s => s.count), 1);

  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-900 mb-8">
        Visão <span className="text-amber-500">Geral</span>
      </h1>

      {/* Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-2">Receita Total</h3>
          <p className="text-3xl font-black text-emerald-600">R${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-2">Agendamentos</h3>
          <p className="text-3xl font-black text-amber-500">{stats.appointments}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-2">Clientes</h3>
          <p className="text-3xl font-black text-zinc-900">{stats.customers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-2">Barbeiros</h3>
          <p className="text-3xl font-black text-zinc-900">{stats.barbers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-2">Serviços</h3>
          <p className="text-3xl font-black text-zinc-900">{stats.services}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Gráfico: Barbeiros mais requisitados */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Desempenho da Equipa</h2>
          {barberStats.length === 0 ? (
            <p className="text-zinc-500 text-sm">Sem dados suficientes.</p>
          ) : (
            <div className="space-y-6">
              {barberStats.map((b, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-zinc-900">{b.name}</span>
                    <span className="text-zinc-500 font-medium">{b.count} cortes</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-3">
                    <div 
                      className="bg-zinc-900 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${(b.count / maxBarberCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gráfico: Serviços mais populares */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Serviços Populares</h2>
          {serviceStats.length === 0 ? (
            <p className="text-zinc-500 text-sm">Sem dados suficientes.</p>
          ) : (
            <div className="space-y-6">
              {serviceStats.map((s, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-zinc-900">{s.name}</span>
                    <span className="text-amber-600 font-bold">R${s.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-3 relative">
                    <div 
                      className="bg-amber-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${(s.count / maxServiceCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">
                    {s.count} vezes realizado
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Últimos Agendamentos */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Últimos Agendamentos</h2>
        {recentAppointments.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhum agendamento registado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-4 rounded-tl-lg">Data & Hora</th>
                  <th className="px-4 py-4">Cliente</th>
                  <th className="px-4 py-4">Serviço</th>
                  <th className="px-4 py-4">Barbeiro</th>
                  <th className="px-4 py-4 text-right rounded-tr-lg">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((app, index) => {
                  const dateObj = new Date(app.startTime);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR');
                  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={index} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-zinc-900">
                        {formattedDate} <span className="text-zinc-400 ml-1">{formattedTime}</span>
                      </td>
                      <td className="px-4 py-4 text-zinc-600 font-medium">{app.customerName}</td>
                      <td className="px-4 py-4 text-zinc-600">{app.serviceName}</td>
                      <td className="px-4 py-4 text-zinc-600">{app.barberName}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          app.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                          app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-zinc-100 text-zinc-800'
                        }`}>
                          {app.status === 'SCHEDULED' ? 'AGENDADO' : app.status}
                        </span>
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