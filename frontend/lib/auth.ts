/**
 * Biblioteca Utilitária de Autenticação
 * 
 * Centraliza as operações de decodificação e validação do token JWT
 * no frontend, evitando duplicação de lógica (princípio DRY do Clean Code).
 */

export type Role = "CLIENT" | "ADMIN" | "BARBER" | null;

export interface UserInfo {
  id: string | null;
  email: string | null;
  role: Role;
  exp: number | null;
}

/**
 * Decodifica o payload de um token JWT de forma segura.
 * 
 * @param token Token JWT no formato 'header.payload.signature'
 * @returns O objeto de payload decodificado ou null caso o token seja inválido
 */
export function parseJwt(token: string): any {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("[AUTH] Erro ao decodificar token JWT:", error);
    return null;
  }
}

/**
 * Extrai as informações de usuário, role e expiração do token JWT.
 * Realiza o mapeamento correto da autoridade recebida do Spring Security.
 * 
 * @param token Token JWT ativo
 * @returns Objeto contendo as informações estruturadas do usuário logado
 */
export function getUserInfoFromToken(token: string): UserInfo {
  const payload = parseJwt(token);
  
  if (!payload) {
    return { id: null, email: null, role: null, exp: null };
  }

  const id = payload.id || null;
  const email = payload.sub || null;
  const exp = payload.exp || null;
  let role: Role = "CLIENT";

  // Mapeia a autoridade recebida do backend (ex: ROLE_ADMIN, ROLE_BARBER, ROLE_CUSTOMER)
  if (payload.role) {
    const rawRole = payload.role.replace("ROLE_", "");
    if (rawRole === "CUSTOMER") {
      role = "CLIENT";
    } else {
      role = rawRole as Role;
    }
  } else if (email && email.toLowerCase().includes("admin")) {
    // Fallback caso o payload não traga a role explicitamente
    role = "ADMIN";
  }

  return { id, email, role, exp };
}
