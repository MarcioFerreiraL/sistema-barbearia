"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin/setup") {
      const timer = setTimeout(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
        } else if (isLoggedIn && role && role !== "ADMIN") {
          // If they have a token, are logged in, but are NOT an admin
          if (role === "BARBER") {
            router.push("/barber-panel");
          } else {
            router.push("/appointment");
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, role, router, pathname]);

  const navItems = [
    { name: "Dashboard / Relatórios", path: "/admin" },
    { name: "Gerir Barbeiros", path: "/admin/barbers" },
    { name: "Gerir Serviços", path: "/admin/services" },
    { name: "Horários de Funcionamento", path: "/admin/hours" },
    { name: "Meu Perfil", path: "/admin/profile" },
  ];

  if (pathname === "/admin/setup") {
    return <>{children}</>;
  }

  if (!isLoggedIn || role !== "ADMIN") {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-50">
        <p className="text-zinc-500 font-medium animate-pulse">Verificando permissões...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar de Navegação do Admin */}
      <aside className="w-full md:w-64 bg-zinc-950 text-zinc-300 flex-shrink-0 shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-black text-zinc-50 uppercase tracking-wider mb-1">
            Painel <span className="text-amber-500">Admin</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium mb-8">Controle total do sistema</p>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "hover:bg-zinc-900 hover:text-amber-400"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
