# Security

Práticas e controles de segurança implementados no projeto.

## Controles Implementados

- **Proteção de Credenciais e Variáveis de Ambiente**:
  - `.env*.local` ignorado via `.gitignore`.
  - `.env.example` contém apenas os nomes das variáveis, sem chaves, tokens, hashes ou URLs reais.
  - Validação estrita com Zod via `getEnv` em `lib/env.ts`.
- **Isolamento Server-Only do Cliente Supabase**:
  - `lib/supabase/server.ts` utiliza `import "server-only"` e `persistSession: false`, garantindo que a chave administrativa nunca seja empacotada no cliente.
- **Row Level Security (RLS)**:
  - RLS mantido ativo nas tabelas `public.leads` e `public.lead_logs`.
- **Comparação de Token em Tempo Constante**:
  - O header `X-Mock-Token` no endpoint `POST /api/mock-crm/leads` é validado com `crypto.timingSafeEqual` para mitigar ataques de timing.
- **Tratamento Seguro de Erros**:
  - Erros de banco de dados em `/api/mock-crm/leads` retornam mensagem genérica HTTP `500` ao cliente, registrando detalhes apenas no log do servidor.

## Controles Pendentes

- Autenticação administrativa (`POST /api/auth/login`, `POST /api/auth/logout`, `lib/auth/session.ts`) e verificação de sessão em `middleware.ts`: **pendente**.

## Decisões

- Nenhuma credencial, token ou segredo é exposto em código-fonte ou documentação.
