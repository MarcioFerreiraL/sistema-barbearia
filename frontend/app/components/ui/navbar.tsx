"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, role, logout } = useAuth();

  const isAdmin = role === "ADMIN";
  const isBarber = role === "BARBER";
  const isCustomer = isLoggedIn && !isAdmin && !isBarber;

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-zinc-950 text-white p-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter">
          BARBER<span className="text-amber-500">PRO</span>
        </Link>
        
        {/* Botão Hambúrguer (Visível apenas no Celular) */}
        <button 
          className="md:hidden text-zinc-300 hover:text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-8 items-center font-medium">
          <Link href="/about" className="hover:text-amber-500 transition-colors">Sobre Nós</Link>
          <Link href="/prices" className="hover:text-amber-500 transition-colors">Serviços</Link>
          <Link href="/gallery" className="hover:text-amber-500 transition-colors">Galeria</Link>
          
          {isCustomer && (
            <Link href="/profile" className="hover:text-amber-500 transition-colors">Meu Perfil</Link>
          )}

          {isAdmin && (
            <Link href="/admin" className="hover:text-amber-500 transition-colors">Painel Admin</Link>
          )}

          {isBarber && (
            <Link href="/barber-panel" className="hover:text-amber-500 transition-colors">Painel do Barbeiro</Link>
          )}

          
          {!isLoggedIn ? (
            <Link href="/login" className="hover:text-amber-500 transition-colors">Entrar</Link>
          ) : (
            <button onClick={handleLogout} className="hover:text-red-500 transition-colors">Sair</button>
          )}
          
          {(!isLoggedIn || isCustomer) && (
            <Link href="/appointment" className="bg-amber-500 text-zinc-950 px-5 py-2.5 rounded-md font-bold hover:bg-amber-400 transition-transform hover:scale-105">
              Agendar Agora
            </Link>
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-zinc-900 rounded-lg p-4 flex flex-col space-y-4 shadow-xl border border-zinc-800">
          <Link href="/about" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Sobre Nós</Link>
          <Link href="/prices" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Serviços</Link>
          <Link href="/gallery" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Galeria</Link>
          
          {isCustomer && (
            <Link href="/profile" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Meu Perfil</Link>
          )}

          {isAdmin && (
            <Link href="/admin" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Painel Admin</Link>
          )}

          {isBarber && (
            <Link href="/barber-panel" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Painel do Barbeiro</Link>
          )}

          {!isLoggedIn ? (
            <Link href="/login" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Entrar</Link>
          ) : (
            <button onClick={() => { handleLogout(); toggleMenu(); }} className="text-left hover:text-red-500 transition-colors">Sair</button>
          )}
          
          {(!isLoggedIn || isCustomer) && (
            <Link href="/appointment" onClick={toggleMenu} className="bg-amber-500 text-zinc-950 px-4 py-3 rounded-md font-bold text-center hover:bg-amber-400 transition-colors mt-2">
              Agendar Agora
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}