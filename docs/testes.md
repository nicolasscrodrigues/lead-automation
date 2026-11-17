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

## 4. Como Testar o Workflow
- Status: **pendente**.

## 5. Cenários Obrigatórios

| Cenário | Descrição | Status |
| :--- | :--- | :--- |
| 1 | Lead completo, qualificado: CRM, notificação e log | **pendente** |
| 2 | Lead completo, não qualificado: nutrição e log | **pendente** |
| 3 | E-mail inválido (ex.: maria.teste@exemplo): rejeitado, com log | **parcial** |
| 4 | Campo obrigatório ausente (ex.: sem telefone): rejeitado, com log | **parcial** |
| 5 | Mesmo e-mail do cenário 1 reenviado: duplicado, com log | **pendente** |
| 6 | Lead qualificado com CRM indisponível: retry, tratamento do erro e log | **parcial** |
| 7 | Acesso direto à lista sem login: acesso negado | **executado** |

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
