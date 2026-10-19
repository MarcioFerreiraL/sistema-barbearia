"use client";

import { useEffect, useState } from "react";
import { getBarbers, updateBarber } from "../../services/api";
import type { Person } from "../../services/types";
import { useAuth } from "../../contexts/AuthContext";
import PersonForm from "../../components/PersonForm";
import { Carregando, Falha } from "../../components/ui/kit";

export default function DadosDoBarbeiro() {
  const { userId } = useAuth();
  const [eu, setEu] = useState<Person | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!userId) return;
    getBarbers()
      .then((b: Person[]) => setEu(b.find((x) => x.id === userId) ?? null))
      .catch((err) => setErro(err instanceof Error ? err.message : "Não foi possível carregar seus dados."));
  }, [userId]);

  if (erro) return <Falha texto={erro} />;
  if (!eu) return <Carregando />;

  return (
    <div className="max-w-xl">
      <h1 className="titulo mb-6 text-4xl">Meus dados</h1>
      <PersonForm
        pessoa={eu}
        titulo="Dados de contato e senha"
        salvar={async (d) => setEu(await updateBarber(eu.id, d))}
      />
    </div>
  );
}
