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

## 4. Testes do Workflow (n8n - Fluxo Principal)
Resultados observados na execução dos nós do workflow:
- **Classificação `cold` (não qualificado)**: Lead com cargo `"Estagirio de Marketing"` foi direcionado para a rota de nutrição. O nó `"Nutrição: Atualizar Status Final"` foi executado com sucesso, com 1 item de saída. A gravação de log na tabela `lead_logs` com o evento `encaminhado_nutricao` permanece **pendente**.
- **Classificação `hot` (qualificado)**: Lead com cargo `"Diretora Comercial"` foi classificado como `hot` e a execução chegou ao nó `"Enviar Lead ao CRM"`. A integração final com o CRM público permanece **pendente** e notificações **não foram implementadas**.
- **Classificação `warm`**: Saída **ainda não confirmada**.

## 5. Cenários Obrigatórios

| Cenário | Descrição | Status | Detalhes |
| :--- | :--- | :--- | :--- |
| 1 | Lead completo, qualificado | **parcial** | Classificação `hot` testada com sucesso até o nó `"Enviar Lead ao CRM"`; integração com CRM público pendente; notificação não implementada. |
| 2 | Lead completo, não qualificado | **parcial** | Fluxo `cold` testado com sucesso (nó `"Nutrição: Atualizar Status Final"` executado com 1 item); gravação do log com evento `encaminhado_nutricao` pendente. |
| 3 | E-mail inválido (ex.: maria.teste@exemplo) | **pendente** | Sem log de auditoria ligado no nó `"Responder 400"`. |
| 4 | Campo obrigatório ausente (ex.: sem telefone) | **pendente** | Sem log de auditoria ligado no nó `"Responder 400"`. |
| 5 | Mesmo e-mail do cenário 1 reenviado | **pendente** | Verificação de duplicidade e gravação de log não testadas de ponta a ponta. |
| 6 | Lead qualificado com CRM indisponível | **pendente** | Fluxo de retry e tratamento de erro no n8n não testado de ponta a ponta. |
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
