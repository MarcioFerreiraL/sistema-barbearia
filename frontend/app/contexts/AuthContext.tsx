"use client";

/**
 * Contexto de Autenticação Global
 * 
 * Gerencia o estado de sessão de login do usuário (Cliente, Barbeiro ou Administrador)
 * de forma unificada no frontend, aplicando proteção de rotas e limpeza de cache local.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout as apiLogout } from "../services/api";
import { getUserInfoFromToken, Role } from "../../lib/auth";

interface AuthContextType {
  isLoggedIn: boolean;
  role: Role;
  login: (token: string) => void;
  logout: (shouldRedirect?: boolean) => void;
}

// Inicializa o contexto com valores default para evitar erros de leitura antes de montar a árvore de componentes
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  role: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Determina se a rota atual exige que o usuário esteja autenticado.
   * 
   * @param path Caminho da rota no Next.js
   * @returns true se for protegida, false caso contrário
   */
  const isProtectedRoute = (path: string): boolean => {
    return (
      path.startsWith("/appointment") ||
      path.startsWith("/profile") ||
      path.startsWith("/admin") ||
      path.startsWith("/barber-panel")
    );
  };

  /**
   * Remove a credencial local, notifica o backend e redireciona para a tela de login.
   * 
   * @param shouldRedirect Determina se deve redirecionar à força para /login
   */
  const logout = async (shouldRedirect: boolean = true) => {
    await apiLogout(); // Limpa no servidor/cookies
    setIsLoggedIn(false);
    setRole(null);
    if (shouldRedirect) {
      router.push("/login");
    }
  };

  /**
   * Valida o token JWT armazenado localmente e atualiza o estado do contexto.
   * Acionado ao carregar a página ou detectar mudanças no localStorage.
   */
  const checkToken = () => {
    if (typeof window === "undefined") return;
    
    const token = localStorage.getItem("token");
    if (token) {
      const userInfo = getUserInfoFromToken(token);
      
      // Se não conseguiu ler a role ou o token for inválido, força deslogar
      if (!userInfo.role) {
        console.error("[AUTH] Falha ao extrair perfil do token local.");
        logout(isProtectedRoute(pathname));
        return;
      }

      // Valida o tempo de expiração do JWT
      if (userInfo.exp && userInfo.exp * 1000 < Date.now()) {
        console.warn("[AUTH] Token expirado temporalmente. Redirecionando.");
        logout(isProtectedRoute(pathname));
        return;
      }

      // Sessão válida
      setIsLoggedIn(true);
      setRole(userInfo.role);
    } else {
      // Nenhum token encontrado
      setIsLoggedIn(false);
      setRole(null);
      
      // Se estiver em rota privada e sem token, ejeta para o login
      if (isProtectedRoute(pathname)) {
        router.push("/login");
      }
    }
  };

  // Verifica o status de autenticação sempre que a rota mudar
  useEffect(() => {
    checkToken();
    
    // Escuta eventos de storage para sincronizar o logout entre diferentes abas abertas
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, [pathname]);

  /**
   * Registra o token no navegador e recarrega as validações.
   * Chamado após sucesso na autenticação do formulário.
   */
  const loginUser = (token: string) => {
    localStorage.setItem("token", token);
    checkToken();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login: loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o acesso aos estados do contexto de autenticação nos componentes
export const useAuth = () => useContext(AuthContext);
