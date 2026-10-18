"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../services/types";
import { inicioDoPerfil } from "../../lib/perfil";
import { Carregando } from "./ui/kit";

interface Props {
  papel: Role;
  titulo: string;
  itens: { href: string; label: string }[];
  children: React.ReactNode;
}

/** Área interna (barbeiro e dona): só abre para o perfil certo; navegação lateral no computador e em abas no celular. */
export default function PanelLayout({ papel, titulo, itens, children }: Props) {
  const { checked, isLoggedIn, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!checked) return;
    if (!isLoggedIn) router.replace("/login");
    else if (role && role !== papel) router.replace(inicioDoPerfil(role));
  }, [checked, isLoggedIn, role, papel, router]);

  if (!checked || !isLoggedIn || role !== papel) return <Carregando texto="Verificando acesso…" />;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10 md:py-12">
      <aside className="md:w-56 md:shrink-0">
        <p className="titulo text-2xl">{titulo}</p>
        <nav aria-label={titulo} className="-mx-4 mt-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex gap-2 md:flex-col md:gap-1">
            {itens.map((i) => {
              const atual = pathname === i.href;
              return (
                <li key={i.href} className="shrink-0">
                  <Link
                    href={i.href}
                    aria-current={atual ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2 font-bold whitespace-nowrap ${atual ? "bg-anil text-cal" : "hover:bg-papel"}`}
                  >
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
