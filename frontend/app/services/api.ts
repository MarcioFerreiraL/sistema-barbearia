const BASE_URL = "http://localhost:8080/api";

// Função para fazer Login e receber o Token
export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("E-mail ou palavra-passe incorretos.");
  }

  return response.json(); // Retorna o { token: "..." }
}

// Função para Registar um novo Cliente
export async function registerCustomer(customerData: any) {
  const response = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Erro ao registar utilizador.");
  }

  return response.json();
}