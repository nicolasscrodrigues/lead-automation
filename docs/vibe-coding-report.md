# Vibe Coding Report

Relatório transparente do processo de desenvolvimento assistido por IA, incluindo problemas reais encontrados e como foram resolvidos.

## Erros e Problemas Encontrados

1. **Uso de flag inválida `--skip-install` / prompt interativo no `npx create-next-app`**:
   - Na tentativa inicial de scaffold com `npx create-next-app@latest`, a ausência da flag `--yes` para o próprio `npx` fez o comando aguardar confirmação interativa no terminal (`Ok to proceed? (y)`), travando a execução em segundo plano. Além disso, flags como `--skip-install` não são válidas nessa combinação de CLI.
   - **Correção**: O processo travado foi cancelado e reexecutado com `npx --yes create-next-app@latest ... --yes`.

2. **Arquivos vazios (`0 bytes`) quebrando `tsc` e `next build`**:
   - Na Etapa 0, os arquivos de rotas (`app/**/page.tsx`, `app/api/**/route.ts`) e `middleware.ts` foram criados inicialmente com `0 bytes`. O gerador de tipos `.next/types/validator.ts` do Next.js 16 acusou `is not a module` (TS2306) e o build falhou por falta de função exportada no `middleware.ts`.
   - **Correção**: Foram adicionados placeholders mínimos sem lógica (`export default function Page() { return null; }`, `export {};` e `export function middleware() {}`).

3. **Migration SQL como placeholder**:
   - Como o schema das tabelas `leads` e `lead_logs` já havia sido criado manualmente diretamente no Supabase com RLS ativo, o arquivo `supabase/migrations/0001_init.sql` foi mantido apenas com um comentário referenciando `docs/database.md`, sem automação de migrations via CLI.

4. **Falha de build por conflito entre `export const runtime = "nodejs"` e `cacheComponents: true`**:
   - No Next.js 16.4.6, o template padrão habilita `cacheComponents: true` em `next.config.ts`. Ao adicionar `export const runtime = "nodejs"` em `app/api/mock-crm/leads/route.ts`, o `npm run build` falhou com `Route segment config "runtime" is not compatible with nextConfig.cacheComponents`.
   - **Correção**: Remoção da linha `export const runtime = "nodejs";` da rota, mantendo o runtime Node.js padrão do Next.js.

5. **Validação eager de variáveis de ambiente quebrando o `next build`**:
   - O arquivo `lib/env.ts` executava `validateEnv()` imediatamente no momento do `import`. Durante a coleta de dados de página (`Collecting page data for /api/mock-crm/leads`), o build quebrou porque variáveis de etapas ainda não implementadas não estavam definidas.
   - **Correção**: Refatoração de `lib/env.ts` para expor `getEnv(keys)` sob demanda dentro do handler da rota e inicialização lazy em `lib/supabase/server.ts`.

6. **Conflito de porta no teste `MOCK_CRM_MODE=unavailable`**:
   - Na primeira execução automatizada dos 4 testes `curl`, o processo filho do `next dev` anterior ainda ocupava a porta `3099` quando o segundo servidor (`MOCK_CRM_MODE=unavailable`) subiu, fazendo a requisição bater na instância antiga e retornar `200` em vez de `503`.
   - **Correção**: Encerramento explícito do processo na porta `3099` antes de subir a instância com `MOCK_CRM_MODE=unavailable`, confirmando o retorno HTTP `503`.

## Decisões

- Manter registro fiel de todos os erros de configuração, build e execução para rastreabilidade técnica do case.
