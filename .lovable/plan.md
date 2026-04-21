
## Opção D — Aprovação obrigatória de admin para mudanças de role pelo GT

### Objetivo
GT não modifica mais `user_roles` diretamente. Toda atribuição/alteração/remoção de role feita por GT vira uma **solicitação na tabela `aprovacoes`** que precisa ser aprovada por um admin antes de virar efetiva.

### Fluxo novo

```text
GT abre "Gerenciar Usuários"
  └─ Clica em "Novo Usuário" ou "Editar Role"
     └─ Edge function 'manage-user' detecta caller=GT
        ├─ CREATE de usuário: cria auth user + profile, MAS NÃO cria user_role
        │   └─ Cria registro em 'aprovacoes' (tipo='atribuicao_role')
        ├─ UPDATE de role: NÃO altera user_roles
        │   └─ Cria registro em 'aprovacoes' (tipo='alteracao_role')
        └─ Notifica admins via tabela 'notificacoes'

Admin abre "Aprovações Pendentes"
  └─ Vê solicitação com: solicitante (GT), usuário-alvo, role atual, role pretendido
  └─ Aprova → edge function 'apply-role-change' aplica via assign_internal_role
  └─ Rejeita → solicitação fica registrada como rejeitada
```

### Mudanças no banco (migration)

**1. Revogar escrita direta do GT em `user_roles`**
- DROP `GT can insert user_roles`, `GT can update user_roles`, `GT can delete user_roles`
- Mantém SELECT (UI precisa listar)
- Admin mantém acesso total direto

**2. Estender enum `aprovacao_status`** (se necessário) e adicionar campos auxiliares em `aprovacoes`:
- Adicionar coluna `dados_solicitacao jsonb` para armazenar `{ target_user_id, target_email, role_anterior, role_pretendido, action: 'create'|'update'|'delete' }`

**3. Nova função RPC `apply_role_change(_aprovacao_id uuid)`** (SECURITY DEFINER)
- Só admin pode chamar (verifica `has_role(auth.uid(), 'admin')`)
- Lê a aprovação, valida status='aprovada', extrai dados_solicitacao
- Aplica a mudança usando `assign_internal_role` (create/update) ou DELETE direto (com restrições já existentes)
- Marca aprovação como `data_resposta=now()`, `aprovador_id=auth.uid()`
- Registra em `logs_auditoria` via `insert_audit_log`

### Mudanças nas edge functions

**`manage-user/index.ts`** — adicionar lógica de bifurcação:
- Detectar role do caller (admin vs GT)
- Se admin: comportamento atual (aplica direto)
- Se GT:
  - `action='create'`: cria auth user + profile, cria `aprovacoes` com `dados_solicitacao={action:'create', target_user_id, role}`, retorna mensagem "Usuário criado, aguardando aprovação de admin para atribuir role"
  - `action='update_role'`: cria `aprovacoes` com `dados_solicitacao={action:'update', target_user_id, role_anterior, role_pretendido}`, NÃO altera user_roles
  - Cria notificação para todos admins

### Mudanças no frontend

**`src/pages/Admin/Aprovacoes.tsx`** — adicionar suporte ao novo tipo:
- Tipos `atribuicao_role` e `alteracao_role` aparecem na lista
- Renderizar card com: e-mail do alvo, role atual → role pretendido, solicitante (GT)
- Botão "Aprovar" chama RPC `apply_role_change(id)` em vez de só atualizar status
- Botão "Rejeitar" continua igual

**`src/pages/Admin/GerenciarUsuarios.tsx` / `GerenciarUsuarioModal.tsx`** — feedback ao GT:
- Após submit, se response indicar "pending_approval", mostrar toast: "Solicitação enviada. Aguardando aprovação de um administrador."
- Adicionar badge "Pendente aprovação" nas linhas da lista que tenham aprovação pendente (query opcional na tabela aprovacoes)

### O que NÃO faremos
- NÃO mexer em policies de admin (admin segue com acesso direto)
- NÃO mexer em SELECT do GT em user_roles (precisa ver a lista)
- NÃO alterar a função `assign_internal_role` (será reaproveitada)
- NÃO permitir que GT aprove suas próprias solicitações (RLS de aprovacoes já filtra)
- NÃO mexer em DELETE de usuário ainda — escopo desta mudança é apenas role; se quiser cobrir DELETE, me avise

### Detalhes técnicos (resumo)

| Componente | Ação |
|-----------|------|
| Migration | DROP 3 policies GT em user_roles; ADD coluna `dados_solicitacao jsonb` em `aprovacoes`; CREATE FUNCTION `apply_role_change` |
| Edge `manage-user` | Bifurcar fluxo por role do caller; criar aprovação + notificação quando GT |
| Frontend `Aprovacoes.tsx` | Renderizar tipos `atribuicao_role`/`alteracao_role`; chamar RPC ao aprovar |
| Frontend `GerenciarUsuarioModal.tsx` | Toast de "aguardando aprovação" quando response indica pending |
| Memória | Atualizar `mem://security/role-management-hardening` com o novo fluxo |
| Finding | Marcar `user_roles_gt_self_escalation` como fixed |

### Resultado
- GT continua operando pela UI normalmente, mas toda mudança de role passa por admin
- Trilha de auditoria completa: solicitação → aprovação → aplicação
- Admin mantém poder total e direto
- Defesa em profundidade: mesmo se GT chamar API direto, RLS bloqueia escrita
