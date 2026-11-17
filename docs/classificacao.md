# Classificação de Leads

Regras, valores e definições sobre o processo de qualificação de leads.

## 1. Categorias de Classificação
Os leads são categorizados em:
- **`hot`**: Lead qualificado com alta prioridade de abordagem.
- **`warm`**: Lead de qualificação intermediária.
- **`cold`**: Lead de baixa aderência aos critérios atuais.

## 2. Valores no Banco de Dados (`public.leads`)

### Coluna `classificacao`
- `hot`: **confirmado** no banco de dados.
- `warm`: **a confirmar** no banco de dados.
- `cold`: **a confirmar** no banco de dados.
- `null`: indica que o lead ainda não foi classificado (processamento em andamento ou pendente).

### Coluna `metodo_classificacao`
- `regras`: **confirmado** no banco de dados.
- `gemini`: **a confirmar** no banco de dados.
- `fallback`: **a confirmar** no banco de dados.

## 3. Critérios e Justificativas
- Status: **pendente: definir com base no workflow n8n exportado**.
- Não há definição de pontuação ou regras numéricas arbitradas; os critérios exatos dependem da análise formal da estrutura exportada do workflow n8n.

## 4. Mecanismo de Fallback
- O mecanismo de fallback para classificação está **não confirmado** (dependente da estrutura de nós do workflow exportado).
