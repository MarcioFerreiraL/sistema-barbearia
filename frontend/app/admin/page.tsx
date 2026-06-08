"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAppointments, getBarbers } from "../services/api";

interface Appointment {
  id: string;
  customerName: string;
  barberName: string;
  serviceName: string;
  startTime: string;
  status: string;
}

interface Barber {
  id: string;
  fullName: string;
  active: boolean;
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [fetchedAppointments, fetchedBarbers] = await Promise.all([
          getAppointments(),
          getBarbers()
        ]);
        
        // Pode vir nulo caso a API retorne 204 No Content
        setAppointments(fetchedAppointments || []);
        setBarbers(fetchedBarbers || []);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Calculando Estatísticas
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(app => app.startTime && app.startTime.startsWith(today));
  
  // Como o backend não retorna preço no AppointmentResponse, usaremos um valor placeholder 
  // Na vida real você buscaria o preço do serviço ou estaria incluído na resposta.
  const monthlyRevenue = "R$ " + (appointments.length * 25).toFixed(2); // Estimativa de R$25 por agendamento

  const activeBarbersCount = barbers.filter(b => b.active !== false).length;

  const stats = [
    { label: "Agendamentos de Hoje", value: todaysAppointments.length.toString(), trend: "Hoje", color: "text-amber-500" },
    { label: "Receita Estimada (Mês)", value: monthlyRevenue, trend: "Baseado em R$25/corte", color: "text-green-500" },
    { label: "Barbeiros Ativos", value: activeBarbersCount.toString(), trend: "Na equipe", color: "text-blue-500" },
  ];

  if (isLoading) {
    return <div className="max-w-7xl mx-auto py-10 px-4 text-center font-bold text-amber-500">A carregar dashboard...</div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto py-10 px-4 text-center text-red-500 font-bold bg-red-100 rounded-xl">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 space-y-8 sm:space-y-10 min-h-[80vh]">
      
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-50">Admin<span className="text-amber-500">Dashboard</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800 transition w-full sm:w-auto">Agendamento Manual</button>
          <button className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-400 transition w-full sm:w-auto">Adicionar Barbeiro</button>
        </div>
      </header>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-xs font-bold text-zinc-400">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* RECENT APPOINTMENTS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-zinc-900">Todos Agendamentos</h2>
            <Link href="#" className="text-amber-600 text-sm font-bold hover:underline">Atualizar</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Cliente</th>
                  <th className="px-4 sm:px-6 py-4">Serviço</th>
                  <th className="px-4 sm:px-6 py-4">Horário</th>
                  <th className="px-4 sm:px-6 py-4">Barbeiro</th>
                  <th className="px-4 sm:px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-zinc-500">Nenhum agendamento encontrado.</td>
                  </tr>
                ) : (
                  appointments.map((booking) => {
                    const dateObj = new Date(booking.startTime);
                    const formattedDate = dateObj.toLocaleDateString() + ' às ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <tr key={booking.id} className="hover:bg-zinc-50 transition">
                        <td className="px-4 sm:px-6 py-4 font-medium text-zinc-900">{booking.customerName || 'Cliente Indefinido'}</td>
                        <td className="px-4 sm:px-6 py-4 text-zinc-600">{booking.serviceName || 'Serviço Padrão'}</td>
                        <td className="px-4 sm:px-6 py-4 text-zinc-600">{formattedDate}</td>
                        <td className="px-4 sm:px-6 py-4 text-zinc-600">{booking.barberName}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            booking.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {booking.status || 'SCHEDULED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEAM QUICK VIEW */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6">
          <h2 className="font-bold text-lg text-zinc-900 mb-6">Barbeiros</h2>
          <div className="space-y-6">
            {barbers.length === 0 ? (
              <div className="text-zinc-500 text-sm">Nenhum barbeiro cadastrado.</div>
            ) : (
              barbers.map((barber) => (
                <div key={barber.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {barber.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{barber.fullName}</p>
                      <p className="text-xs text-zinc-500 italic">Membro da Equipe</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${barber.active !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {barber.active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}