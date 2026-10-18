"use client";

/**
 * Avisos curtos de resultado (sucesso, erro ou informação), sem interromper o fluxo.
 * Somem sozinhos depois de 5 segundos ou com um clique em "Fechar".
 */

import React, { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const estilo: Record<ToastType, string> = {
  success: "border-anil",
  error: "border-letreiro",
  info: "border-acafrao",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remover = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remover(id), 5000);
    },
    [remover],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-96">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`animate-entra pointer-events-auto flex w-full items-start justify-between gap-3 rounded-lg border-l-[6px] bg-papel p-4 shadow-[4px_4px_0_var(--color-anil)] ${estilo[t.type]}`}
          >
            <p className="font-bold">{t.message}</p>
            <button type="button" onClick={() => remover(t.id)} className="shrink-0 text-sm underline">
              Fechar
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
}
