"use client";

import { useState } from "react";
import Link from "next/link";
import { setupAdmin } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

/** Cadastro de outro administrador (a API exige uma sessão de administrador). */
export default function NovoAdministrador() {
  const { showToast } = useToast();
  const [d, setD] = useState({ fullName: "", email: "", phoneNumber: "", password: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const campo = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await setupAdmin(d);
      showToast(`${d.fullName} já pode entrar como administrador.`, "success");
      setD({ fullName: "", email: "", phoneNumber: "", password: "" });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível cadastrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Link href="/admin/profile" className="btn-discreto font-bold">Voltar ao painel</Link>
      <h1 className="titulo mt-4 text-4xl">Cadastrar administrador</h1>
      <p className="mt-2 text-apagado">A pessoa terá acesso a tudo: equipe, preços, clientes e horários.</p>
      <form onSubmit={enviar} className="mt-8 space-y-5">
        <div>
          <label htmlFor="ad-nome" className="rotulo">Nome completo</label>
          <input id="ad-nome" className="campo" required value={d.fullName} onChange={campo("fullName")} />
        </div>
        <div>
          <label htmlFor="ad-email" className="rotulo">E-mail</label>
          <input id="ad-email" type="email" className="campo" required value={d.email} onChange={campo("email")} />
        </div>
        <div>
          <label htmlFor="ad-fone" className="rotulo">Celular</label>
          <input id="ad-fone" type="tel" className="campo" value={d.phoneNumber} onChange={campo("phoneNumber")} />
        </div>
        <div>
          <label htmlFor="ad-senha" className="rotulo">Senha inicial</label>
          <input id="ad-senha" type="password" autoComplete="new-password" minLength={6} className="campo" required value={d.password} onChange={campo("password")} />
        </div>
        {erro && <p role="alert" className="rounded-lg border-l-4 border-letreiro bg-papel p-3 font-bold text-letreiro-escuro">{erro}</p>}
        <button type="submit" className="btn btn-primario w-full" disabled={enviando}>{enviando ? "Cadastrando…" : "Cadastrar administrador"}</button>
      </form>
    </div>
  );
}
