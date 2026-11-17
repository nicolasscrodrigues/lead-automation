# Improvements

Melhorias técnicas mapeadas e pontos de evolução do projeto.

## Pendências e Evoluções Planejadas

1. **Alinhamento do Enum de Classificação no Schema do Mock CRM**:
   - Verificar e alinhar o enum opcional de `classificacao` em `lib/validation/lead.ts` com os valores do banco (`hot`, `warm`, `cold`).
2. **Implementação da Captura de Leads (`POST /api/leads` e `LeadForm`)**:
   - Implementar o formulário público e o envio para o webhook do n8n.
3. **Implementação de Autenticação e Proteção de Rotas**:
   - Implementar sessão em `lib/auth/session.ts`, login/logout e proteção de `/dashboard` no `middleware.ts`.
4. **Implementação do Dashboard Administrativo**:
   - Listagem de leads, filtros (`LeadFilters`), tabela (`LeadsTable`) e indicadores (`KpiCards`).
5. **Documentação do Workflow n8n**:
   - Documentar os nodes reais em `docs/n8n-workflow.md` assim que o export do workflow for disponibilizado.
6. **Testes Automatizados**:
   - Adicionar suíte automatizada de testes de integração para os endpoints da API.
