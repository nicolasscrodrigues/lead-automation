# Classificação de Leads

Regras, valores e definições sobre o processo de qualificação de leads.

## 1. Categorias de Classificação
Os leads são categorizados em:
- **`hot`**: Lead qualificado com alta prioridade de abordagem (direcionado ao CRM).
- **`warm`**: Lead de qualificação intermediária (saída ainda não confirmada).
- **`cold`**: Lead de baixa aderência aos critérios atuais (direcionado à nutrição).

## 2. Valores no Banco de Dados (`public.leads`)

### Coluna `classificacao`
- `hot`: **confirmado** no banco de dados.
- `warm`: **a confirmar** no banco de dados.
- `cold`: **confirmado** no banco de dados.
- `null`: indica que o lead ainda não foi classificado (processamento em andamento ou pendente).

### Coluna `metodo_classificacao`
- `regras`: **confirmado** no banco de dados.
- `gemini`: **a confirmar** no banco de dados.
- `fallback`: **a confirmar** no banco de dados.

## 3. Critérios e Regras Observadas em Testes
- A regra de classificação por regras implementada no workflow n8n baseia-se na correspondência exata do texto informado no campo de cargo:
  - Variações de digitação (*typos*) e alterações de acentuação afetam diretamente a categoria atribuída ao lead.
- **Resultados de testes no fluxo principal do n8n**:
  - Lead com cargo `"Estagirio de Marketing"`: classificado como `cold` (encaminhado ao fluxo de nutrição).
  - Lead com cargo `"Diretora Comercial"`: classificado como `hot` (encaminhado ao nó de envio ao CRM).
  - Saída `warm`: **ainda não confirmada**.
  - Destino `cold` no n8n: o nó `"Nutrição: Atualizar Status Final"` foi executado com sucesso, gerando 1 item de saída.
  - Registro de log de nutrição na tabela `lead_logs` (com evento `encaminhado_nutricao`): **pendente**.

## 4. Mecanismo de Fallback
- O mecanismo de fallback para classificação permanece **não confirmado** (dependente da definição de rotas de contingência no workflow exportado).
