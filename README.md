
# BarberShop - Sistema de Gestão e Agendamento para Barbearias

## 📖 Contexto do Projeto

Este projeto consiste no desenvolvimento de uma aplicação web completa (Full-Stack) voltada para a gestão e automação de agendamentos de uma barbearia profissional. O objetivo principal é digitalizar o processo de reservas, eliminando falhas como sobreposição de horários e ineficiências de comunicação, além de fornecer um painel de controle para a equipe gerenciar suas rotinas.

A plataforma permite que clientes realizem cadastros, visualizem o catálogo, escolham profissionais e selecionem horários disponíveis de forma dinâmica. O sistema atende aos requisitos de engenharia de software integrando um front-end moderno, uma API RESTful robusta e um banco de dados relacional para persistência transacional.

## 🚀 Funcionalidades e Casos de Uso Principais

- **Vitrine Digital:** Catálogo de serviços com preços e duração estimada.
- **Agendamento Inteligente:** Interface em etapa única para escolha de serviço, profissional e horário, com validação de concorrência e cálculo de disponibilidade.
- **Painel do Cliente:** Área restrita para visualização do histórico e cancelamento de agendamentos via ID.
- **Painel do Profissional/Admin:** Visualização da agenda diária e alteração do status dos atendimentos.
- **Segurança (Bônus):** Autenticação de usuários via token JWT e Controle de Acesso Baseado em Funções (RBAC).

## Protótipo de baixa fidelidade (Figma)

[Clique aqui para ver o protótipo de baixa fidelidade](https://www.figma.com/proto/CwY0O0aQ68XZcSvtAhbghI/Prot%C3%B3tipo---Barbearia?node-id=3-2&t=eWMBRIBa3ZeJAf1a-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=3%3A2)

## Documentação

### Diagrama de casos de uso

![diagrama de casos de uso](docs/diagram_use_case.png)

### Diagrama de classes

![diagrama de casos de uso](docs/diagram_classes.png)
## 💻 Tecnologias Utilizadas

**Front-end:**
- Next.js
- React.js
- Tailwind CSS

**Back-end & API REST:**
- Java 
- Spring Boot 4 (Spring Web, Spring Data JPA, Spring Security)
- Autenticação JSON Web Tokens (JWT)

**Banco de Dados:**
- PostgreSQL

## 📁 Estrutura do Repositório

O projeto adota a arquitetura de repositório único para facilitar a avaliação e o versionamento:

- `/frontend` – Contém toda a aplicação Next.js, páginas e componentes de interface.
- `/backend` – Contém a API RESTful desenvolvida em Spring Boot e suas camadas lógicas.
- `/docs` – Armazena artefatos de documentação, incluindo links do Figma, Diagramas de Casos de Uso e Diagramas de Classes.

## ⚙️ Instruções de Instalação e Execução

### Pré-requisitos

- Node.js (v18+)
- Java JDK (21 ou superior) e Maven
- PostgreSQL instalado e rodando localmente (porta 5432)

### 1. Rodando o Front-end

* Navegue até o diretório do front-end: cd frontend
* Instale as dependências: npm install
* Inicie o servidor de desenvolvimento: npm run dev
* Acesse no navegador: http://localhost:3000

### 2. Rodando o Back-end

*    Navegue até o diretório do back-end: cd backend

*    Configure as credenciais do seu banco de dados local no arquivo src/main/resources/application.properties.

*    Compile e rode o projeto com Maven: mvn spring-boot:run

*    A API estará disponível para receber requisições em: http://localhost:8080
