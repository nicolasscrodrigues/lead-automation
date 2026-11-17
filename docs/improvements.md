# Improvements

Melhorias técnicas mapeadas, avisos de ferramentas e pontos de evolução do projeto.

## Avisos e Pontos de Atenção Atuais

1. **Aviso de Depreciação `middleware.ts` -> `proxy.ts` no Next.js 16**:
   - Durante `npm run dev` e `npm run build`, o Next.js 16.4.6 exibe o aviso: `The "middleware" file convention is deprecated. Please use "proxy" instead.`
   - Por decisão de escopo da etapa atual, o arquivo `middleware.ts` foi mantido sem renomeação; a migração via codemod (`npx @next/codemod@canary middleware-to-proxy .`) fica registrada como melhoria futura.
2. **Limite de Tentativas (Rate Limiting) no Login**:
   - O endpoint `POST /api/auth/login` realiza comparação em tempo constante e usa `bcryptjs`, mas ainda não possui controle de rate limiting / bloqueio temporário por IP ou usuário (**pendente**).
3. **Vulnerabilidades Reportadas pelo `npm audit`**:
   - O comando `npm install` reportou **14 vulnerabilidades de severidade `high`** na árvore de dependências transitivas. Elas **não** foram corrigidas com `npm audit fix --force` para evitar breaking changes nas versões do Next.js/ecossistema durante o case; recomenda-se revisão controlada de overrides/atualizações em ciclo futuro.

## Pendências Funcionais e Evoluções Planejadas

4. **Implementação Completa do Dashboard Administrativo**:
   - Substituir o estado `"Dashboard (em construção)"` em `app/dashboard/page.tsx` pela listagem de leads, filtros (`LeadFilters`), tabela (`LeadsTable`) e indicadores (`KpiCards`).
5. **Alinhamento do Enum de Classificação no Schema do Mock CRM**:
   - Verificar e alinhar o enum opcional de `classificacao` em `lib/validation/lead.ts` com os valores do banco (`hot`, `warm`, `cold`).
6. **Documentação do Workflow n8n**:
   - Documentar os nodes reais em `docs/n8n-workflow.md` assim que o export do workflow for disponibilizado.
