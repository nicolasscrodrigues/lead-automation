# Melhorias

Registro do estado atual das funcionalidades e das melhorias futuras mapeadas para a evolução do sistema.

## Já Implementado
- **Formulário de captura**: Interface de submissão de leads no frontend com validação de campos.
- **Proxy de envio ao webhook**: Rota de API (`/api/leads`) que recebe os dados do formulário e repassa ao webhook do n8n com timeout e sem expor a URL interna ao cliente.
- **CRM simulado (Mock CRM)**: Rota de API (`/api/mock-crm/leads`) protegida por cabeçalho com token validado em tempo constante, simulação de indisponibilidade e auditoria gravada em banco.
- **Autenticação e sessão administrativa**: Login e logout com comparação em tempo constante e hash seguro, emissão de JWT em cookie `httpOnly` e proteção de rotas no middleware.
- **Integração com Supabase**: Cliente administrativo restrito ao servidor (`server-only`) com RLS ativo nas tabelas `leads` e `lead_logs`.
- **Validação de ambiente sob demanda**: Leitura modular das variáveis de ambiente necessárias para cada endpoint e etapa de execução.

## Observações de Arquitetura do Workflow
- **Ordem de resposta do webhook**: O nó `"Responder 200"` é executado antes da checagem de duplicidade e da classificação do lead. Como consequência, a resposta de sucesso HTTP 200 é devolvida ao cliente antes da validação contra registros preexistentes no banco e da definição da categoria do lead.

## Melhorias Futuras
Nenhuma das melhorias abaixo está concluída:
- **Normalização de texto ou classificação com LLM (Gemini)**: A regra de classificação atual depende da correspondência exata do texto do cargo, sendo sensível a variações de acentuação e erros de digitação (*typos*). Como evolução, implementar normalização textual prévia ou utilizar modelo de inteligência artificial (Gemini) com fallback determinístico por regras.
- **Ajuste na sincronização da resposta do webhook**: Reavaliar a posição do nó `"Responder 200"` no workflow para que o retorno ao cliente ocorra após a verificação de duplicidade, caso seja necessário informar ao usuário o status do processamento.
- **Limite de tentativas no login**: Implementação de controle de taxa (rate limiting) para evitar tentativas excessivas e mitigar ataques de força bruta.
- **Migrar middleware para proxy (aviso do Next 16)**: Atualização da convenção de proteção de rotas para adequar ao aviso de depreciação do Next.js 16.
- **Revisar 14 vulnerabilidades high do npm audit, sem --force**: Avaliação técnica criteriosa das dependências para resolução de vulnerabilidades apontadas pelo `npm audit`, evitando flags destrutivas que quebrem compatibilidade.
- **Monitoramento e alertas**: Criação de métricas de observabilidade e alertas para falhas na ingestão, erros de banco e indisponibilidade de serviços.
- **Retry com fila para falhas do n8n**: Estruturação de mecanismo de mensageria ou fila com repetição automática caso o webhook esteja indisponível.
- **Notificação real ao time comercial**: Envio de alertas em tempo real (via mensageria ou e-mail) ao detectar novos leads qualificados.
- **Dashboard com paginação, exportação e busca**: Evolução da interface do dashboard com listagem dinâmica dos leads, paginação, filtros por atributos, busca textual e exportação de dados.
- **Deploy com ambientes separados**: Configuração de infraestrutura segregada para desenvolvimento, homologação e produção.
- **Testes automatizados**: Implementação de suíte de testes unitários, de integração e testes de ponta a ponta (E2E).
