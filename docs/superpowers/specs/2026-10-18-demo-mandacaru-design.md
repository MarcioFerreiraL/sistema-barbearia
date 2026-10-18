# Demo pública e nova identidade (Mandacaru Barbearia)

## Por quê

O Márcio quer uma demo de cada projeto principal no ar, ligada ao estudo de caso em
marciodev.com/projetos/barbearia. A demo serve para um recrutador ou um dono de barbearia
abrir no celular e usar os três perfis em segundos, sem servidor por trás.

## Decisões do Márcio

- Só frontend, com dados de exemplo no navegador (sem backend nem banco no ar).
- Redesenho completo, mantendo Next.js; identidade nova (o nome "Barbearia do Zé" sai).
- Começar pela barbearia; a assistência técnica vem depois, no mesmo molde.

## Como a demo funciona

- `NEXT_PUBLIC_DEMO=1` no build troca o cliente HTTP (`app/services/http.ts`) por um
  backend em memória (`app/services/demo/`), com as mesmas funções e assinaturas.
  Sem a variável, o frontend fala com a API Spring Boot como antes.
- O backend de demo segue as regras do `AppointmentService`: nada no passado, dia fechado,
  fora do expediente (início + duração ≤ fechamento), barbeiro ou serviço inativo,
  conflito de horário com agendamento não cancelado do mesmo barbeiro; cancelar só o que
  não foi cancelado nem concluído; concluir só depois do início, pelo barbeiro designado
  ou admin; cliente só vê e cria os próprios agendamentos.
- Dados ficam no `localStorage` do visitante; os agendamentos de exemplo são gerados em
  relação à data de hoje, para a agenda nunca parecer vazia ou velha.
- Login com um clique por perfil (cliente, barbeiro, admin) e botão "Restaurar dados de
  exemplo". Faixa fixa avisando que é demonstração com dados fictícios.
- Build estático (`output: "export"`) publicado como Worker de assets estáticos da
  Cloudflare em `barbearia.marciodev.com`.

## Identidade

- Nome fictício: Mandacaru Barbearia, Surubim (PE).
- Conceito: letreiro pintado à mão (abridores de letras de Pernambuco) e a tabela de
  preços pintada na parede.
- Cores: cal `#EEF3EF` (fundo), anil `#1D2A4D` (texto e quadro), vermelho de letreiro
  `#B5262B`, açafrão `#E2A529` (sombra das letras), branco nas superfícies. Sem verde.
- Tipos: Alfa Slab One só no letreiro e títulos, com sombra deslocada em açafrão;
  Atkinson Hyperlegible no resto.
- Sem fotos externas; a galeria sai.

## Fora do escopo

- Mudanças no backend.
- Integração com WhatsApp ou pagamentos.
