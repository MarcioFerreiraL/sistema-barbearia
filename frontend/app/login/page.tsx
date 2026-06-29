"use client";

/**
 * Página de Login e Registro de Clientes
 * 
 * Oferece uma interface única com alternância dinâmica de formulário
 * para login de usuários ou criação de novas contas de clientes.
 * Integra-se aos contextos de autenticação (AuthContext) e notificações (ToastContext).
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login as apiLogin, registerCustomer, getMe } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  
  // Alterna o estado da tela: true para Login, false para Registro/Cadastro
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Estados para controle dos inputs do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Estado para controlar o loading do botão de envio
  const [isLoading, setIsLoading] = useState(false);

  // Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // Monitora se o usuário foi redirecionado por causa de uma sessão expirada no backend
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        showToast("A sua sessão expirou. Por favor, faça login novamente.", "error");
        
        // Limpa a query string (?expired=true) da URL de forma silenciosa na barra do navegador
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [showToast]);

  /**
   * Processa a submissão dos formulários (Login ou Registro).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginView) {
        // --- FLUXO DE LOGIN ---
        // O backend define o cookie httpOnly automaticamente na resposta
        await apiLogin(email, password);
        
        // Atualiza o estado global de autenticação via /api/auth/me
        await login();
        showToast("Login efetuado com sucesso! Bem-vindo.", "success");
        
        // Busca as informações do usuário para determinar o redirecionamento
        const userInfo = await getMe();
        
        // Redireciona o usuário para seu painel adequado baseado no seu perfil
        if (userInfo?.role === "ADMIN") {
          router.push("/admin");
        } else if (userInfo?.role === "BARBER") {
          router.push("/barber-panel");
        } else {
          router.push("/appointment"); // Clientes vão para agendamento
        }
      } else {
        // --- FLUXO DE REGISTRO ---
        // Validação obrigatória dos Termos de Uso e Política de Privacidade
        if (!acceptedTerms) {
          throw new Error("Você precisa de aceitar os Termos de Uso e a Política de Privacidade.");
        }

        // Envia requisição pública de cadastro de cliente
        await registerCustomer({ fullName, email, password, phoneNumber });
        showToast("Conta criada com sucesso! A entrar...", "success");
        
        // Efetua login automático imediato pós-cadastro para melhorar a UX
        await apiLogin(email, password);
        await login();
        router.push("/appointment");
      }
    } catch (err: any) {
      showToast(err.message || "Ocorreu um erro. Verifique as suas credenciais.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-zinc-950 py-12 px-4">
      <div className="bg-zinc-950 p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-zinc-800">
        
        {/* Cabeçalho do formulário */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-zinc-50">
            {isLoginView ? "Bem-vindo à " : "Crie a sua Conta na "}
            Barbearia do <span className="text-amber-500">Zé</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            {isLoginView ? "Insira as suas credenciais para aceder" : "Preencha os dados abaixo para se registar"}
          </p>
        </div>

        {/* Formulário Interativo */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Inputs exibidos somente no modo de Cadastro */}
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

          {/* Inputs Comuns a Ambos os Modos */}
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 p-3 pr-12 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-500 transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  /* Ícone de olho fechado (ocultar) */
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  /* Ícone de olho aberto (mostrar) */
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Checkbox de Termos de Consentimento (Somente no Cadastro) */}
          {!isLoginView && (
            <div className="flex items-start gap-3 mt-1">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 cursor-pointer accent-amber-500"
                required
              />
              <label htmlFor="accept-terms" className="text-xs text-zinc-400 leading-relaxed cursor-pointer select-none">
                Li e aceito os{" "}
                <Link href="/terms-of-use" target="_blank" className="text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-2">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacy-policy" target="_blank" className="text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-2">
                  Política de Privacidade
                </Link>{" "}
                da Barbearia do Zé.
              </label>
            </div>
          )}

          {/* Botão de Envio com Estado Visual de Carregamento */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 text-zinc-950 font-bold p-4 rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                {/* Spinner Animado SVG */}
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

        {/* Rodapé Alternador de Visão */}
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">
            {isLoginView ? "Ainda não tem conta? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView);
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