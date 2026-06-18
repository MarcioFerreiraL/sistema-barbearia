"use client";

/**
 * Painel de Dashboard do Barbeiro
 * 
 * Permite ao barbeiro logado monitorar e gerenciar sua agenda diária e futura.
 * Oferece ações de conclusão (finalização) e cancelamento de agendamentos
 * de forma reativa sem refresh de página, atualizando as métricas locais instantaneamente.
 */

import { useState, useEffect } from "react";
import { getAppointments, getBarbers, cancelAppointment, completeAppointment } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { getUserInfoFromToken } from "../../lib/auth";

export default function BarberDashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barber, setBarber] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Carrega os dados do barbeiro logado e os seus agendamentos no ciclo de vida
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Recupera dados do token de forma limpa via utilitário (Clean Code: DRY)
        const userInfo = getUserInfoFromToken(token);
        const email = userInfo.email;

        if (!email) {
          throw new Error("Token sem identificador de e-mail.");
        }

        // Busca concorrente de barbeiros e agendamentos para reduzir latência
        const [barbersRes, apptsRes] = await Promise.all([
          getBarbers(),
          getAppointments()
        ]);

        const currentBarber = barbersRes.find((b: any) => b.email === email);
        if (currentBarber) {
          setBarber(currentBarber);
          
          // Filtra os agendamentos apenas para este barbeiro pelo ID (Backend já restringe a listagem)
          const myAppointments = apptsRes.filter((app: any) => app.barberId === currentBarber.id);
          setAppointments(myAppointments);
        }

      } catch (e: any) {
        console.error("[BARBER PANEL] Erro ao carregar dados da agenda:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Renderização em estado de Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-zinc-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 border-opacity-70"></div>
      </div>
    );
  }

  // Se não encontrar o barbeiro, interrompe
  if (!barber) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-zinc-950 text-red-500 font-bold">
        Erro ao identificar o seu perfil.
      </div>
    );
  }

  // Recupera string do dia atual no formato local para filtragem de agenda diária
  const todayStr = new Date().toLocaleDateString('pt-BR');
  
  // 1. Agendamentos de Hoje (não cancelados) ordenados por horário (mais cedo primeiro)
  const todayAppointments = appointments.filter(app => {
    const appDate = new Date(app.startTime).toLocaleDateString('pt-BR');
    return appDate === todayStr && app.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // 2. Próximos Agendamentos (datas futuras e horários depois de agora)
  const upcomingAppointments = appointments.filter(app => {
    const appTime = new Date(app.startTime).getTime();
    const nowTime = new Date().getTime();
    const appDate = new Date(app.startTime).toLocaleDateString('pt-BR');
    return appTime > nowTime && appDate !== todayStr && app.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // 3. Cortes Concluídos (histórico) ordenados por data decrescente (mais recente primeiro)
  const completedAppointments = appointments.filter(app => 
    app.status === 'COMPLETED'
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  /**
   * Finaliza um agendamento.
   * Modifica o status para 'COMPLETED' localmente no estado reativo (SPA).
   */
  const handleComplete = async (id: string) => {
    if (confirm("Deseja realmente marcar este agendamento como Concluído?")) {
      try {
        await completeAppointment(id);
        showToast("Agendamento finalizado com sucesso!", "success");
        
        // Atualiza estado localmente sem reload
        setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'COMPLETED' } : app));
      } catch (e: any) {
        showToast(e.message || "Erro ao concluir o agendamento.", "error");
      }
    }
  };

  /**
   * Cancela um agendamento.
   * Modifica o status para 'CANCELLED' localmente no estado reativo (SPA).
   */
  const handleCancel = async (id: string) => {
    if (confirm("Deseja realmente cancelar este agendamento?")) {
      try {
        await cancelAppointment(id);
        showToast("Agendamento cancelado com sucesso!", "success");
        
        // Atualiza estado localmente sem reload
        setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'CANCELLED' } : app));
      } catch (e: any) {
        showToast(e.message || "Erro ao cancelar o agendamento.", "error");
      }
    }
  };

  /**
   * Renderizador de lista reutilizável de agendamentos (Clean Code: DRY / SRP).
   */
  const renderAppointmentList = (list: any[], emptyMessage: string) => {
    if (list.length === 0) {
      return <p className="text-zinc-500 text-sm italic">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-4">
        {list.map((app, index) => {
          const d = new Date(app.startTime);
          const isPending = app.status !== 'CANCELLED' && app.status !== 'COMPLETED';
          return (
            <div key={app.id || index} className="flex justify-between items-center p-4 border border-zinc-800 rounded-xl bg-zinc-950 hover:border-amber-500/30 transition-colors">
              <div>
                <h4 className="font-bold text-zinc-100">{app.customerName}</h4>
                <p className="text-sm text-zinc-400">{app.serviceName}</p>
                {/* Exibe botões de ação somente se o agendamento estiver pendente */}
                {isPending && (
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleComplete(app.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/30 rounded-lg transition-colors cursor-pointer"
                    >
                      Finalizar
                    </button>
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="block font-black text-amber-500 text-base">
                  {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="block text-xs text-zinc-500 font-medium">
                  {d.toLocaleDateString('pt-BR')}
                </span>
                {/* Badges de Status */}
                {app.status === 'COMPLETED' && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded">
                    Concluído
                  </span>
                )}
                {app.status === 'CANCELLED' && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold bg-red-900/30 text-red-400 border border-red-800/50 rounded">
                    Cancelado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho de Boas-vindas */}
        <header className="border-b border-zinc-800 pb-6 mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-50 mb-2">
            Olá, <span className="text-amber-500">{barber.fullName.split(" ")[0]}</span>!
          </h1>
          <p className="text-zinc-400">Esta é a visão geral da sua agenda.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Agenda de Hoje */}
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-bold text-zinc-100">Agenda de Hoje</h2>
              <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                {todayAppointments.length} Corte{todayAppointments.length !== 1 ? 's' : ''}
              </span>
            </div>
            {renderAppointmentList(todayAppointments, "Você não tem agendamentos para hoje.")}
          </div>

          <div className="space-y-8">
            {/* Próximos Compromissos da Agenda */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
              <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-4">Próximos Agendamentos</h2>
              {renderAppointmentList(upcomingAppointments, "Sem agendamentos futuros marcados.")}
            </div>

            {/* Histórico Recente (Apenas os últimos 5) */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-bold text-zinc-100">Histórico de Cortes</h2>
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  Total: {completedAppointments.length}
                </span>
              </div>
              {renderAppointmentList(completedAppointments.slice(0, 5), "Você ainda não tem cortes concluídos.")}
              {completedAppointments.length > 5 && (
                <p className="text-xs text-center mt-4 text-zinc-500 font-medium">Mostrando os últimos 5 cortes concluídos.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
