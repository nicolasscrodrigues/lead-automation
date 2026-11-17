# Lead Automation

Aplicação web para captura, qualificação automatizada e gestão de leads, construída como case técnico.

## Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **Validação**: Zod
- **Banco de Dados**: Supabase (PostgreSQL com RLS ativo)
- **Orquestração / Automação**: n8n (integração via webhook)

## Instalação e Execução Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie o arquivo de variáveis de ambiente a partir do exemplo e preencha os valores localmente:
   ```bash
   cp .env.example .env.local
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Para verificar tipagem e build de produção:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

## Status Atual do Projeto

### Implementado e Testado
- Scaffold Next.js (App Router, TypeScript, Tailwind CSS) e estrutura modular do projeto.
- Validação de variáveis de ambiente sob demanda (`lib/env.ts`).
- Cliente administrativo Supabase server-only (`lib/supabase/server.ts`).
- Endpoint de CRM simulado (`POST /api/mock-crm/leads`) com validação de token em tempo constante (`X-Mock-Token`), simulação de indisponibilidade (`MOCK_CRM_MODE=unavailable`) e registro de auditoria em `public.lead_logs`.
- Documentação técnica em `docs/`.

### Pendente
- Formulário público de captura de leads (`app/page.tsx`, `components/LeadForm.tsx`) e endpoint `POST /api/leads`.
- Autenticação administrativa (`app/login/page.tsx`, `app/api/auth/*`, `lib/auth/session.ts`, `middleware.ts`).
- Dashboard de leads, filtros e KPIs (`app/dashboard/page.tsx`, `components/LeadsTable.tsx`, `components/LeadFilters.tsx`, `components/KpiCards.tsx`).
- Export e documentação detalhada do workflow n8n (`docs/n8n-workflow.md`).
