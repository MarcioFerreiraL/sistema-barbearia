"use client";

import { usePathname } from "next/navigation";
import PanelLayout from "../components/PanelLayout";

const itens = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/barbers", label: "Barbeiros" },
  { href: "/admin/services", label: "Serviços e preços" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/hours", label: "Horário de funcionamento" },
  { href: "/admin/profile", label: "Meus dados" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // A configuração do primeiro administrador fica fora do painel.
  if (pathname === "/admin/setup") return <>{children}</>;
  return (
    <PanelLayout papel="ADMIN" titulo="Administração" itens={itens}>
      {children}
    </PanelLayout>
  );
}
