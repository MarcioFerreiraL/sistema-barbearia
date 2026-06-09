"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, registerCustomer } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Estados para controlar se estamos a mostrar o formulário de Login ou Registo
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Estados dos inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Estados de feedback (carregamento e erros)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de Submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLoginView) {
        // --- FAZER LOGIN ---
        const data = await apiLogin(email, password);
        
        // Guarda o Token JWT usando o contexto (atualiza a navbar instantaneamente)
        login(data.token);
        
        // Descobre a role para redirecionar para o local certo
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          let role = payload.sub && payload.sub.toLowerCase().includes("admin") ? "ADMIN" : "CLIENT";
          
          if (payload.role) {
            const rawRole = payload.role.replace("ROLE_", "");
            role = rawRole === "CUSTOMER" ? "CLIENT" : rawRole;
          }
          
          if (role === "ADMIN") {
            router.push("/admin");
          } else if (role === "BARBER") {
            router.push("/barber-panel");
          } else {
            router.push("/appointment");
          }
        } catch (e) {
          router.push("/appointment"); 
        }
      } else {
        // --- FAZER REGISTO ---
        await registerCustomer({ fullName, email, password, phoneNumber });
        
        // Se o registo der sucesso, fazemos login automático logo de seguida!
        const data = await apiLogin(email, password);
        login(data.token);
        router.push("/appointment"); // Registo é sempre cliente
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-zinc-50 py-12 px-4">
      <div className="bg-zinc-950 p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-zinc-50">
            {isLoginView ? "Bem-vindo à " : "Crie a sua Conta na "}
            <span className="text-amber-500">BarberPro</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            {isLoginView ? "Insira as suas credenciais para aceder" : "Preencha os dados abaixo para se registar"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium text-center flex items-center justify-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLoginView && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Telefone</label>
                <input
                  type="text"
                  placeholder="Ex: 81999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-mail</label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Palavra-passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 text-zinc-950 font-bold p-4 rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : isLoginView ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">
            {isLoginView ? "Ainda não tem conta? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError(""); // limpa os erros ao trocar de ecrã
              }}
              className="text-amber-500 font-bold hover:text-amber-400 transition-colors underline decoration-transparent hover:decoration-amber-400 underline-offset-4"
            >
              {isLoginView ? "Crie uma agora" : "Faça Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}