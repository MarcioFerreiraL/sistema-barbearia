/**
 * Serviço de Integração com a API Backend
 * 
 * Centraliza todas as chamadas HTTP para os endpoints REST do Spring Boot.
 * Implementa controle de autenticação automática, tratamento de erros de rede
 * e decodificação condicional de payloads em JSON.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Recupera o token JWT armazenado no localStorage do navegador.
 * Realiza verificação de ambiente (SSR vs CSR) para evitar erros no Next.js.
 * 
 * @returns Token JWT ou null se não estiver logado
 */
function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

/**
 * Função Wrapper para requisições Fetch contendo autenticação JWT automática.
 * Intercepta erros 401/403 para redirecionar o usuário para o login.
 * 
 * @param url Endpoint absoluto da requisição
 * @param options Configurações adicionais do fetch (método, body, headers)
 * @returns Promessa com o conteúdo decodificado da resposta
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  
  // Mescla o token de autorização e outros cabeçalhos fornecidos
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  // Se houver corpo na requisição, assume o formato JSON por padrão
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, { 
      ...options, 
      headers,
      credentials: "include" // Permite o envio de cookies se necessário
    });
  } catch (error: any) {
    console.error(`[NETWORK ERROR] Falha ao conectar a ${url}:`, error);
    throw new Error("Erro de conexão. Verifique se o servidor está online.");
  }
  
  // Intercepta respostas de token inválido ou expirado
  if (response.status === 401 || response.status === 403) {
    console.error(`[AUTH ERROR] Acesso não autorizado para ${url} (Status ${response.status})`);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Redireciona o usuário alertando sobre a expiração
      window.location.href = "/login?expired=true";
    }
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  
  // Tratamento de erros genéricos vindos do backend
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `Erro na requisição: ${response.statusText}`;
    console.error(`[API ERROR] ${response.status} - ${errorMessage} em ${url}`);
    throw new Error(errorMessage);
  }

  // Retorna null para respostas 204 No Content para evitar erros no parse de JSON vazio
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

/**
 * Autentica um usuário (Cliente, Barbeiro ou Administrador).
 * 
 * @param email E-mail de cadastro
 * @param password Senha em texto limpo
 * @returns Promessa contendo o token JWT gerado pelo backend
 */
export async function login(email: string, password: string): Promise<{ token: string }> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
  } catch (error: any) {
    console.error("[NETWORK ERROR] Falha na conexão de Login:", error);
    throw new Error("Erro ao conectar com o serviço de login.");
  }

  if (!response.ok) {
    console.error(`[LOGIN ERROR] Tentativa de login falhou para: ${email} (Status ${response.status})`);
    throw new Error("E-mail ou palavra-passe incorretos.");
  }

  return response.json();
}

/**
 * Efetua o logout do usuário notificando o backend e limpando as credenciais locais.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch (e) {
    console.error("[API] Erro ao invalidar sessão no backend:", e);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

/**
 * Registra um novo cliente público no sistema.
 * 
 * @param customerData Dados cadastrais do cliente
 * @returns Dados do cliente criado
 */
export async function registerCustomer(customerData: any): Promise<any> {
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

/**
 * Recupera todos os serviços cadastrados na barbearia.
 */
export async function getServices(): Promise<any[]> {
  return fetchWithAuth(`${BASE_URL}/services`);
}

/**
 * Recupera a lista completa de barbeiros cadastrados.
 */
export async function getBarbers(): Promise<any[]> {
  return fetchWithAuth(`${BASE_URL}/barbers`);
}

/**
 * Recupera todos os clientes cadastrados (Restrito a ADMIN/BARBER).
 */
export async function getCustomers(): Promise<any[]> {
  return fetchWithAuth(`${BASE_URL}/customers`);
}

/**
 * Recupera os agendamentos da barbearia (Filtrado automaticamente no backend por perfil).
 */
export async function getAppointments(): Promise<any[]> {
  return fetchWithAuth(`${BASE_URL}/appointments`);
}

/**
 * Cria um novo agendamento.
 * 
 * @param appointmentData Estrutura contendo id do cliente, barbeiro, serviço e horário de início
 */
export async function createAppointment(appointmentData: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/appointments`, {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
}

/**
 * Remove fisicamente um serviço do sistema (Restrito a ADMIN).
 */
export async function deleteService(id: number): Promise<void> {
  return fetchWithAuth(`${BASE_URL}/services/${id}`, {
    method: "DELETE",
  });
}

/**
 * Remove fisicamente um barbeiro do sistema (Restrito a ADMIN).
 */
export async function deleteBarber(id: string): Promise<void> {
  return fetchWithAuth(`${BASE_URL}/barbers/${id}`, {
    method: "DELETE",
  });
}

/**
 * Atualiza os dados cadastrais de um serviço existente (Restrito a ADMIN).
 */
export async function updateService(id: number, data: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Alterna a flag de atividade de um serviço (Restrito a ADMIN).
 */
export async function toggleServiceStatus(id: number): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/services/${id}/toggle-status`, {
    method: "PATCH",
  });
}

/**
 * Atualiza os dados de um barbeiro (Restrito a ADMIN ou próprio Barbeiro).
 */
export async function updateBarber(id: string, data: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/barbers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Alterna a flag de atividade de um barbeiro no painel (Restrito a ADMIN).
 */
export async function toggleBarberStatus(id: string): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/barbers/${id}/toggle-status`, {
    method: "PATCH",
  });
}

/**
 * Recupera os horários de funcionamento padrão da barbearia.
 */
export async function getBusinessHours(): Promise<any[]> {
  return fetchWithAuth(`${BASE_URL}/business-hours`);
}

/**
 * Altera a configuração de funcionamento de um dia específico da semana (Restrito a ADMIN).
 */
export async function updateBusinessHours(dayOfWeek: number, data: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/business-hours/${dayOfWeek}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Atualiza os dados pessoais de um cliente (Restrito a ADMIN ou próprio Cliente).
 */
export async function updateCustomer(id: string, data: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Recupera a listagem de administradores do sistema (Restrito a ADMIN).
 */
export async function getAdmins(): Promise<any[]> {
  return fetchWithAuth(`${BASE_URL}/admins`);
}

/**
 * Atualiza o cadastro de um administrador (Restrito a ADMIN).
 */
export async function updateAdmin(id: string, data: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/admins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Cancela um agendamento existente (Restrito a ADMIN, Barbeiro designado ou próprio Cliente).
 */
export async function cancelAppointment(id: string): Promise<void> {
  return fetchWithAuth(`${BASE_URL}/appointments/${id}/cancel`, {
    method: "PATCH",
  });
}

/**
 * Cadastra um novo barbeiro no sistema (Restrito a ADMIN).
 * 
 * @param barberData Dados cadastrais do barbeiro (nome, e-mail, telefone, senha)
 */
export async function createBarber(barberData: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/barbers`, {
    method: "POST",
    body: JSON.stringify(barberData),
  });
}

/**
 * Marca um agendamento como finalizado/concluído (Restrito a ADMIN ou Barbeiro designado).
 */
export async function completeAppointment(id: string): Promise<void> {
  return fetchWithAuth(`${BASE_URL}/appointments/${id}/complete`, {
    method: "PATCH",
  });
}

/**
 * Cadastra um novo serviço no catálogo do sistema (Restrito a ADMIN).
 * 
 * @param serviceData Dados cadastrais do serviço (nome, descrição, preço, duração)
 */
export async function createService(serviceData: any): Promise<any> {
  return fetchWithAuth(`${BASE_URL}/services`, {
    method: "POST",
    body: JSON.stringify(serviceData),
  });
}