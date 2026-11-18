# Melhorias

Registro do estado atual das funcionalidades e das melhorias futuras mapeadas para a evolução do sistema.

## Já Implementado
- **Formulário de captura**: Interface de submissão de leads no frontend com validação de campos.
- **Proxy de envio ao webhook**: Rota de API (`/api/leads`) que recebe os dados do formulário e repassa ao webhook do n8n com timeout e sem expor a URL interna ao cliente.
- **CRM simulado (Mock CRM)**: Rota de API (`/api/mock-crm/leads`) protegida por cabeçalho com token validado em tempo constante, simulação de indisponibilidade e auditoria gravada em banco.
- **Autenticação e sessão administrativa**: Login e logout com comparação em tempo constante e hash seguro, emissão de JWT em cookie `httpOnly` e proteção de rotas no middleware.
- **Integração com Supabase**: Cliente administrativo restrito ao servidor (`server-only`) com RLS ativo nas tabelas `leads` e `lead_logs`.
- **Validação de ambiente sob demanda**: Leitura modular das variáveis de ambiente necessárias para cada endpoint e etapa de execução.
- **Classificação com LLM (Gemini) e Fallback**: Pipeline no n8n com requisição ao modelo `gemini-4-hydrogen` para qualificação contextual dos leads e nó de validação em código com contingência determinística baseada em regras por palavras-chave em caso de falha ou resposta anômala.
- **Dashboard administrativo com listagem de leads**: Server Component em `/dashboard` integrado a `listLeads()`, com contadores consolidados por classificação e tabela de contatos formatada em pt-BR.

## Observações de Arquitetura do Workflow
- **Ordem de resposta do webhook**: O nó `"Responder 200"` é executado antes da checagem de duplicidade e da classificação do lead. Como consequência, a resposta de sucesso HTTP 200 é devolvida ao cliente antes da validação contra registros preexistentes no banco e da definição da categoria do lead.

## Melhorias Futuras
Nenhuma das melhorias abaixo está concluída:
- **Refinamento de prompts e mais exemplos de validação no Gemini**: Incorporar técnicas de *few-shot prompting* e enriquecer os exemplos nos critérios de validação da IA para cobrir nichos e cargos altamente específicos.
- **Monitoramento de cota e latência da API do Gemini**: Criar alertas e métricas dedicadas para consumo de tokens, esgotamento de quota e tempo de resposta das chamadas ao modelo generativo.
- **Detalhamento do motivo de rejeição em `lead_logs`**: Atualmente o nó `"Rejeitado: Registrar no Log"` utiliza fallback `'nao-informado'` para o e-mail e não registra a causa específica do erro no campo `detalhes`. Como evolução, persistir o motivo e os campos faltantes/inválidos no JSON de detalhes para facilitar a auditoria.
- **Ajuste na sincronização da resposta do webhook**: Reavaliar a posição do nó `"Responder 200"` no workflow para que o retorno ao cliente ocorra após a verificação de duplicidade, caso seja necessário informar ao usuário o status do processamento.
- **Limite de tentativas no login**: Implementação de controle de taxa (rate limiting) para evitar tentativas excessivas e mitigar ataques de força bruta.
- **Migrar middleware para proxy (aviso do Next 16)**: Atualização da convenção de proteção de rotas para adequar ao aviso de depreciação do Next.js 16.
- **Revisar 14 vulnerabilidades high do npm audit, sem --force**: Avaliação técnica criteriosa das dependências para resolução de vulnerabilidades apontadas pelo `npm audit`, evitando flags destrutivas que quebrem compatibilidade.
- **Monitoramento e alertas gerais**: Criação de métricas de observabilidade para falhas na ingestão, erros de banco e indisponibilidade de serviços externos.
- **Retry com fila para falhas do n8n**: Estruturação de mecanismo de mensageria ou fila com repetição automática caso o webhook esteja indisponível.
- **Dashboard com paginação, exportação e busca**: Evolução da interface do dashboard com paginação, filtros interativos por atributos, busca textual e exportação de dados.
- **Deploy com ambientes separados**: Configuração de infraestrutura segregada para desenvolvimento, homologação e produção.
- **Testes automatizados**: Implementação de suíte de testes unitários, de integração e testes de ponta a ponta (E2E).
