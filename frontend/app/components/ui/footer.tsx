import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-8 border-t border-zinc-900 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {/* Bloco 1: Marca e Descrição */}
        <div className="space-y-4">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white inline-block">
            BARBEARIA DO <span className="text-amber-500">ZÉ</span>
          </Link>
          <p className="text-sm leading-relaxed text-zinc-500">
            Elevando o padrão do cuidado masculino. Mais do que um corte de cabelo, oferecemos uma experiência premium de estilo e confiança.
          </p>
        </div>

        {/* Bloco 2: Links Rápidos */}
        <div>
          <h4 className="text-white font-bold mb-5 tracking-wide uppercase text-sm">Acesso Rápido</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-amber-500 transition-colors flex items-center"><span className="mr-2 text-amber-500">›</span> Início</Link></li>
            <li><Link href="/about" className="hover:text-amber-500 transition-colors flex items-center"><span className="mr-2 text-amber-500">›</span> Sobre Nós</Link></li>
            <li><Link href="/prices" className="hover:text-amber-500 transition-colors flex items-center"><span className="mr-2 text-amber-500">›</span> Serviços & Preços</Link></li>
            <li><Link href="/gallery" className="hover:text-amber-500 transition-colors flex items-center"><span className="mr-2 text-amber-500">›</span> Nossa Galeria</Link></li>
            <li><Link href="/appointment" className="hover:text-amber-500 transition-colors flex items-center"><span className="mr-2 text-amber-500">›</span> Agendamentos</Link></li>
          </ul>
        </div>

        {/* Bloco 3: Contato */}
        <div>
          <h4 className="text-white font-bold mb-5 tracking-wide uppercase text-sm">Contato</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center">
              <span className="text-amber-500 mr-3 text-lg leading-none">📞</span>
              <span className="text-zinc-400">(81) 99906-9172</span>
            </li>
            <li className="flex items-center">
              <span className="text-amber-500 mr-3 text-lg leading-none">✉️</span>
              <a href="mailto:contatctmarcioflima@gmail.com" className="hover:text-amber-500 transition-colors">contatctmarcioflima@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Direitos Autorais e Links Legais */}
      <div className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-600 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} MarcioTec. Todos os direitos reservados.</p>
          <span className="hidden md:inline text-zinc-800">|</span>
          <div className="flex gap-3">
            <Link href="/terms-of-use" className="hover:text-amber-500 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-zinc-800">•</span>
            <Link href="/privacy-policy" className="hover:text-amber-500 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
        <p className="flex items-center">
          <span className="mr-1">Desenvolvido por</span>
          <span className="text-zinc-400 font-semibold hover:text-amber-500 transition-colors">Márcio e Lucas</span>
        </p>
      </div>
    </footer>
  );
}
