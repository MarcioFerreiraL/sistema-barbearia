"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdmins, updateAdmin } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminProfilePage() {
  const router = useRouter();
  const { isLoggedIn, email } = useAuth();
  
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    async function loadProfile() {
      if (!isLoggedIn || !email) return;

      try {
        const admins = await getAdmins();
        const currentAdmin = admins.find((a: any) => a.email === email);

        if (!currentAdmin) {
          throw new Error("Perfil de administrador não encontrado no sistema.");
        }

        setAdmin(currentAdmin);
        setFormData({
          fullName: currentAdmin.fullName,
          email: currentAdmin.email,
          phoneNumber: currentAdmin.phoneNumber,
          password: ""
        });

      } catch (err: any) {
        setError(err.message || "Erro ao carregar o seu perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [isLoggedIn, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        ...(formData.password ? { password: formData.password } : {})
      };

      const updated = await updateAdmin(admin.id, payload);
      setAdmin(updated);
      setFormData(prev => ({ ...prev, password: "" }));
      setStatus({ type: "success", message: "Perfil de administrador atualizado com sucesso!" });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Erro ao atualizar o perfil." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500 border-opacity-70"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-amber-500 font-bold hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="text-zinc-100">
      <h1 className="text-3xl font-black text-zinc-50 mb-8 border-b border-zinc-800 pb-4">
        Meu <span className="text-amber-500">Perfil</span>
      </h1>

      <div className="max-w-2xl bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700"></div>
        <h2 className="text-xl font-bold text-zinc-150 mb-6">Editar Informações Pessoais</h2>

        {status.message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${
            status.type === "error" ? "bg-red-950/40 text-red-400 border-red-900/50" : "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3.5 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-mail</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3.5 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Telemóvel</label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3.5 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-805">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nova Palavra-passe</label>
            <p className="text-xs text-zinc-500 mb-3">Deixe em branco se não pretender alterar a sua palavra-passe.</p>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 caracteres"
              minLength={6}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3.5 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)]"
            >
              {isSubmitting ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
