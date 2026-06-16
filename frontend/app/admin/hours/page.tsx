"use client";

import { useState, useEffect } from "react";
import { getBusinessHours, updateBusinessHours } from "../../services/api";

interface BusinessHours {
  dayOfWeek: number;
  dayName: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

export default function ManageHoursPage() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  const fetchHours = async () => {
    try {
      const data = await getBusinessHours();
      setHours(data);
    } catch (e) {
      console.error("Erro ao carregar horários:", e);
      setStatus({ type: "error", message: "Erro ao carregar os horários de funcionamento." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHours();
  }, []);

  const handleToggleOpen = (dayOfWeek: number) => {
    setHours(hours.map(h => h.dayOfWeek === dayOfWeek ? { ...h, open: !h.open } : h));
  };

  const handleTimeChange = (dayOfWeek: number, field: "openTime" | "closeTime", value: string) => {
    setHours(hours.map(h => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h));
  };

  const handleSave = async (dayOfWeek: number) => {
    const dayConfig = hours.find(h => h.dayOfWeek === dayOfWeek);
    if (!dayConfig) return;

    setSavingDay(dayOfWeek);
    setStatus({ type: "", message: "" });

    try {
      await updateBusinessHours(dayOfWeek, dayConfig);
      setStatus({ type: "success", message: `Horário de ${dayConfig.dayName} atualizado com sucesso!` });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (e: any) {
      setStatus({ type: "error", message: `Erro ao salvar ${dayConfig.dayName}: ` + e.message });
    } finally {
      setSavingDay(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-zinc-950">Horários de <span className="text-amber-500">Funcionamento</span></h1>
          <p className="text-zinc-500 text-sm mt-1">Configure os dias de abertura, encerramento e os horários de atendimento da barbearia.</p>
        </div>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
          status.type === "error" 
            ? "bg-red-500/10 text-red-600 border-red-500/20" 
            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        }`}>
          <span>{status.type === "error" ? "⚠️" : "✅"}</span>
          {status.message}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center">
          <p className="text-zinc-500 animate-pulse font-medium">Carregando configurações...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
          {hours.map((day) => (
            <div key={day.dayOfWeek} className={`p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-colors ${day.open ? 'bg-white' : 'bg-zinc-50/50'}`}>
              {/* Info e Status */}
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="flex-1">
                  <h3 className="font-bold text-zinc-900 text-base">{day.dayName}</h3>
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${
                    day.open 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-zinc-200 text-zinc-600"
                  }`}>
                    {day.open ? "Aberto" : "Fechado"}
                  </span>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleOpen(day.dayOfWeek)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    day.open ? "bg-amber-500" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      day.open ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Inputs de Horário */}
              <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Abertura</label>
                  <input
                    type="time"
                    value={day.openTime}
                    onChange={(e) => handleTimeChange(day.dayOfWeek, "openTime", e.target.value)}
                    disabled={!day.open}
                    className="w-full bg-white border border-zinc-200 text-zinc-800 p-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <span className="text-zinc-300 font-bold self-end mb-2">até</span>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Fecho</label>
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) => handleTimeChange(day.dayOfWeek, "closeTime", e.target.value)}
                    disabled={!day.open}
                    className="w-full bg-white border border-zinc-200 text-zinc-800 p-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              {/* Ação */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleSave(day.dayOfWeek)}
                  disabled={savingDay === day.dayOfWeek}
                  className="bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-50 transition-all min-w-[100px] text-center"
                >
                  {savingDay === day.dayOfWeek ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
