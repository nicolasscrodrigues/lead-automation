# Integrations

Integrações confirmadas no projeto até o momento.

## 1. Supabase (Banco de Dados Postgres)

- **Status**: Confirmado e integrado em `lib/supabase/server.ts`.
- **Tabelas utilizadas**:
  - `public.leads` (leitura/escrita pendente nas rotas da aplicação; populada pelo fluxo de automação).
  - `public.lead_logs` (escrita confirmada via `POST /api/mock-crm/leads` com `evento = "crm_recebido"`).
- **Segurança**: RLS ativo em ambas as tabelas; comunicação server-side via cliente administrativo protegido por `server-only`.

## 2. CRM Simulado (Mock CRM)

- **Status**: Implementado e testado em `POST /api/mock-crm/leads`.
- **Funcionamento**:
  - Autenticação via header `X-Mock-Token` comparado em tempo constante (`crypto.timingSafeEqual`).
  - Suporte a modo de falha simulada (`MOCK_CRM_MODE=unavailable` retornando HTTP `503`).
  - Registra o recebimento exclusivamente na tabela `public.lead_logs`.

## Integrações Pendentes

- **Disparo de Webhook para o n8n (`POST /api/leads`)**: **pendente**.
