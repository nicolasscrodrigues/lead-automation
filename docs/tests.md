# Testes

Registro dos testes executados e validados no projeto até o momento.

## Build e Typecheck

| Comando | Código Esperado | Código Obtido | Status |
| :--- | :--- | :--- | :--- |
| `npx tsc --noEmit` | `0` | `0` | Passou |
| `npm run build` | `0` | `0` | Passou |

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

- Autenticação (`POST /api/auth/login` e `POST /api/auth/logout`) e proteção de rotas no `middleware.ts`: **pendente**.
- Dashboard administrativo com filtros e KPIs: **pendente**.
