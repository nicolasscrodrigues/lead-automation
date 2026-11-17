# Fluxo de Captura, Qualificação e Distribuição de Leads

## 1. Descrição Geral
Aplicação web voltada para a captura, qualificação e distribuição de leads com integração a fluxo automatizado no n8n e armazenamento no Supabase.

## 2. Formulário Público e Ingestão
- O formulário público na página inicial (`/`) envia os dados via requisição `POST` para o endpoint interno `/api/leads`.
- O endpoint `/api/leads` valida a estrutura do payload e repassa os dados diretamente ao webhook do n8n utilizando a variável de ambiente `N8N_WEBHOOK_URL`.
- A URL do webhook do n8n é mantida exclusivamente no lado do servidor, impedindo sua exposição pública no frontend.
- O formulário público não grava dados diretamente no banco de dados.

## 3. Etapas do Workflow no n8n
O workflow no n8n realiza o processamento, validação, verificação de duplicidade, qualificação e direcionamento do lead.

> **Status**: As etapas abaixo descrevem exclusivamente os nodes existentes no workflow. O funcionamento integrado de ponta a ponta está **em construção**.

Nodes existentes no workflow:
1. **Webhook**: Ponto de entrada que recebe a requisição HTTP enviada pela API da aplicação.
2. **Validar lead**: Realiza a validação estrutural dos campos recebidos.
3. **If**: Bifurcação condicional baseada na validação do lead.
4. **Responder 200**: Responde com sucesso (HTTP 200) quando os dados são aceitos.
5. **Responder 400**: Responde com erro (HTTP 400) quando os dados são inválidos.
6. **Buscar e-mail**: Consulta no banco de dados se o e-mail já existe.
7. **Verificar duplicidade**: Avalia o resultado da busca para identificar repetições.
8. **Separar duplicados**: Roteia o fluxo separando leads duplicados de leads inéditos.
9. **Registrar Duplicidade no Log**: Grava a ocorrência de duplicidade na tabela de logs para auditoria.
10. **Registrar Novo Lead**: Insere o novo lead na tabela principal com `status_final = 'processando'`.
11. **Classificar Lead**: Aplica a lógica de qualificação sobre as informações do lead.
12. **Atualizar Classificação do Lead**: Atualiza o registro do lead com a classificação atribuída e o método utilizado.
13. **Direcionar por Classificação**: Conduz o lead para o destino adequado conforme a sua classificação.
14. **Enviar Lead ao CRM**: Dispara os dados do lead qualificado para a API do CRM.

## 4. Distribuição e Destino dos Leads
- **Leads Qualificados (`hot`)**: Encaminhados para o CRM simulado via requisição HTTP.
- **Leads `warm` e `cold`**: Destino de nutrição marcado como **pendente**.

## 5. Banco de Dados (Supabase)
O banco de dados é hospedado no Supabase com tabelas criadas manualmente e **RLS (Row Level Security) ativo**:
- **Tabela `leads`**: Contém os dados dos contatos e sua qualificação.
- **Tabela `lead_logs`**: Contém o histórico de eventos e auditoria de integrações.
- **Valores de `status_final`**:
  - `processando`: **confirmado** no banco de dados.
  - `enviado_crm`: **confirmado** no banco de dados.
  - `nutricao`: **a confirmar** no banco de dados.
  - `duplicado`: **a confirmar** no banco de dados.
  - `invalido`: **a confirmar** no banco de dados.
  - `erro`: **a confirmar** no banco de dados.

## 6. CRM Simulado
- Endpoint: `POST /api/mock-crm/leads`.
- Proteção: Autenticado pelo cabeçalho `X-Mock-Token`, validado em tempo constante.
- Persistência: Registra o evento de recebimento exclusivamente na tabela `lead_logs` (`evento = "crm_recebido"`).
- Status: Implementado e testado localmente. A integração com o n8n está **pendente** (aguardando disponibilização de URL pública).

## 7. Notificações
- Notificações para canais externos ou equipe comercial: **não implementado**.

## 8. Dashboard
- Status: **em construção**.
- O fluxo de login administrativo (`POST /api/auth/login`, `POST /api/auth/logout`) e a proteção de rota (`/dashboard`) com cookies seguros `httpOnly` e JWT foram implementados e testados. Visualização completa de métricas e listagem permanece pendente.
