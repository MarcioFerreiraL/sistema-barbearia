"use client";

import { useState, useEffect } from "react";
import { getBarbers, updateBarber } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function BarberProfilePage() {
  const { isLoggedIn, email } = useAuth();
  const [barber, setBarber] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn || !email) return;

      try {
        const barbersRes = await getBarbers();
        const currentBarber = barbersRes.find((b: any) => b.email === email);
        
        if (currentBarber) {
          setBarber(currentBarber);
          setFormData({
            fullName: currentBarber.fullName,
            email: currentBarber.email,
            phoneNumber: currentBarber.phoneNumber,
            password: ""
          });
        }
      } catch (e) {
        console.error("Erro ao carregar o perfil:", e);
      } finally {
        setIsLoading(false);
      }
    };

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

      await updateBarber(barber.id, payload);
      setStatus({ type: "success", message: "Perfil atualizado com sucesso!" });
      
      // Limpar campo de senha se foi atualizado
      setFormData(prev => ({ ...prev, password: "" }));
      
    } catch (e: any) {
      setStatus({ type: "error", message: "Erro ao atualizar: " + e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-zinc-500 animate-pulse text-center py-20">A carregar o seu perfil...</div>;
  }

  if (!barber) {
    return <div className="text-red-500 text-center py-20">Erro ao identificar o seu perfil.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-900 mb-2">
        Meu <span className="text-amber-500">Perfil</span>
      </h1>
      <p className="text-zinc-500 mb-8">Atualize as suas informações pessoais e de contacto.</p>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 max-w-2xl">
        
        {status.message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${
            status.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nome Completo</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Telefone</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-zinc-100">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nova Palavra-passe</label>
              <p className="text-xs text-zinc-400 mb-2">Se não quiser alterar, deixe este campo em branco.</p>
              <input type="password" name="password" value={formData.password} onChange={handleChange} minLength={6}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} 
              className="bg-zinc-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200">
              {isSubmitting ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
