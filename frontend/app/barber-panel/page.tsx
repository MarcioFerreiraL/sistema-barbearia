"use client";

import { useState, useEffect } from "react";
import { getAppointments, getBarbers } from "../services/api";

export default function BarberDashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barber, setBarber] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const email = payload.sub;

        const [barbersRes, apptsRes] = await Promise.all([
          getBarbers(),
          getAppointments()
        ]);

        const currentBarber = barbersRes.find((b: any) => b.email === email);
        if (currentBarber) {
          setBarber(currentBarber);
          
          // Filtrar os agendamentos apenas para este barbeiro
          const myAppointments = apptsRes.filter((app: any) => app.barberName === currentBarber.fullName);
          setAppointments(myAppointments);
        }

      } catch (e) {
        console.error("Erro ao carregar os dados do barbeiro:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div className="text-zinc-500 animate-pulse text-center py-20">A carregar a sua agenda...</div>;
  }

  if (!barber) {
    return <div className="text-red-500 text-center py-20">Erro ao identificar o seu perfil.</div>;
  }

  const todayStr = new Date().toLocaleDateString('pt-BR');
  
  // Categorizar agendamentos
  const todayAppointments = appointments.filter(app => {
    const appDate = new Date(app.startTime).toLocaleDateString('pt-BR');
    return appDate === todayStr && app.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const upcomingAppointments = appointments.filter(app => {
    const appTime = new Date(app.startTime).getTime();
    const nowTime = new Date().getTime();
    const appDate = new Date(app.startTime).toLocaleDateString('pt-BR');
    return appTime > nowTime && appDate !== todayStr && app.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const completedAppointments = appointments.filter(app => 
    app.status === 'COMPLETED'
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const renderAppointmentList = (list: any[], emptyMessage: string) => {
    if (list.length === 0) {
      return <p className="text-zinc-500 text-sm italic">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-4">
        {list.map((app, index) => {
          const d = new Date(app.startTime);
          return (
            <div key={index} className="flex justify-between items-center p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-colors">
              <div>
                <h4 className="font-bold text-zinc-900">{app.customerName}</h4>
                <p className="text-sm text-zinc-500">{app.serviceName}</p>
              </div>
              <div className="text-right">
                <span className="block font-black text-amber-500">
                  {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="block text-xs text-zinc-400 font-medium">
                  {d.toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-900 mb-2">
        Olá, <span className="text-amber-500">{barber.fullName.split(" ")[0]}</span>!
      </h1>
      <p className="text-zinc-500 mb-8">Esta é a visão geral da sua agenda.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Agendamentos de Hoje */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-900">Agenda de Hoje</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              {todayAppointments.length} Corte{todayAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>
          {renderAppointmentList(todayAppointments, "Você não tem agendamentos para hoje.")}
        </div>

        <div className="space-y-8">
          {/* Próximos Agendamentos */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Próximos Agendamentos</h2>
            {renderAppointmentList(upcomingAppointments, "Sem agendamentos futuros marcados.")}
          </div>

          {/* Histórico Recente (Concluídos) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Histórico de Cortes</h2>
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                Total: {completedAppointments.length}
              </span>
            </div>
            {renderAppointmentList(completedAppointments.slice(0, 5), "Você ainda não tem cortes concluídos.")}
            {completedAppointments.length > 5 && (
              <p className="text-xs text-center mt-4 text-zinc-400 font-medium">Mostrando os últimos 5 cortes concluídos.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
