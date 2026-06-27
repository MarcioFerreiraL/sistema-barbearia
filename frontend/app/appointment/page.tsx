"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getServices, getBarbers, getAppointments, getBusinessHours, createAppointment } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { getUserInfoFromToken } from "../../lib/auth";

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


export default function Appointment() {
  const router = useRouter();
  const { showToast } = useToast();
  
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

  const [dates, setDates] = useState<{ dateString: string; dayName: string; dayNumber: string; isClosed: boolean }[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);

  // Lista de horários disponíveis (simplificado para demonstração)
  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  useEffect(() => {
    if (businessHours.length === 0) return;

    const generateDates = () => {
      const datesList = [];
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const dayName = dayNames[nextDate.getDay()];
        const dayNumber = String(nextDate.getDate());
        
        const jsDay = nextDate.getDay();
        const apiDayOfWeek = jsDay === 0 ? 7 : jsDay;
        
        const dayConfig = businessHours.find(h => h.dayOfWeek === apiDayOfWeek);
        const isClosed = dayConfig ? !dayConfig.open : (jsDay === 0);
        
        datesList.push({ dateString, dayName, dayNumber, isClosed });
      }
      return datesList;
    };

    const generated = generateDates();
    setDates(generated);
    
    const currentSelectedClosed = generated.find(d => d.dateString === selectedDate)?.isClosed;
    if (!selectedDate || currentSelectedClosed) {
      const firstOpen = generated.find(d => !d.isClosed);
      if (firstOpen) {
        setSelectedDate(firstOpen.dateString);
      }
    }
  }, [businessHours, selectedDate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userInfo = getUserInfoFromToken(token);

        if (userInfo.role === "ADMIN") {
          router.push("/admin");
          return;
        }
        if (userInfo.role === "BARBER") {
          router.push("/barber-panel");
          return;
        }

        if (!userInfo.id) {
          setError("Perfil de cliente não encontrado. Entre em contato com o suporte.");
          return;
        }

        setCustomerId(userInfo.id);

        const [fetchedServices, fetchedBarbers, fetchedAppointments, fetchedHours] = await Promise.all([
          getServices(),
          getBarbers(),
          getAppointments(),
          getBusinessHours(),
        ]);

        setServices(fetchedServices);
        setBarbers(fetchedBarbers);
        setAppointments(fetchedAppointments);
        setBusinessHours(fetchedHours);
      } catch (err: any) {
        if (err.message === "Unauthorized" || !localStorage.getItem("token")) {
          return;
        }
        setError("Erro ao carregar dados. Verifique a sua conexão ou faça login novamente.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const getFilteredTimes = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let times: string[] = [];

    // 1. Gera os horários com base nas configurações da base de dados para o dia da semana selecionado
    if (selectedDate && businessHours.length > 0) {
      const dateObj = new Date(selectedDate + "T00:00:00");
      const jsDay = dateObj.getDay();
      const apiDayOfWeek = jsDay === 0 ? 7 : jsDay;
      const dayConfig = businessHours.find(h => h.dayOfWeek === apiDayOfWeek);
      
      if (dayConfig && dayConfig.open) {
        const [openHour] = dayConfig.openTime.split(":").map(Number);
        const [closeHour] = dayConfig.closeTime.split(":").map(Number);
        
        for (let hour = openHour; hour < closeHour; hour++) {
          times.push(`${String(hour).padStart(2, '0')}:00`);
        }
      }
    } else {
      times = [...availableTimes];
    }

    // 2. Filtra horários que já estão ocupados para o barbeiro selecionado neste dia
    if (selectedBarberId && selectedDate && appointments.length > 0) {
      const selectedBarber = barbers.find(b => b.id === selectedBarberId);
      if (selectedBarber) {
        const bookedTimes = appointments
          .filter((appt: any) => {
            if (appt.status === "CANCELLED") return false;
            if (appt.barberName !== selectedBarber.fullName) return false;
            const apptDate = appt.startTime.split("T")[0];
            return apptDate === selectedDate;
          })
          .map((appt: any) => {
            const timePart = appt.startTime.split("T")[1];
            const [hour, min] = timePart.split(":");
            return `${hour}:${min}`;
          });
        
        times = times.filter(t => !bookedTimes.includes(t));
      }
    }
    
    // 3. Se for hoje, remove horários que já passaram
    if (selectedDate === todayStr) {
      const currentHour = today.getHours();
      const currentMin = today.getMinutes();
      return times.filter((time) => {
        const [hour, min] = time.split(":").map(Number);
        return hour > currentHour || (hour === currentHour && min > currentMin);
      });
    }
    return times;
  };

  const handleBarberChange = async (barberId: string) => {
    setSelectedBarberId(barberId);
    setSelectedTime("");
    try {
      const latestAppts = await getAppointments();
      setAppointments(latestAppts);
    } catch (e) {
      console.error("Erro ao buscar agendamentos atualizados:", e);
    }
  };

  const handleSubmit = async () => {
    if (!selectedServiceId || !selectedBarberId || !selectedDate || !selectedTime) {
      showToast("Por favor, preencha todos os campos.", "error");
      return;
    }
    if (!customerId) {
      showToast("Erro ao identificar o cliente. Faça login novamente.", "error");
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
      showToast("Agendamento confirmado com sucesso!", "success");
      router.push("/profile"); // ou outra página de sucesso
    } catch (err: any) {
      showToast(err.message || "Erro ao confirmar agendamento.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedBarber = barbers.find((b) => b.id === selectedBarberId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-zinc-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 border-opacity-70"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-zinc-950 text-zinc-100">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl font-bold max-w-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto py-12 px-4">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-50 mb-2">
            Faça seu <span className="text-amber-500">Agendamento</span>
          </h1>
          <p className="text-zinc-400">Selecione o serviço que deseja, escolha o barbeiro de sua preferência, e o melhor dia e horário para você.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: Formulário de Seleção */}
          <div className="lg:col-span-2 space-y-8 bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800">
            
            {/* Passo 1: Serviço */}
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                <span className="bg-amber-500 text-zinc-950 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Selecione o serviço
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <label 
                    key={service.id} 
                    className={`border-2 rounded-xl p-4 cursor-pointer relative transition-all block ${
                      selectedServiceId === service.id 
                        ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="service" 
                      className="hidden" 
                      checked={selectedServiceId === service.id}
                      onChange={() => setSelectedServiceId(service.id)} 
                    />
                    <div className="font-bold text-zinc-100">{service.name}</div>
                    <div className="text-sm text-zinc-400 mt-1">
                      {service.durationInMinutes >= 60 
                        ? `${Math.floor(service.durationInMinutes / 60)}h ${service.durationInMinutes % 60 > 0 ? `${service.durationInMinutes % 60}min` : ''}` 
                        : `${service.durationInMinutes} min`} • R${service.price.toFixed(2)}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* Passo 2: Barbeiro */}
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                <span className="bg-amber-500 text-zinc-950 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Escolha o Barbeiro
              </h2>
              <div className="flex flex-wrap gap-4">
                <select 
                  className="w-full sm:w-1/2 p-3 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-zinc-950 text-zinc-100"
                  value={selectedBarberId}
                  onChange={(e) => handleBarberChange(e.target.value)}
                >
                  <option value="" disabled>Selecione um barbeiro</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>{barber.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* Passo 3: Data e Hora */}
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                <span className="bg-amber-500 text-zinc-950 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Escolha o Dia e o Horário
              </h2>
              
              {/* Seletor de Dia Horizontal */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Selecione o Dia</label>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {dates.map((dateOpt) => {
                    const isSelected = selectedDate === dateOpt.dateString;
                    if (dateOpt.isClosed) {
                      return (
                        <div
                          key={dateOpt.dateString}
                          className="w-16 flex-shrink-0 bg-zinc-950/40 border border-zinc-900/60 rounded-xl py-4 px-2 text-center opacity-40 cursor-not-allowed"
                        >
                          <div className="text-xs text-zinc-500 mb-1">{dateOpt.dayName}</div>
                          <div className="text-lg font-bold text-zinc-650">{dateOpt.dayNumber}</div>
                          <div className="text-[9px] text-red-500 font-bold uppercase mt-1">Fechado</div>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={dateOpt.dateString}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateOpt.dateString);
                          setSelectedTime("");
                        }}
                        className={`w-16 flex-shrink-0 rounded-xl py-4 px-2 text-center transition-all border-2 cursor-pointer ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                            : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className={`text-xs mb-1 ${isSelected ? "text-amber-500" : "text-zinc-500"}`}>
                          {dateOpt.dayName}
                        </div>
                        <div className={`text-lg font-black ${isSelected ? "text-amber-500" : "text-zinc-200"}`}>
                          {dateOpt.dayNumber}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletor de Horário Grid/Vertical */}
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Selecione o Horário</label>
                {!selectedDate ? (
                  <p className="text-zinc-500 text-sm italic">Por favor, selecione um dia acima.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {getFilteredTimes().length === 0 ? (
                      <p className="text-zinc-500 text-sm italic col-span-2">Não há horários disponíveis para este dia.</p>
                    ) : (
                      getFilteredTimes().map((time) => {
                        const isSelected = selectedTime === time;
                        const [hourStr, minStr] = time.split(":");
                        const hourNum = parseInt(hourStr, 10);
                        const isPM = hourNum >= 12;
                        const display12h = `${hourNum % 12 || 12}:${minStr} ${isPM ? 'PM' : 'AM'}`;

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                              isSelected
                                ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                : "border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:border-zinc-700"
                            }`}
                          >
                            <span className="font-bold text-sm">
                              {time} <span className="text-xs text-zinc-550 font-medium ml-1.5">({display12h})</span>
                            </span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              isSelected ? "border-amber-500 bg-amber-500" : "border-zinc-700"
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-zinc-950 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: Resumo da Reserva */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 shadow-xl sticky top-24">
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
                className="w-full bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
    </div>
  );
}