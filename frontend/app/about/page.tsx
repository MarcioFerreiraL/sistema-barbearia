import Link from "next/link";

export default function About() {
  return (
    <div className="w-full bg-zinc-950">
      
      {/* Cabeçalho da Página */}
      <div className="bg-zinc-950 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Sobre <span className="text-amber-500">Nós</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Mais do que um corte de cabelo. Uma experiência única.
        </p>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-6xl mx-auto py-20 px-4 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Texto e Informações */}
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-6">Nossa História</h2>
          <p className="text-lg text-zinc-300 leading-relaxed max-w-3xl mx-auto">
            Fundado desde 2015. Com o objetivo de ser uma referência regional, a Barbearia do Zé foi criada com o intuito de oferecer uma experiência única para nossos clientes.
          </p>
          <p className="text-zinc-400 mb-8 leading-relaxed text-lg">
            Trabalhamos com os melhores equipamentos e produtos do mercados. Temos os melhores barbeiros profissionais e nosso ambiente é aconchegante.
          </p>
          
          {/* Blocos de Estatísticas */}
          <div className="flex gap-4">
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 w-full text-center shadow-lg">
              <span className="block text-4xl font-black text-amber-500 mb-1">10 anos</span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">De Anos de Experiências</span>
            </div>
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 w-full text-center shadow-lg">
              <span className="block text-4xl font-black text-amber-500 mb-1">+5mil</span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Clientes Felizes</span>
            </div>
          </div>
        </div>

        {/* Imagem Ilustrativa (Foto de barbearia do Unsplash) */}
        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074')] bg-cover bg-center"></div>
        </div>
        
      </div>
    </div>
  );
}
