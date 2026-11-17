# Testes

Guia de execução, validações da aplicação e status de homologação dos cenários operacionais.

## 1. Pré-Requisitos
- **Node.js** e **npm** instalados.
- Projeto no **Supabase** configurado com as tabelas `leads` e `lead_logs` criadas e RLS ativo.
- Arquivo `.env.local` preenchido a partir das variáveis do projeto.
- Instância do **n8n** com o workflow ativo.

## 2. Como Rodar
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 3. Como Testar a Aplicação
- **Formulário Público**: Acessar `/`, preencher os campos cadastrais e submeter. A interface exibe aviso de sucesso ao encaminhar ou alerta de indisponibilidade caso o backend não consiga comunicar com o webhook.
- **Login Administrativo**: Acessar `/login`, informar usuário e senha. Testar autenticação com credenciais incorretas e corretas.
- **Dashboard**: Tentar acessar `/dashboard` sem sessão autenticada para confirmar redirecionamento para `/login`. Efetuar login e acessar `/dashboard` para verificar a exibição da tela protegida e a ação de logout.

## 4. Testes do Workflow (n8n - Fluxo Principal e CRM)
Resultados observados na execução dos nós do workflow:
- **Envio ao CRM (Leads Qualificados - `hot` e `warm`)**:
  - Lead `hot` enviado ao CRM: resposta HTTP `200`, `{ ok: true }`, `log_id` gerado.
  - Lead `warm` enviado ao CRM: resposta HTTP `200`, `{ ok: true }`, `log_id` gerado.
  - Nó `"Atualizar Status Final"` (`enviado_crm`): executado com sucesso, com confirmação de `leads.status_final = enviado_crm` no banco.
  - Nó `"Registrar no Log"` (`evento = enviado_crm`, `status = sucesso`): executado com sucesso, com nova linha criada na tabela `lead_logs`.
- **Notificação ao Comercial (Discord)**:
  - Nó HTTP Request `"Notificar Comercial (Discord)"`: executado com sucesso, gerando mensagem no canal para lead `hot` (testado via *Execute step*).
- **Fluxo de Nutrição (Leads Não Qualificados - `cold`)**:
  - Lead com cargo `"Estagirio de Marketing"` foi direcionado para a rota de nutrição. O nó `"Nutrição: Atualizar Status Final"` foi executado com sucesso, com 1 item de saída. A gravação de log na tabela `lead_logs` com o evento `encaminhado_nutricao` permanece **pendente**.
- **Simulação de Falha do CRM (`MOCK_CRM_MODE=unavailable` na Vercel)**:
  - Lead `hot` enviado com indisponibilidade simulada: o nó `"Enviar Lead ao CRM"` retornou HTTP `503` com a mensagem `"CRM indisponível (mock)"`.
  - Saída de erro do nó conectada ao nó `"Registrar Erro no Log"` (Supabase, `lead_logs`).
  - Confirmado no Supabase: linha criada em `lead_logs` com evento `erro_crm` e status `erro`, sem atribuição do status `enviado_crm` para o lead.
  - Retry configurado (3 tentativas, intervalo de 5000 ms). A contagem das tentativas intermediárias não foi observada no histórico.
  - Após o teste, `MOCK_CRM_MODE` voltou para `ok`, novo deploy foi realizado e o lead de teste retornou HTTP `200`.

## 5. Cenários Obrigatórios

| Cenário | Descrição | Status | Detalhes |
| :--- | :--- | :--- | :--- |
| 1 | Lead completo, qualificado | **executado** | CRM executado (lead `hot` retornou HTTP `200` com `ok: true`); status final confirmado (`leads.status_final = enviado_crm`); log de envio confirmado (`lead_logs` com evento `enviado_crm` e status `sucesso`); notificação executada via nó HTTP Request `"Notificar Comercial (Discord)"` com envio de mensagem ao canal para lead `hot`. Executado, exceto ponto de confirmação de disparo automático no fluxo real (testado via *Execute step*). |
| 2 | Lead completo, não qualificado | **parcial** | Fluxo `cold` até nutrição testado (nó `"Nutrição: Atualizar Status Final"` executado com 1 item); log de nutrição pendente. |
| 3 | E-mail inválido (ex.: maria.teste@exemplo) | **pendente** | Sem log de auditoria ligado no nó `"Responder 400"`. |
| 4 | Campo obrigatório ausente (ex.: sem telefone) | **pendente** | Sem log de auditoria ligado no nó `"Responder 400"`. |
| 5 | Mesmo e-mail do cenário 1 reenviado | **pendente** | Verificação de duplicidade e gravação de log não testadas de ponta a ponta. |
| 6 | Lead qualificado com CRM indisponível | **executado** | Executado com `MOCK_CRM_MODE=unavailable` na Vercel; lead `hot` enviado e nó `"Enviar Lead ao CRM"` retornou HTTP `503` (`"CRM indisponível (mock)"`). Saída de erro ligada ao nó `"Registrar Erro no Log"`, com confirmação no Supabase de registro em `lead_logs` (evento `erro_crm`, status `erro`) e sem `enviado_crm` para o lead. Retry configurado (3 tentativas, 5000 ms; contagem não observada no histórico). Após o teste, `MOCK_CRM_MODE` voltou para `ok`, novo deploy realizado e envio subsequente retornou HTTP 200. |
| 7 | Acesso direto à lista sem login | **pendente** | Proteção da rota validada no endpoint (`/dashboard` retornando HTTP `307`), mas teste completo de interface pendente. |

## 6. Resultados Já Executados

### Checagem de Tipagem e Build
- `npx tsc --noEmit`: código de saída `0`
- `npm run build`: código de saída `0`

### Mock CRM (`POST /api/mock-crm/leads`)
- Requisição sem token: código de resposta HTTP `401`
- Requisição com token e dados válidos: código de resposta HTTP `200`
- Requisição com payload sem campo obrigatório: código de resposta HTTP `400`
- Requisição com modo indisponível ativo: código de resposta HTTP `503`

### Ingestão de Leads (`POST /api/leads`)
- Requisição sem campo de e-mail: código de resposta HTTP `400`
- Requisição com URL de webhook inacessível: código de resposta HTTP `502`

### Autenticação e Proteção de Rotas
- `GET /dashboard` sem cookie de sessão: código de resposta HTTP `307` para `/login`
- `POST /api/auth/login` com usuário errado: código de resposta HTTP `401`
- `POST /api/auth/login` com senha errada: código de resposta HTTP `401`
- `POST /api/auth/login` com credenciais certas: código de resposta HTTP `200` com definição de cookie de sessão
- `GET /dashboard` com cookie de sessão válido: código de resposta HTTP `200`

### Validação em Produção (Deploy)
- **URL pública**: https://lead-automation-ten-umber.vercel.app
- `POST /api/mock-crm/leads` sem token: código de resposta HTTP `401` (executado, em produção)
