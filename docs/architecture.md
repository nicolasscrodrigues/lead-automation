# Architecture

Arquitetura da aplicação **lead-automation**, construída com Next.js 16 (App Router), TypeScript, Tailwind CSS e Supabase.

## Componentes Implementados

- **Configuração e Validação de Ambiente (`lib/env.ts`)**:
  - Validação sob demanda via `getEnv(keys)` com Zod, verificando apenas as variáveis exigidas pelo módulo/rota em execução.
- **Cliente Supabase Server-Only (`lib/supabase/server.ts`)**:
  - Protegido por `import "server-only"`, instancia o cliente administrativo do Supabase sob demanda (`getSupabaseAdmin()`) com `persistSession: false`.
- **Validação de Payload (`lib/validation/lead.ts`)**:
  - Schema Zod (`qualifiedLeadSchema`) para validação dos dados recebidos no mock de CRM.
- **Mock de CRM (`app/api/mock-crm/leads/route.ts`)**:
  - Route Handler `POST` que valida o header `X-Mock-Token` com `crypto.timingSafeEqual`, simula indisponibilidade (`MOCK_CRM_MODE=unavailable` -> `503`), valida o corpo com Zod e grava logs de auditoria em `public.lead_logs` (`evento = "crm_recebido"`).

## Componentes Pendentes (Placeholders Atuais)

- **Formulário Público de Captura de Leads**:
  - `app/page.tsx` e `components/LeadForm.tsx` (**pendente**).
  - Endpoint `app/api/leads/route.ts` (**pendente**).
- **Automação e Orquestração (n8n)**:
  - Integração via webhook com o n8n (**pendente**).
- **Autenticação e Sessão Administrativa**:
  - `lib/auth/session.ts`, `middleware.ts`, `app/login/page.tsx`, `components/LoginForm.tsx`, `app/api/auth/login/route.ts` e `app/api/auth/logout/route.ts` (**pendente**).
- **Dashboard Administrativo**:
  - `app/dashboard/page.tsx`, `components/LeadsTable.tsx`, `components/LeadFilters.tsx` e `components/KpiCards.tsx` (**pendente**).

## Decisões

- Separação estrita entre código de servidor (`server-only`) e cliente para impedir exposição de credenciais administrativas do Supabase.
- Validação de variáveis de ambiente sob demanda (`getEnv`) para permitir build estático/coleta de rotas sem exigir variáveis de módulos ainda não utilizados pela rota.
