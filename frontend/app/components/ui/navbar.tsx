"use client";

/**
 * Componente Navbar de Navegação Global
 * 
 * Renderiza uma barra de cabeçalho responsiva (Desktop e Mobile) com
 * lógica de visibilidade condicional de links baseada no status de login
 * e no papel (Role) do usuário decodificado a partir do token JWT.
 */

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  // Controle de estado para abertura/fechamento do menu mobile popup
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Acessa dados de autenticação globais do contexto
  const { isLoggedIn, role, logout } = useAuth();

  // Flags auxiliares de renderização condicional baseada na role (Clean Code: Legibilidade)
  const isAdmin = role === "ADMIN";
  const isBarber = role === "BARBER";
  const isCustomer = isLoggedIn && !isAdmin && !isBarber;

  /**
   * Alterna a exibição do menu popup mobile.
   */
  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Efetua o logout do usuário limpando as variáveis locais.
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-zinc-950 text-white p-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Marca/Logo da Barbearia */}
        <Link href="/" className="text-2xl font-black tracking-tighter">
          BARBEARIA DO <span className="text-amber-500">ZÉ</span>
        </Link>
        
        {/* Botão Hambúrguer (Visível apenas em resoluções mobile) */}
        <button 
          className="md:hidden text-zinc-300 hover:text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {/* Alterna o ícone entre hambúrguer (menu fechado) e X (menu aberto) */}
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menu Desktop (Escondido em telas menores) */}
        <div className="hidden md:flex space-x-8 items-center font-medium">
          <Link href="/about" className="hover:text-amber-500 transition-colors">Sobre Nós</Link>
          <Link href="/prices" className="hover:text-amber-500 transition-colors">Serviços</Link>
          <Link href="/gallery" className="hover:text-amber-500 transition-colors">Galeria</Link>
          
          {/* Exibição condicional com base no perfil logado */}
          {isCustomer && (
            <Link href="/profile" className="hover:text-amber-500 transition-colors">Meu Perfil</Link>
          )}

          {isAdmin && (
            <Link href="/admin" className="hover:text-amber-500 transition-colors">Painel Admin</Link>
          )}

          {isBarber && (
            <Link href="/barber-panel" className="hover:text-amber-500 transition-colors">Painel do Barbeiro</Link>
          )}
          
          {/* Alterna botão de login vs logout */}
          {!isLoggedIn ? (
            <Link href="/login" className="hover:text-amber-500 transition-colors">Entrar</Link>
          ) : (
            <button onClick={handleLogout} className="hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none">Sair</button>
          )}
          
          {/* Exibe botão rápido de agendamento apenas para visitantes ou clientes normais */}
          {(!isLoggedIn || isCustomer) && (
            <Link href="/appointment" className="bg-amber-500 text-zinc-950 px-5 py-2.5 rounded-md font-bold hover:bg-amber-400 transition-transform hover:scale-105">
              Agendar Agora
            </Link>
          )}
        </div>
      </div>

      {/* 
        Menu Mobile Pop-up overlay (Desloca em tela cheia com blur de fundo).
        Renderiza com animação de fade-in e blur premium.
      */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-zinc-950/98 backdrop-blur-md z-[999] flex flex-col justify-center px-8 md:hidden animate-fade-in">
          {/* Botão de Fechar do Pop-up (X) */}
          <button 
            className="absolute top-6 right-6 text-zinc-300 hover:text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Links de navegação vertical do Menu Mobile */}
          <div className="flex flex-col space-y-6 text-2xl font-bold text-center">
            <Link href="/" onClick={toggleMenu} className="hover:text-amber-500 transition-colors">Início</Link>
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
              <button onClick={() => { handleLogout(); toggleMenu(); }} className="text-center hover:text-red-500 transition-colors w-full font-bold bg-transparent border-none cursor-pointer">Sair</button>
            )}
            
            {(!isLoggedIn || isCustomer) && (
              <Link href="/appointment" onClick={toggleMenu} className="bg-amber-500 text-zinc-950 px-6 py-4 rounded-xl font-bold text-center hover:bg-amber-400 transition-all mt-4 inline-block">
                Agendar Agora
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}