# Classificação de Leads

Regras, valores e definições sobre o processo de qualificação de leads com inteligência artificial e fallback determinístico.

## 1. Categorias de Classificação
Os leads são classificados nas seguintes categorias padronizadas, com suporte aos valores legados em inglês:
- **`quente`** (legado: `hot`): Lead qualificado com alta prioridade de abordagem (direcionado ao CRM e canal comercial).
- **`morno`** (legado: `warm`): Lead de qualificação intermediária (direcionado ao CRM).
- **`frio`** (legado: `cold`): Lead de baixa aderência aos critérios atuais (direcionado à nutrição).

## 2. Valores no Banco de Dados (`public.leads`)

### Coluna `classificacao`
- Categorias padronizadas: `quente`, `morno`, `frio`.
- Valores legados: `hot`, `warm`, `cold` (presentes em registros anteriores e suportados na aplicação).
- `null`: indica que o lead ainda não foi classificado (processamento em andamento ou pendente).

### Coluna `metodo_classificacao`
- `regras`: **confirmado** no banco de dados.
- `gemini`: **confirmado** no banco de dados.
- `fallback`: **confirmado** no banco de dados.

## 3. Fluxo de Classificação no n8n
O nó legado `"Classificar Lead"` foi substituído pela pipeline inteligente com contingência:

1. **`Registrar Novo Lead`**: Insere o novo lead no banco com status inicial de processamento.
2. **`Gemini: Classificar Lead`**: Requisição HTTP para o modelo `gemini-4-hydrogen` com instruções e critérios contextuais de avaliação do cargo e perfil da empresa.
3. **`Validar Classificação`**: Nó de código (*Code*) que avalia o retorno da IA:
   - Se o modelo retornar uma categoria válida (`quente`/`hot`, `morno`/`warm` ou `frio`/`cold`), o lead recebe a classificação correspondente e o atributo `metodo_classificacao = gemini`.
   - Se a resposta for inválida ou ocorrer erro de chamada (ex.: falha de rede ou chave inválida), aciona a lógica determinística por palavras-chave com `metodo_classificacao = fallback`.

## 4. Testes e Comportamento Observado

- **Cargo `"estagiario"`**:
  - Classificação: `frio` (registrado originalmente como `cold`).
  - Método: `gemini` (resultado coincidente com a regra por palavras-chave).
- **Cargo `"Líder de Crescimento"`**:
  - Classificação: `quente` (registrado originalmente como `hot`).
  - Método: `gemini` (a regra determinística atribuiria morno/`warm`; a IA compreendeu a liderança na área de crescimento e qualificou como prioritário).
- **Simulação de Falha de Chamada (chave inválida com *On Error* configurado como *Continue*)**:
  - Classificação: `morno` (registrado originalmente como `warm`).
  - Método: `fallback` (contingência determinística por regras executada com sucesso).
