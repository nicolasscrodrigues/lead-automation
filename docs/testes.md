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
- **Dashboard**: Tentar acessar `/dashboard` sem sessão autenticada para confirmar redirecionamento para `/login`. Efetuar login e acessar `/dashboard` para verificar a exibição da tela protegida com a tabela de leads, contadores e a ação de logout.

## 4. Testes do Workflow (n8n - Fluxo Principal e CRM)
Resultados observados na execução dos nós do workflow:
- **Classificação com Gemini e Fallback**:
  - Lead com cargo `"estagiario"`: avaliado via Gemini (`gemini-4-hydrogen`), recebendo classificação `cold` e persistido com `metodo_classificacao = gemini` (resultado coincidente com a regra).
  - Lead com cargo `"Líder de Crescimento"`: avaliado via Gemini, recebendo classificação `hot` e persistido com `metodo_classificacao = gemini` (divergência em relação à regra que atribuiria `warm`, demonstrando qualificação contextual).
  - Simulação de falha na chamada da IA (chave inválida com *On Error* em *Continue*): avaliado pelo nó `"Validar Classificação"` que acionou as regras determinísticas de contingência, resultando em classificação `warm` e persistido com `metodo_classificacao = fallback`.
- **Envio ao CRM (Leads Qualificados - `hot` e `warm`)**:
  - Lead `hot` enviado ao CRM: resposta HTTP `200`, `{ ok: true }`, `log_id` gerado.
  - Lead `warm` enviado ao CRM: resposta HTTP `200`, `{ ok: true }`, `log_id` gerado.
  - Nó `"Atualizar Status Final"` (`enviado_crm`): executado com sucesso, com confirmação de `leads.status_final = enviado_crm` no banco.
  - Nó `"Registrar no Log"` (`evento = enviado_crm`, `status = sucesso`): executado com sucesso, com nova linha criada na tabela `lead_logs`.
- **Notificação ao Comercial (Discord)**:
  - Nó HTTP Request `"Notificar Comercial (Discord)"`: executado com sucesso, gerando mensagem no canal para lead `hot` (testado via *Execute step*).
- **Fluxo de Nutrição (Leads Não Qualificados - `cold`)**:
  - Lead `cold` enviado pelo fluxo (cargo `"Estagirio de Marketing"`), recebendo classificação `cold` por regras.
  - Nó `"Nutrição: Atualizar Status Final"`: executado com sucesso, atualizando `status_final = nutricao`.
  - Nó `"Nutrição: Registrar no Log"`: gravou com sucesso em `lead_logs` (evento `encaminhado_nutricao`, status `sucesso`), confirmado por consulta no Supabase.
- **Verificação de Duplicidade**:
  - Lead já existente reenviado pelo fluxo: o nó `"Registrar Duplicidade no Log"` gravou em `lead_logs` com evento `duplicate_detected` e status `duplicado`, confirmado por consulta no Supabase.
- **Validação e Rejeição de Dados Inválidos**:
  - E-mail em formato inválido: webhook retornou HTTP `400` (`"email em formato inválido"`). O nó `"Rejeitado: Registrar no Log"` gravou em `lead_logs` com evento `rejeitado` e status `invalido`, confirmado por consulta no Supabase.
  - Campo obrigatório ausente (telefone): webhook retornou HTTP `400` (`"telefone é obrigatório"`). O nó `"Rejeitado: Registrar no Log"` gravou em `lead_logs` com evento `rejeitado` e status `invalido`, confirmado por consulta no Supabase.
  - *Limitação observada*: o nó de log usa o e-mail do corpo da requisição com fallback `'nao-informado'`, e o campo `detalhes` não guarda o motivo da rejeição (apontado como melhoria futura).
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
| 2 | Lead completo, não qualificado | **executado** | Lead `cold` enviado pelo fluxo; classificado como `cold` por regras; nó `"Nutrição: Atualizar Status Final"` atualizou `status_final = nutricao`; nó `"Nutrição: Registrar no Log"` gravou em `lead_logs` (evento `encaminhado_nutricao`, status `sucesso`), confirmado por consulta no Supabase. |
| 3 | E-mail inválido (ex.: maria.teste@exemplo) | **executado** | Webhook retornou HTTP 400 (`"email em formato inválido"`). O nó `"Rejeitado: Registrar no Log"` gravou em `lead_logs` com evento `rejeitado` e status `invalido`, confirmado por consulta no Supabase. Limitação: campo `detalhes` não guarda o motivo da rejeição. |
| 4 | Campo obrigatório ausente (ex.: sem telefone) | **executado** | Webhook retornou HTTP 400 (`"telefone é obrigatório"`). O nó `"Rejeitado: Registrar no Log"` gravou em `lead_logs` com evento `rejeitado` e status `invalido`, confirmado por consulta no Supabase. Limitação: o nó usa e-mail do body com fallback `'nao-informado'` e `detalhes` não guarda o motivo. |
| 5 | Mesmo e-mail do cenário 1 reenviado | **executado** | Lead já existente reenviado: o nó `"Registrar Duplicidade no Log"` gravou em `lead_logs` com evento `duplicate_detected` e status `duplicado`, confirmado por consulta no Supabase. |
| 6 | Lead qualificado com CRM indisponível | **executado** | Executado com `MOCK_CRM_MODE=unavailable` na Vercel; lead `hot` enviado e nó `"Enviar Lead ao CRM"` retornou HTTP `503` (`"CRM indisponível (mock)"`). Saída de erro ligada ao nó `"Registrar Erro no Log"`, com confirmação no Supabase de registro em `lead_logs` (evento `erro_crm`, status `erro`) e sem `enviado_crm` para o lead. Retry configurado (3 tentativas, 5000 ms; contagem não observada no histórico). Após o teste, `MOCK_CRM_MODE` voltou para `ok`, novo deploy realizado e envio subsequente retornou HTTP 200. |
| 7 | Acesso direto à lista sem login | **executado** | Testado em janela anônima acessando `/dashboard` na URL pública: usuário redirecionado para `/login` com exibição da tela de acesso administrativo. Validação complementada pelo teste de API em que `GET /dashboard` sem cookie retorna HTTP 307 para `/login`. |

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

### Dashboard e Listagem de Leads (`/dashboard`)
- Acesso autenticado com cookie de sessão: código de resposta HTTP `200`, carregamento dos registros de `public.leads` ordenados por `created_at desc` (limite 200), cálculo de indicadores por categoria e renderização da tabela formatada em pt-BR (fuso `America/Sao_Paulo`).
- Acesso sem cookie de sessão: código de resposta HTTP `307` com redirecionamento para `/login`.

### Validação em Produção (Deploy)
- **URL pública**: https://lead-automation-ten-umber.vercel.app
- `POST /api/mock-crm/leads` sem token: código de resposta HTTP `401` (executado, em produção)
- Acesso direto a `/dashboard` sem sessão em janela anônima: redirecionamento para `/login` (executado, em produção)
