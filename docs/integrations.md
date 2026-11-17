# Integrations

Integrações confirmadas e implementadas no projeto.

## 1. Webhook n8n (Destino da Submissão de Leads)

- **Status**: Integrado no backend via `POST /api/leads`.
- **Funcionamento**:
  - O formulário público (`components/LeadForm.tsx`) envia os dados para `/api/leads`.
  - O endpoint valida os campos (`leadFormSchema`) e realiza um `POST` JSON para o endereço configurado na variável de ambiente `N8N_WEBHOOK_URL` com timeout de 10 segundos (`AbortSignal.timeout`).
  - Se o n8n responder `2xx`, retorna HTTP `200` (`{ ok: true }`). Em caso de erro ou timeout, retorna HTTP `502` com mensagem genérica, sem expor a URL do webhook nem a resposta bruta do n8n.

## 2. Supabase (Banco de Dados Postgres)

- **Status**: Confirmado e integrado em `lib/supabase/server.ts`.
- **Tabelas utilizadas**:
  - `public.leads` (populada pelo fluxo de automação; leitura no dashboard pendente).
  - `public.lead_logs` (escrita confirmada via `POST /api/mock-crm/leads` com `evento = "crm_recebido"`).
- **Segurança**: RLS ativo em ambas as tabelas; comunicação server-side via cliente administrativo protegido por `server-only`.

## 3. CRM Simulado (Mock CRM)

- **Status**: Implementado e testado em `POST /api/mock-crm/leads`.
- **Funcionamento**:
  - Autenticação via header `X-Mock-Token` comparado em tempo constante (`crypto.timingSafeEqual`).
  - Suporte a modo de falha simulada (`MOCK_CRM_MODE=unavailable` retornando HTTP `503`).
  - Registra o recebimento exclusivamente na tabela `public.lead_logs`.
