# Architecture

Arquitetura da aplicação **lead-automation**, construída com Next.js 16 (App Router), TypeScript, Tailwind CSS e Supabase.

## Componentes Implementados

- **Configuração e Validação de Ambiente (`lib/env.ts`)**:
  - Validação sob demanda via `getEnv(keys)` com Zod, verificando apenas as variáveis exigidas pelo módulo/rota em execução.
- **Cliente Supabase Server-Only (`lib/supabase/server.ts`)**:
  - Protegido por `import "server-only"`, instancia o cliente administrativo do Supabase sob demanda (`getSupabaseAdmin()`) com `persistSession: false`.
- **Validação de Payload (`lib/validation/lead.ts`)**:
  - `leadFormSchema`: valida os dados do formulário público (`nome`, `email`, `telefone`, `empresa`, `cargo` obrigatórios, com `trim` e máximo de 200 caracteres).
  - `qualifiedLeadSchema`: valida os dados recebidos pelo endpoint de mock do CRM.
- **Formulário Público de Captura de Leads (`app/page.tsx` e `components/LeadForm.tsx`)**:
  - Componente cliente (`"use client"`) renderizado na página inicial (`/`), com controle de envio (botão desabilitado durante submissão) e feedback visual de sucesso ou erro.
- **Proxy de Submissão para o n8n (`app/api/leads/route.ts`)**:
  - Route Handler `POST` que valida o payload com `leadFormSchema` e encaminha os dados via `fetch` para o webhook configurado em `N8N_WEBHOOK_URL` com timeout de 10 segundos (`AbortSignal.timeout(10000)`), sem gravar diretamente no Supabase e sem expor a URL ou resposta bruta do webhook.
- **Mock de CRM (`app/api/mock-crm/leads/route.ts`)**:
  - Route Handler `POST` que valida o header `X-Mock-Token` com `crypto.timingSafeEqual`, simula indisponibilidade (`MOCK_CRM_MODE=unavailable` -> `503`), valida o corpo com `qualifiedLeadSchema` e grava logs de auditoria em `public.lead_logs` (`evento = "crm_recebido"`).

## Componentes Pendentes (Placeholders Atuais)

- **Autenticação e Sessão Administrativa**:
  - `lib/auth/session.ts`, `middleware.ts`, `app/login/page.tsx`, `components/LoginForm.tsx`, `app/api/auth/login/route.ts` e `app/api/auth/logout/route.ts` (**pendente**).
- **Dashboard Administrativo**:
  - `app/dashboard/page.tsx`, `components/LeadsTable.tsx`, `components/LeadFilters.tsx` e `components/KpiCards.tsx` (**pendente**).

## Decisões

- Separação estrita entre código de servidor (`server-only`) e cliente para impedir exposição de credenciais administrativas do Supabase e da URL do webhook do n8n.
- Validação de variáveis de ambiente sob demanda (`getEnv`) para permitir build estático/coleta de rotas sem exigir variáveis de módulos ainda não utilizados pela rota.
