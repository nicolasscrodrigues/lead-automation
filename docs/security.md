# Security

Práticas e controles de segurança implementados no projeto.

## Controles Implementados

- **Autenticação Administrativa e Hash de Senha (`bcryptjs` + `crypto.timingSafeEqual`)**:
  - No endpoint `POST /api/auth/login`, o nome de usuário informado é comparado em tempo constante contra `ADMIN_USERNAME` (usando `crypto.timingSafeEqual` sobre digest SHA-256 + verificação de tamanho).
  - A senha é validada contra o hash armazenado em `ADMIN_PASSWORD_HASH` via `bcryptjs.compare`.
  - Falhas de usuário ou de senha retornam exatamente a mesma resposta (`401` com `{ ok: false, error: "Usuário ou senha inválidos." }`) para evitar enumeração de usuários.
  - Senhas, hashes, tokens e segredos nunca são registrados em logs.
- **Gestão de Sessão e Cookie Seguro (`lib/auth/session.ts`)**:
  - Token JWT assinado e verificado com a biblioteca `jose` utilizando algoritmo `HS256` e a chave `SESSION_SECRET` (lida sob demanda com `getEnv(["SESSION_SECRET"])`), com expiração de 8 horas.
  - Cookie `lead_automation_session` configurado com:
    - `httpOnly: true` (inacessível via JavaScript no navegador)
    - `secure: process.env.NODE_ENV === "production"`
    - `sameSite: "lax"`
    - `path: "/"`
- **Proteção de Rotas (`middleware.ts`)**:
  - Intercepta acessos a `/dashboard` e subrotas (`matcher: ["/dashboard/:path*"]`), valida a assinatura e expiração do cookie via `verifySession` e redireciona requisições não autenticadas (`307 Temporary Redirect`) para `/login`, sem consultar o Supabase no middleware.
- **Proteção de Credenciais e Variáveis de Ambiente**:
  - `.env*.local` ignorado via `.gitignore`.
  - `.env.example` contém apenas os nomes das variáveis, sem chaves, tokens, hashes ou URLs reais.
  - Validação estrita com Zod via `getEnv` em `lib/env.ts`.
- **Isolamento Server-Only do Cliente Supabase**:
  - `lib/supabase/server.ts` utiliza `import "server-only"` e `persistSession: false`, garantindo que a chave administrativa nunca seja empacotada no cliente.
- **Row Level Security (RLS)**:
  - RLS mantido ativo nas tabelas `public.leads` e `public.lead_logs`.
- **Comparação de Token em Tempo Constante no Mock CRM**:
  - O header `X-Mock-Token` no endpoint `POST /api/mock-crm/leads` é validado com `crypto.timingSafeEqual`.
- **Tratamento Seguro de Erros**:
  - Erros de banco de dados em `/api/mock-crm/leads` e falhas de comunicação com o webhook em `/api/leads` retornam mensagens genéricas ao cliente, ocultando URLs internas e detalhes de infraestrutura.

## Decisões

- Nenhuma credencial, token, hash ou segredo é exposto em código-fonte, respostas de API ou documentação.
