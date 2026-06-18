export default function Gallery() {
  // Lista de imagens do Unsplash para preencher o portfólio
  const photos = [
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800",
    "https://images.unsplash.com/photo-1520338661084-680395057c93?q=80&w=800",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=800",
  ];

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-50 mb-4">
          Nossos <span className="text-amber-500">Trabalhos</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
          Fotos da nossa barbearia.
        </p>
      </div>

      {/* Grid de Fotos 3 colunas no PC, 1 coluna no celular */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
        {photos.map((url, index) => (
          <div 
            key={index} 
            className="relative h-80 rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-shadow"
          >
            {/* Imagem de Fundo com efeito de Zoom suave */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${url})` }}
            ></div>
            {/* Película escura que aparece ao passar o mouse */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
          </div>
        ))}
      </div>

    </div>
  );
}
