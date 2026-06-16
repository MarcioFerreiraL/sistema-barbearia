"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout as apiLogout } from "../services/api";

type Role = "CLIENT" | "ADMIN" | "BARBER" | null;

interface AuthContextType {
  isLoggedIn: boolean;
  role: Role;
  login: (token: string) => void;
  logout: (shouldRedirect?: boolean) => void;
}

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

  const isProtectedRoute = (path: string) => {
    return (
      path.startsWith("/appointment") ||
      path.startsWith("/profile") ||
      path.startsWith("/admin") ||
      path.startsWith("/barber-panel")
    );
  };

  const logout = async (shouldRedirect: boolean = true) => {
    await apiLogout();
    setIsLoggedIn(false);
    setRole(null);
    if (shouldRedirect) {
      router.push("/login");
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        // Verifica se o token expirou pelo tempo (exp)
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn("Token expirado");
          logout(isProtectedRoute(pathname));
          return;
        }

        setIsLoggedIn(true);
        if (payload.role) {
          const rawRole = payload.role.replace("ROLE_", "");
          if (rawRole === "CUSTOMER") {
            setRole("CLIENT");
          } else {
            setRole(rawRole as Role);
          }
        } else if (payload.sub && payload.sub.toLowerCase().includes("admin")) {
          setRole("ADMIN");
        } else {
          setRole("CLIENT");
        }
      } catch (e) {
        console.error("Token inválido");
        logout(isProtectedRoute(pathname));
      }
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  };

  useEffect(() => {
    checkToken();
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, [pathname]);

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

export const useAuth = () => useContext(AuthContext);

