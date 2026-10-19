import Link from "next/link";
import { DEMO } from "../../services/api";

/** Rodapé: endereço, links legais e créditos do projeto. */
export default function Footer() {
  return (
    <footer className="mt-auto bg-anil text-cal">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="letreiro text-3xl text-papel">Mandacaru</p>
          <p className="mt-3 max-w-xs text-cal/85">Barbearia de bairro em Surubim. Corte, barba e conversa boa desde 2009.</p>
        </div>
        <address className="not-italic">
          <p className="font-bold text-papel">Onde fica</p>
          <p className="mt-2 text-cal/85">
            Rua do Mandacaru, 120, Centro
            <br />
            Surubim, PE
          </p>
          {DEMO && <p className="mt-2 text-sm text-cal/70">Endereço fictício da demonstração.</p>}
        </address>
        <div>
          <p className="font-bold text-papel">Mais</p>
          <ul className="mt-2 space-y-1 text-cal/85">
            <li><Link href="/terms-of-use" className="underline-offset-4 hover:underline">Termos de uso</Link></li>
            <li><Link href="/privacy-policy" className="underline-offset-4 hover:underline">Privacidade</Link></li>
            {!DEMO && <li><Link href="/docs" className="underline-offset-4 hover:underline">Documentação da API</Link></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-cal/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-cal/75">
          Projeto de portfólio desenvolvido por{" "}
          <a href="https://marciodev.com" className="font-bold text-papel underline-offset-4 hover:underline">Márcio Ferreira Lima</a>{" "}
          e Lucas, na disciplina de Programação Web.
        </p>
      </div>
    </footer>
  );
}
