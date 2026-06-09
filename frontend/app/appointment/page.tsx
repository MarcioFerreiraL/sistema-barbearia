"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getServices, getBarbers, getCustomers, createAppointment } from "../services/api";

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  durationInMinutes: number;
}

interface Barber {
  id: string;
  fullName: string;
}

interface Customer {
  id: string;
  email: string;
}

export default function Appointment() {
  const router = useRouter();
  
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de horários disponíveis (simplificado para demonstração)
  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        const userEmail = payload.sub;
        
        let role = userEmail && userEmail.toLowerCase().includes("admin") ? "ADMIN" : "CLIENT";
        if (payload.role) {
          const rawRole = payload.role.replace("ROLE_", "");
          role = rawRole === "CUSTOMER" ? "CLIENT" : rawRole;
        }

        if (role === "ADMIN") {
          router.push("/admin");
          return;
        }
        if (role === "BARBER") {
          router.push("/barber-panel");
          return;
        }

        const [fetchedServices, fetchedBarbers, fetchedCustomers] = await Promise.all([
          getServices(),
          getBarbers(),
          getCustomers(),
        ]);

        setServices(fetchedServices);
        setBarbers(fetchedBarbers);
        
        const customer = fetchedCustomers.find((c: Customer) => c.email === userEmail);
        if (customer) {
          setCustomerId(customer.id);
        } else {
          setError("Perfil de cliente não encontrado. Entre em contato com o suporte.");
        }
      } catch (err) {
        setError("Erro ao carregar dados. Verifique a sua conexão ou faça login novamente.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleSubmit = async () => {
    if (!selectedServiceId || !selectedBarberId || !selectedDate || !selectedTime) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    if (!customerId) {
      alert("Erro ao identificar o cliente. Faça login novamente.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = `${selectedDate}T${selectedTime}:00`;
      await createAppointment({
        customerId,
        barberId: selectedBarberId,
        serviceItemId: selectedServiceId,
        startTime,
      });
      alert("Agendamento confirmado com sucesso!");
      router.push("/profile"); // ou outra página de sucesso
    } catch (err: any) {
      alert(err.message || "Erro ao confirmar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-xl font-bold text-amber-500">A carregar agendamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-red-100 text-red-700 p-6 rounded-xl font-bold max-w-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 min-h-[80vh]">
      
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-zinc-50 mb-2">
          Faça seu <span className="text-amber-500">Agendamento</span>
        </h1>
        <p className="text-zinc-600">Selecione o serviço que deseja, escolha o barbeiro de sua preferência, e o melhor dia e horário para você.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulário de Seleção */}
        <div className="lg:col-span-2 space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          
          {/* Passo 1: Serviço */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <span className="bg-amber-500 text-zinc-950 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Selecione o serviço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <label 
                  key={service.id} 
                  className={`border-2 rounded-xl p-4 cursor-pointer relative transition-all ${
                    selectedServiceId === service.id ? 'border-amber-500 bg-amber-50' : 'border-zinc-200 hover:border-amber-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="service" 
                    className="hidden" 
                    checked={selectedServiceId === service.id}
                    onChange={() => setSelectedServiceId(service.id)} 
                  />
                  <div className="font-bold text-zinc-900">{service.name}</div>
                  <div className="text-sm text-zinc-500 mt-1">
                    {service.durationInMinutes >= 60 ? `${Math.floor(service.durationInMinutes / 60)}h ${service.durationInMinutes % 60 > 0 ? `${service.durationInMinutes % 60}min` : ''}` : `${service.durationInMinutes} min`} • R${service.price.toFixed(2)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Passo 2: Barbeiro */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <span className="bg-amber-500 text-zinc-950 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Escolha o Barbeiro
            </h2>
            <div className="flex flex-wrap gap-4">
              <select 
                className="w-full sm:w-1/2 p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-zinc-900"
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
              >
                <option value="" disabled>Selecione um barbeiro</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>{barber.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Passo 3: Data e Hora */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <span className="bg-amber-500 text-zinc-950 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Escolha o Dia e o Horário
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Data</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-zinc-700" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Horários</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-1 rounded-md text-sm transition-colors border ${
                        selectedTime === time 
                          ? 'bg-amber-500 text-zinc-950 font-bold border-amber-600' 
                          : 'border-zinc-200 hover:border-amber-500 text-zinc-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: Resumo da Reserva */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-lg sticky top-24">
            <h3 className="text-xl font-bold mb-6 border-b border-zinc-800 pb-4">Agendamento</h3>
            
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between">
                <span className="text-zinc-400">Serviço</span>
                <span className="font-semibold text-right">{selectedService?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Barbeiro</span>
                <span className="font-semibold text-right">{selectedBarber?.fullName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Data</span>
                <span className="font-semibold text-right">
                  {selectedDate ? selectedDate.split('-').reverse().join('/') : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Horário</span>
                <span className="font-semibold text-right">{selectedTime || "-"}</span>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 mb-8 flex justify-between items-end">
              <span className="text-zinc-400 font-medium">Total</span>
              <span className="text-3xl font-black text-amber-500">
                {selectedService ? `R$${selectedService.price.toFixed(2)}` : "R$0.00"}
              </span>
            </div>

            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedServiceId || !selectedBarberId || !selectedDate || !selectedTime}
              className="w-full bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "A confirmar..." : "Confirmar Agendamento"}
            </button>
            <p className="text-xs text-zinc-500 text-center mt-4">
              Você pode cancelar em "Meu Perfil".
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}