# Referência da API REST - Barbearia do Zé

Esta é a documentação dos endpoints HTTP expostos pela API RESTful da **Barbearia do Zé**. Todas as rotas (exceto as públicas) exigem um token JWT válido enviado no cabeçalho `Authorization: Bearer <token>`.

---

## 🔑 1. Autenticação e Autorização

### Login
Efetua a autenticação do usuário e retorna um token JWT no corpo da resposta.
- **URL**: `/api/auth/login`
- **Método**: `POST`
- **Acesso**: Público
- **Corpo da Requisição**:
  ```json
  {
    "email": "admin@barbershop.com",
    "password": "SenhaSegura123"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Payload do Token JWT**:
  ```json
  {
    "iss": "barbeariadoze",
    "sub": "admin@barbershop.com",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "ROLE_ADMIN",
    "exp": 1719446400
  }
  ```

### Logout
Invalida a sessão no backend e limpa credenciais locais.
- **URL**: `/api/auth/logout`
- **Método**: `POST`
- **Acesso**: Público
- **Resposta (200 OK)**: Sem corpo.

---

## 📅 2. Agendamentos (`/api/appointments`)

### Listar Todos os Agendamentos
Retorna a lista de agendamentos. A resposta é filtrada automaticamente pelo papel do usuário autenticado:
- **Administrador**: Retorna todos os agendamentos do sistema.
- **Barbeiro**: Retorna apenas os seus próprios agendamentos designados.
- **Cliente**: Retorna apenas os seus próprios agendamentos realizados.
- **URL**: `/api/appointments`
- **Método**: `GET`
- **Acesso**: Autenticado
- **Resposta (200 OK)**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "8f8e8400-e29b-41d4-a716-446655440111",
      "customerName": "João da Silva",
      "barberId": "2f2e8400-e29b-41d4-a716-446655440222",
      "barberName": "Maurício Barber",
      "serviceName": "Corte de Cabelo Masculino",
      "startTime": "2026-06-25T14:00:00",
      "endTime": "2026-06-25T14:30:00",
      "status": "SCHEDULED"
    }
  ]
  ```

### Buscar Agendamento por ID
- **URL**: `/api/appointments/{id}`
- **Método**: `GET`
- **Acesso**: Autenticado (Dono do agendamento, barbeiro designado ou administrador)
- **Resposta (200 OK)**: Objeto do agendamento (conforme listagem).

### Criar Agendamento
Agenda um serviço com um profissional em um horário específico.
- **URL**: `/api/appointments`
- **Método**: `POST`
- **Acesso**: Autenticado (Clientes apenas para si mesmos; Administradores/Barbeiros livremente)
- **Corpo da Requisição**:
  ```json
  {
    "customerId": "8f8e8400-e29b-41d4-a716-446655440111",
    "barberId": "2f2e8400-e29b-41d4-a716-446655440222",
    "serviceItemId": 1,
    "startTime": "2026-06-25T14:00:00"
  }
  ```
- **Resposta (201 Created)**: Detalhes do agendamento criado.

### Cancelar Agendamento
Altera o status do agendamento para `CANCELLED`. Só é permitido se o status atual for `SCHEDULED` ou `CONFIRMED`.
- **URL**: `/api/appointments/{id}/cancel`
- **Método**: `PATCH`
- **Acesso**: Autenticado (Dono do agendamento, barbeiro designado ou administrador)
- **Resposta (204 No Content)**: Sem corpo.

### Concluir Agendamento
Altera o status do agendamento para `COMPLETED`.
- **URL**: `/api/appointments/{id}/complete`
- **Método**: `PATCH`
- **Acesso**: Autenticado (Apenas o barbeiro designado ou administradores)
- **Resposta (204 No Content)**: Sem corpo.

---

## 💈 3. Barbeiros (`/api/barbers`)

| Método | URL | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/barbers` | Autenticado | Lista todos os barbeiros. |
| `GET` | `/api/barbers/{id}` | Autenticado | Busca detalhes de um barbeiro por ID. |
| `POST` | `/api/barbers` | Admin | Cria um novo barbeiro. Corpo: `{ "fullName", "email", "password", "phoneNumber" }` |
| `PATCH` | `/api/barbers/{id}` | Admin ou Barbeiro | Atualiza dados cadastrais de um barbeiro. |
| `DELETE` | `/api/barbers/{id}` | Admin | Exclui fisicamente um barbeiro. |
| `PATCH` | `/api/barbers/{id}/toggle-status` | Admin | Ativa ou inativa o barbeiro (Soft Delete). |

---

## 👥 4. Clientes (`/api/customers`)

| Método | URL | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | Admin ou Barbeiro | Lista todos os clientes cadastrados. |
| `GET` | `/api/customers/{id}` | Autenticado | Busca detalhes de um cliente por ID. Qualquer usuário autenticado pode acessar (validação no Service). |
| `POST` | `/api/customers` | Público | Auto-cadastro de novos clientes. Corpo: `{ "fullName", "email", "password", "phoneNumber" }` |
| `PATCH` | `/api/customers/{id}` | Autenticado | Atualiza o perfil do cliente (Admin ou o próprio Cliente). |
| `DELETE` | `/api/customers/{id}` | Autenticado | Exclui o cliente (validação no Service). |

> **Nota:** A listagem geral (`GET /api/customers`) é restrita a Admin e Barbeiro. Clientes podem buscar seus próprios dados via `GET /api/customers/{id}` usando o ID contido no token JWT.

---

## 🛠️ 5. Serviços (`/api/services`)

| Método | URL | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/services` | Autenticado | Lista todos os serviços do catálogo. |
| `GET` | `/api/services/{id}` | Autenticado | Busca serviço por ID. |
| `POST` | `/api/services` | Admin | Cria um novo serviço. Corpo: `{ "name", "description", "price", "durationInMinutes" }` |
| `PATCH` | `/api/services/{id}` | Admin | Atualiza dados do serviço. |
| `DELETE` | `/api/services/{id}` | Admin | Exclui fisicamente o serviço. |
| `PATCH` | `/api/services/{id}/toggle-status` | Admin | Ativa/Desativa o serviço no catálogo (Soft Delete). |

---

## ⏰ 6. Funcionamento (`/api/business-hours`)

### Obter Horário de Funcionamento Semanal
Retorna as configurações de abertura, fechamento e dias úteis da barbearia.
- **URL**: `/api/business-hours`
- **Método**: `GET`
- **Acesso**: Autenticado
- **Resposta (200 OK)**:
  ```json
  [
    {
      "dayOfWeek": 1,
      "dayName": "Segunda-feira",
      "open": true,
      "openTime": "09:00",
      "closeTime": "19:00"
    }
  ]
  ```

### Atualizar Configuração de um Dia
- **URL**: `/api/business-hours/{dayOfWeek}`
- **Método**: `PUT`
- **Acesso**: Admin
- **Corpo da Requisição**:
  ```json
  {
    "open": true,
    "openTime": "08:30",
    "closeTime": "18:00"
  }
  ```
- **Resposta (200 OK)**: Configuração atualizada daquele dia.

---

## 👑 7. Administradores (`/api/admins`)

| Método | URL | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admins` | Admin | Lista todos os administradores cadastrados. |
| `GET` | `/api/admins/{id}` | Admin | Detalhes de um administrador. |
| `POST` | `/api/admins` | Admin | Cadastra um novo administrador. |
| `PATCH` | `/api/admins/{id}` | Admin | Atualiza dados cadastrais. |
| `DELETE` | `/api/admins/{id}` | Admin | Remove um administrador do sistema. |

---

## 📄 8. Documentação OpenAPI/Swagger

Os endpoints de documentação são públicos e não exigem autenticação:

| URL | Descrição |
| :--- | :--- |
| `/swagger-ui.html` | Interface interativa Swagger UI |
| `/v3/api-docs` | Especificação OpenAPI em JSON |
| `/redoc.html` | Documentação alternativa via ReDoc |
