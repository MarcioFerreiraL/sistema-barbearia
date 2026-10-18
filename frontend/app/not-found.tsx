import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="letreiro text-7xl text-letreiro">404</p>
      <h1 className="titulo mt-6 text-3xl">Essa página não existe</h1>
      <p className="mt-3 text-lg text-apagado">O endereço pode ter mudado. Volte para o início ou marque seu horário.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-secundario">Ir para o início</Link>
        <Link href="/appointment" className="btn btn-primario">Marcar horário</Link>
      </div>
    </div>
  );
}
