# Classification

Documentação das regras e valores de classificação de leads.

## Níveis de Classificação (`classificacao`)

Os valores utilizados pelo domínio de classificação são exclusivamente:

- `hot`: **confirmado** no banco de dados.
- `warm`: **a confirmar** no banco de dados.
- `cold`: **a confirmar** no banco de dados.

## Métodos de Classificação (`metodo_classificacao`)

- `regras`: **confirmado** no banco de dados.
- `gemini`: **a confirmar** no banco de dados.
- `fallback`: **a confirmar** no banco de dados.

## Status Final do Lead (`status_final`)

- `processando`: **confirmado** no banco de dados.
- `enviado_crm`: **confirmado** no banco de dados.
- `nutricao`: **a confirmar** no banco de dados.
- `duplicado`: **a confirmar** no banco de dados.
- `invalido`: **a confirmar** no banco de dados.
- `erro`: **a confirmar** no banco de dados.

## Decisões

- O detalhamento completo das regras de negócio de classificação no workflow depende da confirmação do export do workflow n8n (**pendente**).
