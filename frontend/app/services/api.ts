const BASE_URL = "http://localhost:8080/api";

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Erro na requisição: ${response.statusText}`);
  }

  // Verifica se tem body antes de tentar fazer parse (para 204 No Content)
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

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

export async function getServices() {
  return fetchWithAuth(`${BASE_URL}/services`);
}

export async function getBarbers() {
  return fetchWithAuth(`${BASE_URL}/barbers`);
}

export async function getCustomers() {
  return fetchWithAuth(`${BASE_URL}/customers`);
}

export async function getAppointments() {
  return fetchWithAuth(`${BASE_URL}/appointments`);
}

export async function createAppointment(appointmentData: any) {
  return fetchWithAuth(`${BASE_URL}/appointments`, {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
}