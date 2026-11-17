# Database

O schema do banco de dados foi **criado manualmente no Supabase** (e não via execução de migrations). Nenhuma tabela adicional foi criada.

Ambas as tabelas abaixo pertencem ao schema `public` e possuem **RLS (Row Level Security) ativo**.

## Tabela `public.leads` (RLS ativo)

| Coluna | Tipo | Nulabilidade |
| :--- | :--- | :--- |
| `id` | `uuid` | `NOT NULL` |
| `created_at` | `timestamptz` | `NOT NULL` |
| `nome` | `text` | `NULL` |
| `email` | `text` | `NULL` |
| `telefone` | `text` | `NULL` |
| `empresa` | `text` | `NULL` |
| `cargo` | `text` | `NULL` |
| `classificacao` | `text` | `NULL` |
| `metodo_classificacao` | `text` | `NULL` |
| `status_final` | `text` | `NOT NULL` |
| `detalhes` | `jsonb` | `NULL` |

## Tabela `public.lead_logs` (RLS ativo)

| Coluna | Tipo | Nulabilidade |
| :--- | :--- | :--- |
| `id` | `uuid` | `NOT NULL` |
| `lead_id` | `uuid` | `NULL` |
| `email` | `text` | `NOT NULL` |
| `evento` | `text` | `NOT NULL` |
| `status` | `text` | `NOT NULL` |
| `detalhes` | `jsonb` | `NULL` |
| `created_at` | `timestamptz` | `NOT NULL` |

## Domínio de Valores (`public.leads`)

### `classificacao`
- `hot`: **confirmado**
- `warm`: **a confirmar**
- `cold`: **a confirmar**

### `metodo_classificacao`
- `regras`: **confirmado**
- `gemini`: **a confirmar**
- `fallback`: **a confirmar**

### `status_final`
- `processando`: **confirmado**
- `enviado_crm`: **confirmado**
- `nutricao`: **a confirmar**
- `duplicado`: **a confirmar**
- `invalido`: **a confirmar**
- `erro`: **a confirmar**

## Decisões

- Schema mantido manualmente no Supabase com RLS ativo em `leads` e `lead_logs` (RLS nunca deve ser desativado).
- Acesso server-side realizado via cliente administrativo em `lib/supabase/server.ts` (`import "server-only"`, `persistSession: false`).
