"use client";

/**
 * Contexto de Notificações Flutuantes (Toasts)
 * 
 * Gerencia o ciclo de vida de mensagens curtas de feedback (sucesso, erro ou informação)
 * exibidas na interface do usuário sem interromper o fluxo de navegação.
 * Substitui os diálogos nativos do navegador como 'alert()'.
 */

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

// Inicializa o contexto para uso global nos componentes
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Dispara uma nova notificação Toast na tela.
   * A mensagem possui expiração automática de 4 segundos.
   * 
   * @param message Conteúdo da mensagem a ser exibida
   * @param type Estilo visual da notificação ('success' | 'error' | 'info')
   */
  const showToast = useCallback((message: string, type: ToastType = "info") => {
    // Cria um ID randômico simples em string de base 36 para controle de exclusão
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Agenda a exclusão automática do Toast após 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  /**
   * Remove imediatamente uma notificação Toast pelo ID.
   * Chamado quando o usuário clica sobre a notificação para fechá-la.
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* 
        Container de posicionamento flutuante no canto inferior direito.
        z-[9999] garante exibição sobre qualquer modal ou navbar.
        pointer-events-none impede que o container invisível bloqueie cliques na página.
      */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            // pointer-events-auto reestabelece a interatividade do card específico de Toast
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-2xl bg-zinc-900 text-zinc-100 transition-all duration-300 transform translate-y-0 scale-100 hover:scale-102 cursor-pointer animate-slide-in ${
              toast.type === "success"
                ? "border-emerald-500/50 hover:border-emerald-500 shadow-emerald-950/20"
                : toast.type === "error"
                ? "border-red-500/50 hover:border-red-500 shadow-red-950/20"
                : "border-amber-500/50 hover:border-amber-500 shadow-amber-950/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Ícone de Sucesso - Verde Esmeralda */}
              {toast.type === "success" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {/* Ícone de Erro - Vermelho */}
              {toast.type === "error" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              {/* Ícone de Informação - Dourado Amber */}
              {toast.type === "info" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
            </div>
            
            {/* Botão de Fechar Rápido (X) */}
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook de conveniência para uso do sistema de notificações nos componentes funcionais
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
}
