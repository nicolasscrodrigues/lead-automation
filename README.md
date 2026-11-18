# Lead Automation

Aplicação para captura, qualificação automatizada e distribuição de leads, construída como case técnico de automação com n8n e IA.

## Visão geral

1. Um formulário público envia o lead para um webhook do n8n.
2. O n8n valida os dados, verifica duplicidade pelo e-mail e grava o lead no Supabase.
3. Um modelo Gemini classifica o lead como **quente**, **morno** ou **frio**, com base em cargo e empresa. Se a resposta for inválida ou a chamada falhar, uma regra por palavras-chave assume.
4. Leads quentes e mornos seguem para o CRM simulado, e leads frios vão para nutrição.
5. Erros são registrados em `lead_logs`, e leads quentes geram aviso no Discord.
6. Um painel administrativo, protegido por login, lista os leads com classificação e status final.

## Tecnologias

- Next.js 16 (App Router) e TypeScript
- Tailwind CSS
- Supabase (fonte única de dados, RLS ativo)
- n8n (orquestração do fluxo)
- Google Gemini (classificação)
- Vercel (deploy)

## Como executar localmente

Pré-requisitos: Node.js LTS, npm e um projeto Supabase com as tabelas `leads` e `lead_logs`.

```bash
npm install
cp .env.example .env.local
# preencha as variáveis no .env.local
npm run dev
```

Acesse http://localhost:3000. O painel fica em `/login`.

## Variáveis de ambiente

Os nomes estão em `.env.example`. Valores reais ficam só no `.env.local` local e no painel da Vercel, nunca no repositório.

## Aplicação publicada

https://lead-automation-ten-umber.vercel.app

## Documentação

Detalhes em `docs/`:

- `fluxo.md`: arquitetura, etapas do workflow e integrações
- `classificacao.md`: critérios de classificação e fallback
- `testes.md`: como testar e resultados executados
- `melhorias.md`: o que está implementado e melhorias futuras
