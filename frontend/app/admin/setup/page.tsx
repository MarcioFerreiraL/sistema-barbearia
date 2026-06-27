"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setupAdmin } from "../../services/api";

export default function AdminSetupPage() {
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", phoneNumber: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await setupAdmin(formData);
      setStatus({ type: "success", message: "Conta de Administrador criada com sucesso! Redirecionando para login..." });
      setTimeout(() => router.push("/login"), 3000);
    } catch (e: any) {
      setStatus({ type: "error", message: "Erro de conexão: " + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 p-8 rounded-2xl shadow-xl border border-zinc-800">
        <h1 className="text-2xl font-black text-zinc-50 mb-2">Configurar <span className="text-amber-500">Administrador</span></h1>
        <p className="text-zinc-400 text-sm mb-6">Crie a conta de acesso total ao sistema. Esta página deve ser desativada após o uso.</p>
        
        {status.message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 ${
            status.type === "error" ? "bg-red-500/10 text-red-500 border border-red-500/50" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/50"
          }`}>
            <span>{status.type === "error" ? "⚠️" : "✅"}</span>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-mail</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Senha</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Telefone</label>
            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
          </div>
          
          <button type="submit" disabled={isLoading} className="w-full bg-amber-500 text-zinc-950 font-bold p-4 rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] mt-4">
            {isLoading ? "Processando..." : "Criar Administrador"}
          </button>
        </form>
      </div>
    </div>
  );
}
