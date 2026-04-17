
## Análise da finding

A tabela `agendamentos` contém PII de clientes (email, telefone, endereço) e `observacoes_internas`. As policies atuais dão acesso total a qualquer usuário com perfil `comercial` ou `obras`, sem filtrar por relacionamento.

**Políticas atuais problemáticas:**
- `Comercial can view agendamentos`: `has_role(auth.uid(), 'comercial')` — vê TODOS
- `Obras can view and update agendamentos`: `has_role(auth.uid(), 'obras')` — vê TODOS
- `Obras can update agendamentos status`: idem para UPDATE

**Contexto operacional (do código `Solicitar Agendamento` e memórias):**
- `agendamentos.user_id` é o cliente que solicitou
- `agendamentos.cliente_id` pode estar vinculado a um cliente da tabela `clientes`
- Comercial e Obras precisam ver agendamentos para processá-los — mas nem todos precisam ver TODOS
- Já existe a função `get_related_cliente_ids(_user_id)` que retorna clientes relacionados a obras do usuário (via `created_by`, `responsavel_id` ou acesso compartilhado)
- Já existe a VIEW `agendamentos_cliente` que omite `observacoes_internas` para clientes

**Risco real:** Vazamento de PII entre funcionários sem necessidade operacional + exposição de notas internas confidenciais.

## Plano: Escopar acesso de Comercial e Obras a agendamentos relevantes

### Mudanças no banco (migration)

**1. Substituir `Comercial can view agendamentos`** por uma versão escopada:
- Comercial só vê agendamentos onde:
  - `cliente_id IS NULL` (agendamentos novos sem cliente vinculado — comercial precisa para qualificar leads), OU
  - `cliente_id IN (SELECT get_related_cliente_ids(auth.uid()))` (clientes já relacionados ao seu trabalho), OU
  - foi ele mesmo quem criou/atendeu (vamos verificar se há campo de atribuição — se não, manter os dois primeiros critérios)

**2. Substituir `Obras can view and update agendamentos`** + `Obras can update agendamentos status` por versão escopada:
- Obras só vê/atualiza agendamentos onde:
  - `cliente_id IS NULL` (precisa ver novos para agendar/programar), OU
  - `cliente_id IN (SELECT get_related_cliente_ids(auth.uid()))`

**3. Manter inalterado:**
- Admin (acesso total — operacional necessário)
- GT (acesso total — supervisão técnica)
- Cliente (já vê apenas os próprios via `user_id = auth.uid()`)
- INSERT por cliente (já correto)

### Justificativa do critério `cliente_id IS NULL`
Quando o cliente solicita um agendamento pela primeira vez, ele ainda não tem registro vinculado em `clientes` (apenas `user_id`). Comercial/Obras precisam ver esses leads para qualificá-los e vinculá-los. Após vinculação, o filtro por `get_related_cliente_ids` se aplica automaticamente.

### Marcar finding como resolvida
Após aplicar a migration, marcar `agendamentos_internal_roles_full_access` como `mark_as_fixed` explicando o escopo aplicado.

### O que NÃO faremos
- NÃO mexer nas políticas de admin, GT e cliente
- NÃO alterar a tabela `agendamentos` em si
- NÃO mexer na VIEW `agendamentos_cliente` (já está correta)
- NÃO criar novos campos — usaremos a função `get_related_cliente_ids` já existente
