"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Carrega dados assíncronos para uma tela. Busca quando `pronto` fica verdadeiro e de novo a cada
 * `recarregar()` (por exemplo, depois de uma ação). A função de busca pode mudar a cada render.
 */
export function useDados<T>(buscar: () => Promise<T>, pronto = true) {
  const [estado, setEstado] = useState<{ dados: T | null; erro: string }>({ dados: null, erro: "" });
  const [versao, setVersao] = useState(0);
  const buscarRef = useRef(buscar);

  useEffect(() => {
    buscarRef.current = buscar;
  });

  useEffect(() => {
    if (!pronto) return;
    let vivo = true;
    buscarRef.current().then(
      (dados) => vivo && setEstado({ dados, erro: "" }),
      (err) => vivo && setEstado((s) => ({ ...s, erro: err instanceof Error ? err.message : "Não foi possível carregar." })),
    );
    return () => {
      vivo = false;
    };
  }, [pronto, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { ...estado, recarregar };
}
