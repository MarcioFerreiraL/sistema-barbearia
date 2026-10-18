import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Atkinson_Hyperlegible } from "next/font/google";
import Navbar from "./components/ui/navbar";
import Footer from "./components/ui/footer";
import DemoBar from "./components/ui/DemoBar";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";

const alfa = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-alfa", display: "swap" });
const atkinson = Atkinson_Hyperlegible({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-atkinson", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Mandacaru Barbearia", template: "%s | Mandacaru Barbearia" },
  description: "Corte, barba e acabamento em Surubim. Marque seu horário pelo celular.",
};

export const viewport: Viewport = {
  themeColor: "#1d2a4d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${alfa.variable} ${atkinson.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <ToastProvider>
            <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-papel focus:px-4 focus:py-2">
              Pular para o conteúdo
            </a>
            <DemoBar />
            <Navbar />
            <main id="conteudo" className="flex-grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
