import type { Role } from "../app/services/types";

/** Para onde cada perfil vai depois de entrar. */
export function inicioDoPerfil(role: Role | string | null | undefined): string {
  if (role === "ADMIN") return "/admin";
  if (role === "BARBER") return "/barber-panel";
  return "/appointment";
}
