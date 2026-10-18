"use client";

import PanelLayout from "../components/PanelLayout";

const itens = [
  { href: "/barber-panel", label: "Minha agenda" },
  { href: "/barber-panel/profile", label: "Meus dados" },
];

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelLayout papel="BARBER" titulo="Barbeiro" itens={itens}>
      {children}
    </PanelLayout>
  );
}
