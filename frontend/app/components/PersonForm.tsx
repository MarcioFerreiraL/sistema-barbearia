"use client";

import { useState } from "react";
import type { Person, PersonRequest } from "../services/types";

interface Props {
  pessoa: Person;
  salvar: (dados: Partial<PersonRequest>) => Promise<unknown>;
  titulo?: string;
}

/** Dados pessoais com troca de senha opcional (perfis do cliente, do barbeiro e da dona). */
export default function PersonForm({ pessoa, salvar, titulo = "Seus dados" }: Props) {
  const [dados, setDados] = useState({ fullName: pessoa.fullName, email: pessoa.email, phoneNumber: pessoa.phoneNumber ?? "", password: "" });
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const mudar = (campo: keyof typeof dados) => (e: React.ChangeEvent<HTMLInputElement>) => setDados((d) => ({ ...d, [campo]: e.target.value }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setEnviando(true);
    try {
      const { password, ...resto } = dados;
      await salvar(password ? { ...resto, password } : resto);
      setDados((d) => ({ ...d, password: "" }));
      setMsg({ tipo: "ok", texto: "Dados salvos." });
    } catch (err) {
      setMsg({ tipo: "erro", texto: err instanceof Error ? err.message : "Não foi possível salvar." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="folha space-y-4 p-5" aria-labelledby="dados-titulo">
      <h2 id="dados-titulo" className="text-xl font-bold">{titulo}</h2>
      <div>
        <label htmlFor="pf-nome" className="rotulo">Nome completo</label>
        <input id="pf-nome" className="campo" autoComplete="name" required value={dados.fullName} onChange={mudar("fullName")} />
      </div>
      <div>
        <label htmlFor="pf-email" className="rotulo">E-mail</label>
        <input id="pf-email" type="email" className="campo" autoComplete="email" required value={dados.email} onChange={mudar("email")} />
      </div>
      <div>
        <label htmlFor="pf-fone" className="rotulo">Celular</label>
        <input id="pf-fone" type="tel" className="campo" autoComplete="tel" value={dados.phoneNumber} onChange={mudar("phoneNumber")} />
      </div>
      <div>
        <label htmlFor="pf-senha" className="rotulo">Nova senha</label>
        <input id="pf-senha" type="password" className="campo" autoComplete="new-password" minLength={6} value={dados.password} onChange={mudar("password")} aria-describedby="pf-senha-dica" />
        <p id="pf-senha-dica" className="mt-1 text-sm text-apagado">Deixe em branco para manter a senha atual.</p>
      </div>
      {msg && (
        <p role={msg.tipo === "erro" ? "alert" : "status"} className={`font-bold ${msg.tipo === "erro" ? "text-letreiro-escuro" : ""}`}>
          {msg.texto}
        </p>
      )}
      <button type="submit" className="btn btn-primario" disabled={enviando}>
        {enviando ? "Salvando…" : "Salvar dados"}
      </button>
    </form>
  );
}
