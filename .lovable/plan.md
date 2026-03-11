

## Plano: Corrigir Vulnerabilidades V1-V8 e V10

### Vulnerabilidades a corrigir

| ID | Severidade | Descricao |
|---|---|---|
| V1 | CRITICA | Auto-atribuicao de role admin via RLS |
| V2 | ALTA | Restricao admin so no frontend |
| V3 | ALTA | `created_by` nunca preenchido |
| V4 | MEDIA | Senha atual nao validada na troca |
| V5 | MEDIA | Policies RESTRICTIVE em vez de PERMISSIVE |
| V6 | MEDIA | Sem rate limiting no cadastro |
| V7 | MEDIA | Sem validacao de input nas mutations |
| V8 | MEDIA | IDOR depende do RLS (corrigido com V5) |
| V10 | BAIXA | Limite 1000 rows nao tratado |

---

### Correcao V1 + V2: Escalacao de privilegios

**SQL Migration:**
- Dropar policy `Users can insert own role` da tabela `user_roles`
- Criar nova policy que restringe auto-insert apenas ao role `cliente`
- Criar function SECURITY DEFINER `assign_internal_role` que so admin pode chamar, validando que o email alvo e `@ctguedes.com.br`

### Correcao V3: Trigger automatico de `created_by`

**SQL Migration:**
- Criar function `set_created_by()` SECURITY DEFINER que preenche `created_by = auth.uid()` automaticamente
- Criar triggers BEFORE INSERT em todas as tabelas que tem coluna `created_by` (~15 tabelas)

### Correcao V4: Validar senha atual

**Codigo:** Em `AuthContext.tsx`, na funcao `changePassword`, chamar `supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })` antes de `updateUser`. Se falhar, retornar erro.

### Correcao V5: Converter policies para PERMISSIVE

**SQL Migration:**
- Dropar todas as ~50 policies RESTRICTIVE
- Recriar como PERMISSIVE (padrao do Postgres, usa OR logico entre policies do mesmo comando)
- Isso corrige V8 automaticamente

### Correcao V6: Protecao no cadastro

**Codigo:** Habilitar confirmacao de email obrigatoria no Supabase Auth (ja e o padrao). No frontend, mostrar mensagem de confirmacao apos cadastro em vez de redirecionar direto.

### Correcao V7: Validacao Zod nas mutations

**Codigo:** Criar schemas Zod para as entidades principais (obras, propostas, medicoes, materiais) e validar nos hooks de mutation antes de enviar ao Supabase.

### Correcao V10: Paginacao

**Codigo:** Adicionar `.limit(1000)` explicito nas queries e implementar paginacao lazy nas tabelas com potencial de crescimento (obras, medicoes, programacoes, logs_auditoria).

---

### Ordem de execucao

1. SQL Migration com todas as correcoes de banco (V1, V2, V3, V5) em uma unica migration
2. Atualizar `AuthContext.tsx` (V4)
3. Atualizar `useSupabaseData.ts` (V7, V10)
4. Atualizar `Cadastro.tsx` (V6)

