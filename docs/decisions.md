# Decisions

Registro de decisões arquiteturais e técnicas tomadas durante a implementação do projeto.

## 1. Validação de Variáveis de Ambiente Sob Demanda (`getEnv`)

- **Contexto**: Na implementação inicial de `lib/env.ts`, a validação de todas as 9 variáveis de ambiente era executada imediatamente na carga do módulo (`export const env = validateEnv()`). Durante o `npm run build`, a etapa `Collecting page data` do Next.js importou a rota `/api/mock-crm/leads` e falhou porque variáveis de etapas futuras (como `ADMIN_USERNAME` e `SESSION_SECRET`) ainda não estavam preenchidas.
- **Decisão**: Substituir a validação eager na importação pela função `getEnv(keys)` em `lib/env.ts` e instanciar o cliente do Supabase sob demanda via `getSupabaseAdmin()` em `lib/supabase/server.ts`. Cada Route Handler valida apenas as variáveis necessárias para sua própria execução.

## 2. Uso do Runtime Padrão nos Route Handlers (Conflito com `cacheComponents`)

- **Contexto**: O scaffold do Next.js 16.4.6 configurou `cacheComponents: true` em `next.config.ts`. Ao declarar `export const runtime = "nodejs"` em `app/api/mock-crm/leads/route.ts`, o Turbopack falhou no build com o erro: `Route segment config "runtime" is not compatible with nextConfig.cacheComponents`.
- **Decisão**: Remover `export const runtime = "nodejs"` da rota e utilizar o runtime padrão do App Router no Next.js 16 (que já executa em Node.js e suporta o módulo nativo `node:crypto`), sem alterar `next.config.ts`.

## 3. Mock de CRM Protegido por Token em Tempo Constante

- **Contexto**: O endpoint `POST /api/mock-crm/leads` simula um sistema externo de CRM recebendo leads qualificados.
- **Decisão**: Exigir o header `X-Mock-Token` validado contra `MOCK_CRM_TOKEN` utilizando `crypto.timingSafeEqual` (comparação em tempo constante) e permitir simulação de falha externa HTTP `503` quando `MOCK_CRM_MODE=unavailable`.

## 4. Escrita do Mock CRM Exclusivamente em `public.lead_logs`

- **Contexto**: Necessidade de comprovar o recebimento pelo CRM simulado sem duplicar ou sobrescrever o registro principal do lead.
- **Decisão**: O endpoint `/api/mock-crm/leads` nunca grava na tabela `public.leads`. Ele registra apenas um evento de auditoria em `public.lead_logs` com `evento = "crm_recebido"`, `status = "sucesso"` e `detalhes` contendo o payload + `{ mock: true }`.
