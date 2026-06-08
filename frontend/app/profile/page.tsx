"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCustomers, getAppointments } from "../services/api";

export default function UserProfile() {
  const router = useRouter();
  
  const [customer, setCustomer] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userEmail = payload.sub;

        if (!userEmail) {
          throw new Error("Token inválido.");
        }

        // Carregar clientes para descobrir os dados completos
        const customers = await getCustomers();
        const currentCustomer = customers.find((c: any) => c.email === userEmail);

        if (!currentCustomer) {
          throw new Error("Perfil não encontrado no sistema.");
        }

        setCustomer(currentCustomer);

        // Carregar agendamentos e filtrar pelo nome do cliente (já que o DTO retorna customerName)
        const allAppointments = await getAppointments();
        const myAppointments = allAppointments.filter(
          (app: any) => app.customerName === currentCustomer.fullName
        );

        // Ordenar os mais recentes primeiro
        myAppointments.sort((a: any, b: any) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        setAppointments(myAppointments);

      } catch (err: any) {
        setError(err.message || "Erro ao carregar o seu perfil.");
        if (err.message.includes("Token")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-zinc-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 border-opacity-70"></div>
      </div>
    );
  }

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
        
        <header className="border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black text-zinc-50 tracking-tight">
            Meu <span className="text-amber-500">Perfil</span>
          </h1>
          <p className="text-zinc-400 mt-2">Bem-vindo de volta, aqui estão as informações da sua conta e agendamentos.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* EDIT INFO FORM */}
          <div className="md:col-span-2 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700"></div>
            <h2 className="text-2xl font-bold mb-6 text-zinc-50">Dados Pessoais</h2>
            
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-zinc-400 mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg outline-none cursor-not-allowed opacity-80" 
                  defaultValue={customer.fullName}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">E-mail</label>
                <input 
                  type="email" 
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg outline-none cursor-not-allowed opacity-80" 
                  defaultValue={customer.email} 
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Telemóvel</label>
                <input 
                  type="tel" 
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg outline-none cursor-not-allowed opacity-80" 
                  defaultValue={customer.phoneNumber} 
                  readOnly
                />
              </div>
              {/* Opção para atualizar perfil no futuro */}
              <div className="sm:col-span-2 pt-4">
                <p className="text-xs text-zinc-500 italic">* Por questões de segurança, para alterar os seus dados, por favor contacte a nossa equipa.</p>
              </div>
            </form>
          </div>

          {/* ACCOUNT SUMMARY CARD */}
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

        {/* RECENT HISTORY */}
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
                
                return (
                  <div key={item.id || i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-colors group relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPast ? "bg-zinc-700" : "bg-amber-500"}`}></div>
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
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${isPast ? "bg-zinc-800 text-zinc-400" : "bg-emerald-900/30 text-emerald-400 border border-emerald-800"}`}>
                        {isPast ? "Concluído" : "Agendado"}
                      </span>
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