"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "CLIENT" | "ADMIN" | "BARBER" | null;

interface AuthContextType {
  isLoggedIn: boolean;
  role: Role;
  login: (token: string) => void;
  logout: () => void;
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

  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
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
        logout();
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
  }, []);

  const loginUser = (token: string) => {
    localStorage.setItem("token", token);
    checkToken();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login: loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
