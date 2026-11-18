# Classificação de Leads

Regras, valores e definições sobre o processo de qualificação de leads com inteligência artificial e fallback determinístico.

## 1. Categorias de Classificação
Os leads são categorizados em:
- **`hot`**: Lead qualificado com alta prioridade de abordagem (direcionado ao CRM e canal comercial).
- **`warm`**: Lead de qualificação intermediária (direcionado ao CRM).
- **`cold`**: Lead de baixa aderência aos critérios atuais (direcionado à nutrição).

## 2. Valores no Banco de Dados (`public.leads`)

### Coluna `classificacao`
- `hot`: **confirmado** no banco de dados.
- `warm`: **confirmado** no banco de dados.
- `cold`: **confirmado** no banco de dados.
- `null`: indica que o lead ainda não foi classificado (processamento em andamento ou pendente).

### Coluna `metodo_classificacao`
- `regras`: **confirmado** no banco de dados.
- `gemini`: **confirmado** no banco de dados.
- `fallback`: **confirmado** no banco de dados.

## 3. Fluxo de Classificação no n8n
O nó legado `"Classificar Lead"` foi removido do fluxo e substituído pela pipeline inteligente com contingência:

1. **`Registrar Novo Lead`**: Insere o novo lead no banco com status inicial de processamento.
2. **`Gemini: Classificar Lead`**: Requisição HTTP para o modelo `gemini-4-hydrogen` com instruções e critérios contextuais de avaliação do cargo e perfil da empresa.
3. **`Validar Classificação`**: Nó de código (*Code*) que avalia o retorno da IA:
   - Se o modelo retornar uma categoria válida (`hot`, `warm` ou `cold`), o lead recebe essa classificação e o atributo `metodo_classificacao = gemini`.
   - Se a resposta for inválida ou ocorrer erro de chamada (ex.: falha de rede ou chave inválida), é acionada a lógica determinística por palavras-chave, atribuindo a categoria resultante com `metodo_classificacao = fallback`.

## 4. Testes e Comportamento Observado

- **Cargo `"estagiario"`**:
  - Classificação: `cold`.
  - Método: `gemini` (resultado coincidente com a regra por palavras-chave).
- **Cargo `"Líder de Crescimento"`**:
  - Classificação: `hot`.
  - Método: `gemini` (a regra determinística atribuiria `warm`; a IA compreendeu a liderança na área de crescimento e qualificou como prioritário).
- **Simulação de Falha de Chamada (chave inválida com *On Error* configurado como *Continue*)**:
  - Classificação: `warm`.
  - Método: `fallback` (contingência determinística por regras executada com sucesso).
