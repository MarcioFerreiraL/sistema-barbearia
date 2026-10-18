"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DEMO, DEMO_USERS, getMe, login as apiLogin, registerCustomer } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { inicioDoPerfil } from "../../lib/perfil";

type Modo = "entrar" | "criar";

function Entrar() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aceitou, setAceitou] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const expirou = useSearchParams().get("expired") === "true";
  const [erro, setErro] = useState(expirou ? "Sua sessão expirou. Entre de novo para continuar." : "");

  async function entrarCom(e: string, senha: string) {
    await apiLogin(e, senha);
    await login();
    const eu = await getMe();
    router.push(inicioDoPerfil(eu?.role));
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      if (modo === "criar") {
        if (!aceitou) throw new Error("Para criar a conta, aceite os termos de uso e a política de privacidade.");
        await registerCustomer({ fullName, email, password, phoneNumber });
        showToast("Conta criada. Agora é só marcar seu horário.", "success");
      }
      await entrarCom(email, password);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  async function entrarDemo(perfil: keyof typeof DEMO_USERS) {
    setErro("");
    setEnviando(true);
    try {
      await entrarCom(DEMO_USERS[perfil].email, DEMO_USERS[perfil].password);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar.");
      setEnviando(false);
    }
  }

  const criando = modo === "criar";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
      {DEMO && (
        <section aria-labelledby="demo-titulo" className="md:order-2">
          <div className="rounded-2xl border-[6px] border-anil bg-quadro p-6 text-cal shadow-[8px_8px_0_var(--color-acafrao)]">
            <h2 id="demo-titulo" className="titulo text-2xl text-papel">Entrar sem senha</h2>
            <p className="mt-2 text-cal/85">Escolha um perfil para ver o sistema por dentro. Os dados são de exemplo.</p>
            <ul className="mt-6 space-y-3">
              {(Object.keys(DEMO_USERS) as (keyof typeof DEMO_USERS)[]).map((perfil) => (
                <li key={perfil}>
                  <button
                    type="button"
                    data-demo-login={perfil}
                    disabled={enviando}
                    onClick={() => entrarDemo(perfil)}
                    className="btn w-full justify-between bg-papel text-left text-anil hover:bg-cal"
                  >
                    <span>
                      <span className="block">Entrar como {DEMO_USERS[perfil].label.toLowerCase()}</span>
                      <span className="block text-sm font-normal text-apagado">{DEMO_USERS[perfil].name}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="form-titulo" className={DEMO ? "" : "md:col-span-2 md:mx-auto md:w-full md:max-w-md"}>
        <h1 id="form-titulo" className="titulo text-4xl">{criando ? "Criar conta" : "Entrar"}</h1>
        <p className="mt-2 text-apagado">
          {criando ? "Com a conta você marca, acompanha e cancela seus horários." : "Use o e-mail e a senha da sua conta."}
        </p>

        <form onSubmit={enviar} className="mt-8 space-y-5" noValidate={false}>
          {criando && (
            <div>
              <label htmlFor="nome" className="rotulo">Nome completo</label>
              <input id="nome" className="campo" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="rotulo">E-mail</label>
            <input id="email" type="email" className="campo" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {criando && (
            <div>
              <label htmlFor="telefone" className="rotulo">Celular</label>
              <input id="telefone" type="tel" inputMode="tel" className="campo" autoComplete="tel" placeholder="(81) 90000-0000" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
          )}
          <div>
            <label htmlFor="senha" className="rotulo">Senha</label>
            <div className="flex gap-2">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                className="campo"
                autoComplete={criando ? "new-password" : "current-password"}
                minLength={criando ? 6 : undefined}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={criando ? "senha-dica" : undefined}
              />
              <button type="button" className="btn btn-secundario shrink-0 px-3" onClick={() => setMostrarSenha((v) => !v)} aria-pressed={mostrarSenha}>
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {criando && <p id="senha-dica" className="mt-1 text-sm text-apagado">Pelo menos 6 caracteres.</p>}
          </div>
          {criando && (
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 size-5 accent-anil" checked={aceitou} onChange={(e) => setAceitou(e.target.checked)} />
              <span>
                Li e aceito os <Link href="/terms-of-use" className="font-bold underline">termos de uso</Link> e a{" "}
                <Link href="/privacy-policy" className="font-bold underline">política de privacidade</Link>.
              </span>
            </label>
          )}

          {erro && (
            <p role="alert" className="rounded-lg border-l-4 border-letreiro bg-papel p-3 font-bold text-letreiro-escuro">
              {erro}
            </p>
          )}

          <button type="submit" disabled={enviando} className="btn btn-primario w-full text-lg">
            {enviando ? "Aguarde…" : criando ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <p className="mt-6">
          {criando ? "Já tem conta? " : "Primeira vez por aqui? "}
          <button type="button" className="btn-discreto font-bold" onClick={() => { setModo(criando ? "entrar" : "criar"); setErro(""); }}>
            {criando ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams precisa de Suspense no build estático.
  return (
    <Suspense>
      <Entrar />
    </Suspense>
  );
}
