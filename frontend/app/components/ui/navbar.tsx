"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

/** Cabeçalho: marca, links por perfil e o botão de marcar horário. No celular, menu recolhível. */
export default function Navbar() {
  const [aberto, setAberto] = useState(false);
  const { isLoggedIn, role, logout } = useAuth();
  const pathname = usePathname();

  const isAdmin = role === "ADMIN";
  const isBarber = role === "BARBER";
  const isCustomer = isLoggedIn && role === "CLIENT";

  const links = [
    { href: "/#precos", label: "Serviços e preços" },
    { href: "/about", label: "A barbearia" },
    ...(isCustomer ? [{ href: "/profile", label: "Meus horários" }] : []),
    ...(isBarber ? [{ href: "/barber-panel", label: "Minha agenda" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Painel" }] : []),
  ];
  const mostraMarcar = !isLoggedIn || isCustomer;

  const conta = isLoggedIn ? (
    <button type="button" onClick={() => { setAberto(false); logout(); }} className="btn btn-discreto">
      Sair
    </button>
  ) : (
    <Link href="/login" className="btn btn-discreto" onClick={() => setAberto(false)}>
      Entrar
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-linha bg-cal/95 backdrop-blur">
      <nav aria-label="Principal" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="letreiro text-2xl text-letreiro" aria-label="Mandacaru Barbearia, início">
          Mandacaru
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className="rounded-md px-3 py-2 font-bold hover:bg-papel aria-[current=page]:underline aria-[current=page]:underline-offset-4"
            >
              {l.label}
            </Link>
          ))}
          {conta}
          {mostraMarcar && (
            <Link href="/appointment" className="btn btn-primario ml-2">
              Marcar horário
            </Link>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secundario px-3 md:hidden"
          aria-expanded={aberto}
          aria-controls="menu-celular"
          onClick={() => setAberto((v) => !v)}
        >
          {aberto ? "Fechar" : "Menu"}
        </button>
      </nav>

      {aberto && (
        <div id="menu-celular" className="border-t border-linha bg-cal px-4 pb-5 md:hidden">
          <ul className="flex flex-col py-2 text-lg">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-3 font-bold" onClick={() => setAberto(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="py-1">{conta}</li>
          </ul>
          {mostraMarcar && (
            <Link href="/appointment" className="btn btn-primario w-full" onClick={() => setAberto(false)}>
              Marcar horário
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
