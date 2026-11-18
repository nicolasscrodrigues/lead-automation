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

> **Status**: As etapas abaixo descrevem os nodes existentes no workflow.

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
11. **Gemini: Classificar Lead**: Avalia o perfil e cargo do lead via chamada HTTP ao modelo `gemini-4-hydrogen`.
12. **Validar Classificação**: Avalia a resposta da IA (Code) definindo `metodo_classificacao = gemini` ou aplicando contingência determinística por regras (`metodo_classificacao = fallback`).
13. **Atualizar Classificação do Lead**: Atualiza o registro do lead com a classificação atribuída e o método utilizado.
14. **Direcionar por Classificação**: Conduz o lead para o destino adequado conforme a sua classificação.
15. **Enviar Lead ao CRM**: Dispara os dados do lead qualificado para a API do CRM.
16. **Notificar Comercial (Discord)**: Dispara notificação com os dados do lead qualificado para o canal do time comercial.

## 4. Distribuição e Destino dos Leads
- **Leads Qualificados (Quente / `hot`)**: Encaminhados para o CRM simulado via requisição HTTP e notificados no canal comercial.
- **Leads Morno (`warm`) e Frio (`cold`)**: Leads com classificação morno (`warm`) são direcionados ao CRM; leads frios (`cold`) são encaminhados para o fluxo de nutrição (`status_final = nutricao`) com log de auditoria.

## 5. Banco de Dados (Supabase)
O banco de dados é hospedado no Supabase com tabelas criadas manualmente e **RLS (Row Level Security) ativo**:
- **Tabela `leads`**: Contém os dados dos contatos e sua qualificação.
- **Tabela `lead_logs`**: Contém o histórico de eventos e auditoria de integrações.
- **Valores de `status_final`**:
  - `processando`: **confirmado** no banco de dados.
  - `enviado_crm`: **confirmado** no banco de dados.
  - `nutricao`: **confirmado** no banco de dados.
  - `duplicado`: **a confirmar** no banco de dados.
  - `invalido`: **a confirmar** no banco de dados.
  - `erro`: **a confirmar** no banco de dados.

## 6. CRM Simulado
- Endpoint: `POST /api/mock-crm/leads`.
- Proteção: Autenticado pelo cabeçalho `X-Mock-Token`, validado em tempo constante.
- Persistência: Registra o evento de recebimento exclusivamente na tabela `lead_logs` (`evento = "crm_recebido"`).
- Status: Implementado, testado e integrado ao n8n em produção.

## 7. Notificações
- Implementada via canal do Discord por meio de webhook no nó `"Notificar Comercial (Discord)"` do n8n.
- A URL do webhook do canal permanece configurada exclusivamente nas credenciais do n8n, nunca exposta no repositório.
- Disparada para alertar o time comercial após a identificação e envio de leads qualificados (quente / `hot`).

## 8. Dashboard
- Status: **implementado**.
- **Autenticação e Proteção**: Rota protegida em `/dashboard` via middleware com cookies seguros `httpOnly` e JWT. Acessos não autenticados são redirecionados para `/login`. O encerramento da sessão administrativa ocorre via botão "Sair" conectado a `/api/auth/logout`.
- **Listagem de Leads**: Renderizada via Server Component por meio da função `listLeads()` (`lib/leads/queries.ts`), que consulta `public.leads` utilizando o cliente administrativo Supabase protegido por `server-only` (limite de 200 registros mais recentes ordenados por `created_at desc`).
- **Tabela e Formatação**: Exibe data e hora (formatadas em pt-BR com fuso `America/Sao_Paulo`), nome, e-mail, telefone, empresa, cargo, classificação padronizada (Quente, Morno, Frio) e status final.
- **Indicadores no Topo**: Cartões de contagem consolidada com total de leads e totais segmentados por classificação (Quente, Morno, Frio e Não classificado), suportando tanto os valores padronizados quanto os registros legados em inglês (`hot`, `warm`, `cold`).
- **Tratamento de Exceções**: Exibição de mensagem amigável caso a tabela esteja vazia ("Nenhum lead recebido") ou em caso de erro na consulta ("Não foi possível carregar os leads."), com erro registrado estritamente no console do servidor.
