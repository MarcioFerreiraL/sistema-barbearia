"use client";

/**
 * Página do Perfil do Cliente
 * 
 * Permite ao cliente logado visualizar seus dados pessoais, atualizar nome,
 * e-mail, telefone e senha, bem como gerenciar seu histórico completo
 * de agendamentos de forma interativa e sem recarregamentos (SPA).
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCustomerById, getAppointments, updateCustomer, cancelAppointment } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

export default function UserProfile() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isLoggedIn, role, userId } = useAuth();
  
  // Estados para dados locais
  const [customer, setCustomer] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para os inputs de edição do formulário
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega as informações do usuário e histórico de agendamentos
  useEffect(() => {
    async function loadProfile() {
      if (!isLoggedIn) return;

      try {
        // Se o usuário não for cliente, redireciona para a tela correta (segurança adicional)
        if (role === "ADMIN") {
          router.push("/admin");
          return;
        }
        if (role === "BARBER") {
          router.push("/barber-panel");
          return;
        }

        // Usar o ID do contexto para buscar os dados do cliente diretamente
        if (!userId) {
          throw new Error("ID do cliente não encontrado.");
        }

        const currentCustomer = await getCustomerById(userId);

        setCustomer(currentCustomer);
        setFormData({
          fullName: currentCustomer.fullName,
          email: currentCustomer.email,
          phoneNumber: currentCustomer.phoneNumber,
          password: "" // Inicia vazio por segurança
        });

        // Carrega agendamentos e filtra para exibir apenas os deste cliente (BOLA já mitigada no backend)
        const allAppointments = await getAppointments();
        const myAppointments = allAppointments.filter(
          (app: any) => app.customerId === currentCustomer.id
        );

        // Ordena os agendamentos por data de início: os mais recentes primeiro
        myAppointments.sort((a: any, b: any) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        setAppointments(myAppointments);

      } catch (err: any) {
        setError(err.message || "Erro ao carregar o seu perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router, isLoggedIn, role, userId]);

  /**
   * Monitora a digitação nos inputs do formulário.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Submete a atualização cadastral do cliente.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        ...(formData.password ? { password: formData.password } : {}) // Envia senha somente se preenchida
      };

      const updated = await updateCustomer(customer.id, payload);
      setCustomer(updated);
      setFormData(prev => ({ ...prev, password: "" })); // Limpa campo de senha pós-sucesso
      showToast("Perfil updated com sucesso!", "success");
    } catch (err: any) {
      showToast(err.message || "Erro ao atualizar o perfil.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderização em estado de Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-zinc-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 border-opacity-70"></div>
      </div>
    );
  }

  // Renderização de Erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-zinc-950 text-white">
        <p className="text-red-500 font-bold text-xl mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-amber-500 hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Cabeçalho da Página */}
        <header className="border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black text-zinc-50 tracking-tight">
            Meu <span className="text-amber-500">Perfil</span>
          </h1>
          <p className="text-zinc-400 mt-2">Bem-vindo de volta, aqui estão as informações da sua conta e agendamentos.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Formulário de Dados Pessoais */}
          <div className="md:col-span-2 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700"></div>
            <h2 className="text-2xl font-bold mb-6 text-zinc-50">Dados Pessoais</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-zinc-400 mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg outline-none focus:border-amber-500 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">E-mail</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg outline-none focus:border-amber-500 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Telemóvel</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg outline-none focus:border-amber-500 transition-colors" 
                />
              </div>
              
              <div className="sm:col-span-2 pt-4 border-t border-zinc-800">
                <label className="block text-sm font-bold text-zinc-400 mb-2">Nova Palavra-passe</label>
                <p className="text-xs text-zinc-500 mb-2">Se não pretender alterar a sua palavra-passe, deixe este campo em branco.</p>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 caracteres"
                  minLength={6}
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg outline-none focus:border-amber-500 transition-colors" 
                />
              </div>
              
              <div className="sm:col-span-2 pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "A guardar..." : "Guardar Alterações"}
                </button>
              </div>
            </form>
          </div>

          {/* Cards de Resumo Rápido */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl flex flex-col justify-center">
            <h2 className="font-bold text-zinc-50 mb-6 text-center text-xl">O Meu Resumo</h2>
            <div className="space-y-4">
              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 text-center shadow-inner">
                <p className="text-xs text-zinc-400 uppercase font-black tracking-widest mb-2">Total de Visitas</p>
                <p className="text-4xl font-black text-amber-500">{appointments.length}</p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 text-center shadow-inner">
                <p className="text-xs text-zinc-400 uppercase font-black tracking-widest mb-2">Status da Conta</p>
                <p className="text-xl font-black text-emerald-400">
                  {customer.active ? "Ativo" : "Inativo"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Histórico de Agendamentos */}
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-50">Histórico de Agendamentos</h2>
              <p className="text-sm text-zinc-400 mt-1">Os seus compromissos recentes na Barbearia</p>
            </div>
            {appointments.length > 0 && (
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full border border-zinc-700">
                {appointments.length} Registo(s)
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-10 bg-zinc-950 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 font-medium">Ainda não tem agendamentos registados.</p>
                <button 
                  onClick={() => router.push("/appointment")}
                  className="mt-4 text-amber-500 hover:text-amber-400 font-bold transition-colors"
                >
                  Faça o seu primeiro agendamento agora &rarr;
                </button>
              </div>
            ) : (
              appointments.map((item, i) => {
                const appointmentDate = new Date(item.startTime);
                const isPast = appointmentDate < new Date();
                const isCancelled = item.status === "CANCELLED";
                const isCompleted = item.status === "COMPLETED";

                let statusLabel = "Agendado";
                let statusClasses = "bg-emerald-900/30 text-emerald-400 border border-emerald-800";

                // Gerencia os estados do rótulo de status visual
                if (isCancelled) {
                  statusLabel = "Cancelado";
                  statusClasses = "bg-red-900/30 text-red-400 border border-red-800";
                } else if (isCompleted || isPast) {
                  statusLabel = "Concluído";
                  statusClasses = "bg-zinc-800 text-zinc-400 border border-zinc-700";
                }
                
                return (
                  <div key={item.id || i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-colors group relative overflow-hidden">
                    {/* Linha colorida lateral baseada no status */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCancelled ? "bg-red-500" : isCompleted || isPast ? "bg-zinc-700" : "bg-amber-500"}`}></div>
                    
                    <div className="pl-3">
                      <p className="font-bold text-zinc-100 text-lg group-hover:text-amber-500 transition-colors">{item.serviceName}</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        <span className="text-zinc-300 font-medium">
                          {appointmentDate.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                        </span> 
                        {' às '} 
                        <span className="text-zinc-300 font-medium">
                          {appointmentDate.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {' • '} 
                        Barbeiro: <span className="text-amber-500/80">{item.barberName}</span>
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-0 pl-3 sm:pl-0 flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusClasses}`}>
                        {statusLabel}
                      </span>
                      
                      {/* Exibe botão de cancelar somente se estiver ativo e for futuro */}
                      {!isCancelled && !isCompleted && !isPast && (
                        <button
                          onClick={async () => {
                            if (confirm("Deseja realmente cancelar este agendamento?")) {
                              try {
                                await cancelAppointment(item.id);
                                showToast("Agendamento cancelado com sucesso!", "success");
                                
                                // Clean Code/SPA: Atualiza o estado local para refletir na tela imediatamente (sem reload)
                                setAppointments(prev => prev.map(appt => appt.id === item.id ? { ...appt, status: "CANCELLED" } : appt));
                              } catch (err: any) {
                                showToast(err.message || "Erro ao cancelar o agendamento.", "error");
                              }
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/30 rounded-lg transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}