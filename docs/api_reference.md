# Referência da API REST - BarberShop

Esta é a documentação dos endpoints HTTP expostos pela API RESTful do **BarberShop**. Todas as rotas (exceto as de autenticação e cadastro) exigem o cookie HTTP-only contendo um token JWT válido.

---

## 🔑 1. Autenticação e Autorização

### Login
Efetua a autenticação do usuário e retorna um token JWT. Um cookie HTTP-only chamado `token` é definido na resposta.
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

### Logout
Limpa o cookie de autenticação JWT, encerrando a sessão.
- **URL**: `/api/auth/logout`
- **Método**: `POST`
- **Acesso**: Autenticado
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

### Atualizar Agendamento
- **URL**: `/api/appointments/{id}/update`
- **Método**: `PATCH`
- **Acesso**: Autenticado (Administrador ou Barbeiro)
- **Corpo da Requisição**: Mesmos campos de criação.
- **Resposta (200 OK)**: Detalhes do agendamento atualizado.

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

- `GET /api/barbers` - Lista todos os barbeiros (Público/Autenticado).
- `GET /api/barbers/{id}` - Busca detalhes de um barbeiro por ID (Autenticado).
- `POST /api/barbers` - Cria um novo barbeiro no sistema (Admin).
  - *Corpo*: `{ "fullName", "email", "password", "phoneNumber" }`
- `PATCH /api/barbers/{id}` - Atualiza dados cadastrais de um barbeiro (Admin ou o próprio Barbeiro).
- `DELETE /api/barbers/{id}` - Exclui fisicamente um barbeiro (Admin).
- `PATCH /api/barbers/{id}/toggle-status` - Ativa ou inativa o barbeiro (Soft Delete) impedindo novos agendamentos (Admin).

---

## 👥 4. Clientes (`/api/customers`)

- `GET /api/customers` - Lista todos os clientes cadastrados (Admin).
- `GET /api/customers/{id}` - Detalhes do cliente (Admin ou o próprio Cliente).
- `POST /api/customers` - Realiza o cadastro de um novo cliente (Público - Auto-cadastro).
  - *Corpo*: `{ "fullName", "email", "password", "phoneNumber" }`
- `PATCH /api/customers/{id}` - Atualiza o perfil do cliente (Admin ou o próprio Cliente).
- `DELETE /api/customers/{id}` - Exclui o cliente (Admin).

---

## 🛠️ 5. Serviços (`/api/services`)

- `GET /api/services` - Lista todos os serviços ativos (Público/Autenticado).
- `GET /api/services/{id}` - Busca serviço por ID (Autenticado).
- `POST /api/services` - Cria um novo serviço no catálogo (Admin).
  - *Corpo*: `{ "name": "Barba Completa", "description": "Modelagem e toalha quente", "price": 45.00, "durationInMinutes": 30 }`
- `PATCH /api/services/{id}` - Atualiza dados do serviço (Admin).
- `DELETE /api/services/{id}` - Exclui fisicamente o serviço (Admin).
- `PATCH /api/services/{id}/toggle-status` - Ativa/Desativa o serviço no catálogo (Admin).

---

## ⏰ 6. Funcionamento (`/api/business-hours`)

### Obter Horário de Funcionamento Semanal
Retorna as configurações de abertura, fechamento e dias úteis da barbearia.
- **URL**: `/api/business-hours`
- **Método**: `GET`
- **Acesso**: Público/Autenticado
- **Resposta (200 OK)**:
  ```json
  [
    {
      "dayOfWeek": 1,
      "dayName": "Segunda-feira",
      "open": true,
      "openTime": "09:00",
      "closeTime": "19:00"
    },
    ...
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

- `GET /api/admins` - Lista todos os administradores cadastrados (Admin).
- `GET /api/admins/{id}` - Detalhes de um administrador (Admin).
- `POST /api/admins` - Cadastra um novo administrador (Admin).
- `PATCH /api/admins/{id}` - Atualiza dados cadastrais (Admin).
- `DELETE /api/admins/{id}` - Remove um administrador do sistema (Admin).
