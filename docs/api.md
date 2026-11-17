# API

> **Nota:** O endpoint documentado abaixo é um **mock** de CRM criado especificamente para simular o recebimento de leads qualificados no case técnico. Ele **nunca** grava na tabela `public.leads`, registrando apenas eventos de auditoria em `public.lead_logs`.

## `POST /api/mock-crm/leads`

Simula o recebimento de um lead qualificado por um CRM externo.

### Headers obrigatórios

| Header | Tipo | Descrição |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Formato do payload enviado |
| `X-Mock-Token` | `string` | Token secreto validado em tempo constante (`crypto.timingSafeEqual`) contra a variável de ambiente `MOCK_CRM_TOKEN` |

### Corpo da Requisição (JSON)

| Campo | Tipo | Obrigatório | Restrições |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Sim | Formato de e-mail válido |
| `nome` | `string` | Sim | `trim`, máx. 200 caracteres |
| `telefone` | `string` | Sim | `trim`, máx. 200 caracteres |
| `empresa` | `string` | Sim | `trim`, máx. 200 caracteres |
| `cargo` | `string` | Sim | `trim`, máx. 200 caracteres |
| `classificacao` | `string` | Não | Enum de entrada no schema atual |
| `metodo_classificacao` | `string` | Não | Máx. 100 caracteres |
| `status_final` | `string` | Não | Máx. 100 caracteres |
| `lead_id` | `string` | Não | Formato UUID |
| `detalhes` | `object` | Não | Objeto JSON adicional |

### Códigos de Resposta

- **`200 OK`**: Lead recebido pelo mock CRM e registrado em `public.lead_logs` com `evento = "crm_recebido"`, `status = "sucesso"` e `detalhes` contendo o payload recebido + `{ mock: true }`.
  - Resposta: `{ "ok": true, "log_id": "<uuid>" }`
- **`400 Bad Request`**: Corpo da requisição com JSON malformado ou falha na validação Zod (ex.: ausência de `email`). Nada é gravado no banco.
  - Resposta: `{ "error": "Payload inválido", "issues": [...] }`
- **`401 Unauthorized`**: Header `X-Mock-Token` ausente ou divergente de `MOCK_CRM_TOKEN`. Nada é gravado no banco.
  - Resposta: `{ "error": "Não autorizado" }`
- **`500 Internal Server Error`**: Falha ao inserir o registro na tabela `public.lead_logs`. Retorna mensagem genérica ao cliente e registra o erro real apenas no console do servidor.
  - Resposta: `{ "error": "Erro interno ao registrar log no CRM" }`
- **`503 Service Unavailable`**: Retornado quando `MOCK_CRM_MODE === "unavailable"` para simular indisponibilidade do CRM. Nada é gravado no banco.
  - Resposta: `{ "error": "CRM indisponível (mock)" }`

## Endpoints Pendentes

- `POST /api/leads`: **pendente** (atualmente apenas placeholder).
- `POST /api/auth/login`: **pendente** (atualmente apenas placeholder).
- `POST /api/auth/logout`: **pendente** (atualmente apenas placeholder).

## Decisões

- Comparação do token `X-Mock-Token` implementada com `crypto.timingSafeEqual` para evitar ataques de timing.
- Simulação de indisponibilidade controlada por variável de ambiente (`MOCK_CRM_MODE=unavailable`) antes de qualquer escrita no banco.
