"use client";

import { useState } from "react";

interface Props {
  rotulo: string;
  confirmar: string;
  onConfirm: () => Promise<void> | void;
  className?: string;
}

/** Ação destrutiva em dois toques: o primeiro pergunta, o segundo executa. */
export default function ConfirmButton({ rotulo, confirmar, onConfirm, className = "btn btn-perigo" }: Props) {
  const [perguntando, setPerguntando] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  if (!perguntando) {
    return (
      <button type="button" className={className} onClick={() => setPerguntando(true)}>
        {rotulo}
      </button>
    );
  }

  return (
    <span className="inline-flex gap-2" role="group" aria-label={confirmar}>
      <button
        type="button"
        className="btn btn-primario"
        disabled={ocupado}
        autoFocus
        onClick={async () => {
          setOcupado(true);
          try {
            await onConfirm();
          } finally {
            setOcupado(false);
            setPerguntando(false);
          }
        }}
      >
        {confirmar}
      </button>
      <button type="button" className="btn btn-secundario" onClick={() => setPerguntando(false)}>
        Voltar
      </button>
    </span>
  );
}
