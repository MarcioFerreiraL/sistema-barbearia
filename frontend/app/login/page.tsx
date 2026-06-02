"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, registerCustomer } from "../services/api";

export default function LoginPage() {
  const router = useRouter();
  
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
        const data = await login(email, password);
        
        // Guarda o Token JWT no armazenamento do navegador
        localStorage.setItem("token", data.token);
        
        // Redireciona o cliente para a página de marcações ou perfil
        router.push("/appointment"); 
        
      } else {
        // --- FAZER REGISTO ---
        await registerCustomer({ fullName, email, password, phoneNumber });
        
        // Se o registo der sucesso, fazemos login automático logo de seguida!
        const data = await login(email, password);
        localStorage.setItem("token", data.token);
        router.push("/appointment");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLoginView ? "Entrar na Barbearia" : "Criar Conta"}
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLoginView && (
            <>
              <input
                type="text"
                placeholder="Nome Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Telefone (ex: 81999999999)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? "A carregar..." : isLoginView ? "Entrar" : "Registar"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isLoginView ? "Ainda não tem conta? " : "Já tem uma conta? "}
          <button
            type="button"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError(""); // limpa os erros ao trocar de ecrã
            }}
            className="text-blue-600 underline font-semibold"
          >
            {isLoginView ? "Crie uma agora" : "Faça Login"}
          </button>
        </p>
      </div>
    </div>
  );
}