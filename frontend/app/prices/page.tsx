"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServices } from "../services/api";

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
  active: boolean;
}

export default function Prices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices();
        setServices(data);
      } catch (err: any) {
        setError("Erro ao carregar os serviços. Verifique se está logado e se o servidor está online.");
      } finally {
        setIsLoading(false);
      }
    }

    loadServices();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 min-h-[80vh]">
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-50 mb-4">
          Nossos <span className="text-amber-500">Serviços</span>
        </h1>
        <p className="text-lg text-zinc-400">
            Nosso Serviços e Preços.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-amber-500 font-bold text-xl">Carregando serviços...</div>
      ) : error ? (
        <div className="text-center text-red-500 font-bold bg-red-100 p-4 rounded-xl">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg hover:border-amber-500/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-zinc-100 pr-4">{service.name}</h3>
                  <span className="text-xl font-black text-amber-600">R${service.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{service.description}</p>
              </div>
              
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-auto">
                <span className="text-sm font-medium text-zinc-400">
                  ⏱ {service.durationInMinutes >= 60 ? `${Math.floor(service.durationInMinutes / 60)}h ${service.durationInMinutes % 60 > 0 ? `${service.durationInMinutes % 60}min` : ''}` : `${service.durationInMinutes} min`}
                </span>
                <Link href="/appointment" className="text-sm font-bold text-zinc-900 bg-amber-100 px-4 py-2 rounded hover:bg-amber-200 transition-colors">
                  Agendar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chamada para Ação Inferior */}
      <div className="mt-20 text-center bg-zinc-950 text-white p-10 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-bold mb-3">Preparado para renovar o estilo?</h3>
        <Link href="/appointment" className="inline-block bg-amber-500 text-zinc-950 font-bold px-8 py-3 rounded-md hover:bg-amber-400 hover:scale-105 transition-transform">
          Marque Seu Corte de Cabelo
        </Link>
      </div>

    </div>
  );
}
