import type { Metadata } from "next";
import PriceBoard from "../components/PriceBoard";

export const metadata: Metadata = { title: "Serviços e preços" };

export default function Precos() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 className="sr-only">Serviços e preços</h1>
      <PriceBoard />
    </div>
  );
}
