"use client";

/**
 * Contexto de Autenticação Global
 * 
 * Gerencia o estado de sessão de login do usuário (Cliente, Barbeiro ou Administrador)
 * de forma unificada no frontend. A autenticação é baseada em cookie httpOnly,
 * com validação via endpoint /api/auth/me.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout as apiLogout, getMe } from "../services/api";

type Role = "CLIENT" | "ADMIN" | "BARBER" | null;

interface AuthContextType {
  isLoggedIn: boolean;
  role: Role;
  userId: string | null;
  email: string | null;
  login: () => Promise<void>;
  logout: (shouldRedirect?: boolean) => void;
}

// Inicializa o contexto com valores default para evitar erros de leitura antes de montar a árvore de componentes
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  role: null,
  userId: null,
  email: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
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
   * Remove a credencial (cookie limpo pelo backend) e redireciona para a tela de login.
   * 
   * @param shouldRedirect Determina se deve redirecionar à força para /login
   */
  const logout = async (shouldRedirect: boolean = true) => {
    await apiLogout(); // Limpa o cookie no servidor
    setIsLoggedIn(false);
    setRole(null);
    setUserId(null);
    setEmail(null);
    if (shouldRedirect) {
      router.push("/login");
    }
  };

  /**
   * Valida a sessão do usuário chamando /api/auth/me.
   * Se o cookie httpOnly for válido, o backend retorna as informações do usuário.
   * Caso contrário, limpa o estado local.
   */
  const checkSession = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    try {
      const userInfo = await getMe();
      
      if (userInfo && userInfo.role) {
        setIsLoggedIn(true);
        setRole(userInfo.role as Role);
        setUserId(userInfo.id);
        setEmail(userInfo.email);
      } else {
        // Cookie inválido ou expirado
        setIsLoggedIn(false);
        setRole(null);
        setUserId(null);
        setEmail(null);
        
        // Se estiver em rota privada e sem sessão válida, ejeta para o login
        if (isProtectedRoute(pathname)) {
          router.push("/login");
        }
      }
    } catch {
      setIsLoggedIn(false);
      setRole(null);
      setUserId(null);
      setEmail(null);
      
      if (isProtectedRoute(pathname)) {
        router.push("/login");
      }
    }
  }, [pathname, router]);

  // Verifica o status de autenticação sempre que a rota mudar
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Chamado após login bem-sucedido (cookie já definido pelo backend).
   * Busca as informações do usuário via /api/auth/me.
   */
  const loginUser = async () => {
    await checkSession();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, userId, email, login: loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o acesso aos estados do contexto de autenticação nos componentes
export const useAuth = () => useContext(AuthContext);
