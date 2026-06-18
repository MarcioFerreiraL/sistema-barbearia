import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full">
      
      {/* SEÇÃO HERO (Destaque Principal) */}
      <section className="relative bg-zinc-900 text-white py-32 px-4 flex flex-col items-center text-center overflow-hidden">
        {/* Imagem de Fundo Escurecida (Puxada do Unsplash para visual profissional) */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070')] bg-cover bg-center"></div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight">
            Eleve seu <span className="text-amber-500">Estilo</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto font-light">
            Cortes de cabelo da mais alta qualidade. 
          </p>
          <Link href="/appointment" className="inline-block bg-amber-500 text-zinc-950 text-lg font-bold px-8 py-4 rounded-md hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
            Agende o seu corte
          </Link>
        </div>
      </section>

      {/* SEÇÃO DE DESTAQUES (Cards de Informação) */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          <div className="p-8 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-amber-500/50 transition-colors">
            <h3 className="text-xl font-bold mb-3 text-zinc-100">Barbeiros profissionais</h3>
            <p className="text-zinc-400">Nosso time é composto de barbeiros profissionais com certificados de cursos de alta qualidade e com muita experiência.</p>
          </div>
          
          <div className="p-8 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-amber-500/50 transition-colors">
            <h3 className="text-xl font-bold mb-3 text-zinc-100">Produtos</h3>
            <p className="text-zinc-400">Nós usamos os melhores produtos do mercado para melhor lhe atender.</p>
          </div>
          
          <div className="p-8 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-amber-500/50 transition-colors">
            <h3 className="text-xl font-bold mb-3 text-zinc-100">Agendamento Fácil</h3>
            <p className="text-zinc-400">Nosso sistema é feito para que você agende o seu corte facilmente.</p>
          </div>

        </div>
      </section>

    </div>
  );
}