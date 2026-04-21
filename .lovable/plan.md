
## Análise da finding

A scanner aponta corretamente que o GT (gerenciador_tecnico) pode escrever livremente na tabela `user_roles` para **qualquer user_id**, contornando o fluxo controlado da edge function `manage-user` (que valida e-mails, registra auditoria, etc.).

### Verificação das policies atuais
- **Escalonamento direto a admin/GT via INSERT/UPDATE**: já bloqueado pelas policies RESTRICTIVE existentes (verificado).
- **Auto-atribuição**: já bloqueado por "Prevent self-role assignment/modification/deletion".
- **Gap real**: GT pode INSERT/UPDATE/DELETE roles operacionais (`obras`, `financeira`, `comercial`, `cliente`) para **qualquer outro usuário**, diretamente via API, sem passar pela edge function (que tem auditoria e validação de e-mail). Isso permite manipulação lateral em massa de permissões sem rastro controlado.

## Plano: Forçar GT a usar a edge function `manage-user`

### Migration: revogar acesso direto do GT à tabela `user_roles`

Remover as três policies PERMISSIVE que dão acesso direto ao GT:
- `GT can insert user_roles`
- `GT can update user_roles`
- `GT can delete user_roles`

**Manter** a policy SELECT (`GT can select user_roles`) — GT precisa visualizar a lista de usuários para gerenciá-los pela UI.

**Manter** todas as RESTRICTIVE (defense-in-depth) e a policy de admin (`Admins can manage roles`).

### Resultado
- GT continua vendo todos os roles na tela de Gerenciar Usuários ✓
- GT continua criando/editando usuários **via edge function `manage-user`** (que usa service role, valida e-mails autorizados para admin/GT, registra auditoria) ✓
- GT **não pode mais** escrever diretamente em `user_roles` via API REST/cliente Supabase ✓
- Admin mantém acesso total direto ✓
- Usuários comuns continuam vendo apenas o próprio role ✓

### Verificação de impacto no código
Confirmado: o frontend (`GerenciarUsuarioModal.tsx`) já chama exclusivamente `supabase.functions.invoke('manage-user', ...)` para criar/editar roles. Nenhuma chamada direta a `user_roles` via cliente. A mudança é transparente para a UI.

### Marcar finding como resolvida
Após a migration, marcar `user_roles_gt_self_escalation` como `mark_as_fixed` explicando que o GT agora só pode modificar roles via edge function controlada.

### O que NÃO faremos
- NÃO remover policies do admin
- NÃO remover policies SELECT (GT precisa listar usuários)
- NÃO remover as RESTRICTIVE existentes (defense-in-depth)
- NÃO mexer na edge function `manage-user` (já está correta e endurecida)
- NÃO alterar a função `assign_internal_role` (SECURITY DEFINER, bypassa RLS — usada apenas internamente)
