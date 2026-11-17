# Testes

Registro dos testes executados e validados no projeto até o momento.

## Build e Typecheck

| Comando | Código Esperado | Código Obtido | Status |
| :--- | :--- | :--- | :--- |
| `npx tsc --noEmit` | `0` | `0` | Passou |
| `npm run build` | `0` | `0` | Passou |

## Autenticação e Proteção de `/dashboard`

Testes executados com servidor local (`npm run dev`):

| Cenário | Código Esperado | Código Obtido | Observação |
| :--- | :--- | :--- | :--- |
| `GET /dashboard` sem cookie de sessão | Redirecionamento (`307`) para `/login` | `307` (`Location: /login`) | Bloqueado pelo `middleware.ts` |
| `POST /api/auth/login` com usuário errado | `401` | `401` | Retornou mensagem genérica sem definir cookie |
| `POST /api/auth/login` com senha errada | `401` | `401` | Retornou mensagem genérica sem definir cookie |
| `POST /api/auth/login` com credenciais válidas | `200` | `200` | Cookie `lead_automation_session` (`httpOnly`) definido com sucesso |
| `GET /dashboard` com cookie de sessão válido | `200` | `200` | Acesso permitido à rota protegida |

## Endpoint `POST /api/leads` (Formulário Público -> Proxy n8n)

Testes executados com servidor local (`npm run dev`) e requisições HTTP via `curl`:

| Cenário | Código Esperado | Código Obtido | Observação |
| :--- | :--- | :--- | :--- |
| Payload sem `email` | `400` | `400` | Falha na validação `leadFormSchema` (Zod) |
| Payload válido com `N8N_WEBHOOK_URL` inválida/inacessível | `502` | `502` | Retornou `{ "ok": false, "error": "Não foi possível enviar seu contato. Tente novamente." }` sem vazar a URL do webhook |

## Endpoint `POST /api/mock-crm/leads`

Testes executados com servidor local (`npm run dev`) e requisições HTTP via `curl`:

| Cenário | Código Esperado | Código Obtido | Confirmação no Banco (`public.lead_logs`) |
| :--- | :--- | :--- | :--- |
| Sem header `X-Mock-Token` | `401` | `401` | Nenhuma gravação |
| Header `X-Mock-Token` válido + payload válido (`email`, `nome`, `telefone`, `empresa`, `cargo`) | `200` | `200` | Confirmado: registro criado em `lead_logs` com `evento = "crm_recebido"` e `status = "sucesso"` |
| Header `X-Mock-Token` válido + payload sem `email` | `400` | `400` | Nenhuma gravação |
| Header `X-Mock-Token` válido + `MOCK_CRM_MODE=unavailable` | `503` | `503` | Nenhuma gravação |

## Testes Pendentes

- Dashboard administrativo completo (listagem de leads do Supabase, filtros e KPIs): **pendente**.
