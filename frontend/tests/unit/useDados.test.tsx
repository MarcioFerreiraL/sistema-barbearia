// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDados } from "../../lib/useDados";

describe("useDados", () => {
  it("carrega e expõe os dados", async () => {
    const { result } = renderHook(() => useDados(async () => 42));
    expect(result.current.dados).toBeNull();
    await waitFor(() => expect(result.current.dados).toBe(42));
  });

  it("expõe a mensagem de erro", async () => {
    const buscar = async () => { throw new Error("falhou"); };
    const { result } = renderHook(() => useDados(buscar));
    await waitFor(() => expect(result.current.erro).toBe("falhou"));
  });

  it("recarregar busca de novo", async () => {
    let n = 0;
    const buscar = async () => ++n;
    const { result } = renderHook(() => useDados(buscar));
    await waitFor(() => expect(result.current.dados).toBe(1));
    act(() => result.current.recarregar());
    await waitFor(() => expect(result.current.dados).toBe(2));
  });

  it("não busca enquanto não estiver pronto", async () => {
    let chamou = false;
    const buscar = async () => { chamou = true; return 1; };
    renderHook(() => useDados(buscar, false));
    await new Promise((r) => setTimeout(r, 20));
    expect(chamou).toBe(false);
  });
});
