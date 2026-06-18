import type { Metadata } from "next";
import Navbar from "./components/ui/navbar";
import Footer from "./components/ui/footer";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";

export const metadata: Metadata = {
  title: "Barbearia do Zé | Barbearia Premium",
  description: "Sistema de Agendamento para Barbearia",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <ToastProvider>
            {/* Usando o nosso novo componente de Navegação */}
            <Navbar />

            {/* Conteúdo das outras páginas */}
            <main className="flex-grow">
              {children}
            </main>

            {/* RODAPÉ */}
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}