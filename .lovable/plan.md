

# Auditoria Completa de Seguranca - CT Guedes

---

## PONTOS JA SEGUROS

1. **Autenticacao via Supabase Auth** - Sessoes gerenciadas pelo Supabase, sem tokens em localStorage manual.
2. **RLS ativa em todas as 23 tabelas** - Todas as 70+ policies sao PERMISSIVE e funcionais.
3. **Roles no banco via `user_roles`** - Nao armazenados em localStorage ou perfil.
4. **Admin restrito no banco** - Function `assign_internal_role` impede atribuicao de admin a emails fora de `carla@ctguedes.com.br`.
5. **Logs de auditoria via SECURITY DEFINER** - `insert_audit_log` preenche identidade automaticamente, impedindo spoofing.
6. **Validacao de inputs com Zod** - Schemas definidos para todas as entidades principais (obras, propostas, medicoes, etc).
7. **Validacao de senha atual** - `changePassword` verifica `signInWithPassword` antes de permitir alteracao.
8. **Confirmacao de e-mail obrigatoria** - Registro exibe tela de confirmacao, nao redireciona ao dashboard.
9. **Nenhum uso de localStorage** para dados sensíveis ou controle de acesso.
10. **Nenhum `dangerouslySetInnerHTML` com dados do usuario** - Apenas usado no chart.tsx com CSS statico.

---

## VULNERABILIDADES ENCONTRADAS

### CRITICA - V1: Auto-atribuicao de role interno por funcionarios

**Arquivo:** `src/contexts/AuthContext.tsx` linhas 296-317

**Problema:** O `assignUserArea` faz `supabase.from('user_roles').insert({ user_id: userId, role: area })` diretamente. A RLS em `user_roles` permite `INSERT` para `authenticated` com `WITH CHECK ((user_id = auth.uid()) AND (role = 'cliente'))`. Isso deveria bloquear roles internos, MAS o `AreaSelectionModal` so oferece `obras`, `financeira`, `comercial` - todas seriam barradas pela RLS. Entretanto, se um usuario com email `@ctguedes.com.br` tentar inserir diretamente, a RLS impede. **O fluxo do frontend falha silenciosamente** - o usuario nunca consegue selecionar sua area via este modal.

**Risco:** Funcionalidade quebrada para novos funcionarios. Nenhum risco de escalacao de privilegios porque a RLS bloqueia, mas o onboarding esta inoperante.

**Severidade:** ALTA (funcionalidade critica quebrada)

**Solucao:** O `assignUserArea` deve usar `supabase.rpc('assign_internal_role', { _target_user_id: userId, _role: area })`. Porem, essa RPC exige que o **chamador** seja admin. Para o fluxo de auto-selecao, criar uma nova function SECURITY DEFINER `self_assign_area` que:
- Verifica `auth.uid() = _target_user_id`
- Verifica que o email e `@ctguedes.com.br`
- Verifica que o usuario nao tem role ainda
- Bloqueia role `admin`
- Permite apenas `obras`, `financeira`, `comercial`

---

### ALTA - V2: Modal de gerenciar usuarios e fake (nao persiste)

**Arquivo:** `src/components/Admin/GerenciarUsuarioModal.tsx` linhas 59-83

**Problema:** O `onSubmit` faz `await new Promise(resolve => setTimeout(resolve, 1000))` - um mock. Nao cria usuario no Supabase Auth, nao atribui role, nao atualiza perfil. O admin pensa que criou/editou um usuario, mas nada acontece.

**Risco:** O sistema de gerenciamento de usuarios esta completamente nao-funcional. O admin nao consegue criar usuarios ou alterar roles.

**Severidade:** ALTA

**Solucao:** Para criar usuario: usar `supabase.auth.admin.createUser()` via Edge Function (nao disponivel no client). Para editar role: usar `supabase.rpc('assign_internal_role', ...)`.

---

### ALTA - V3: Nenhuma tabela tem policy de DELETE

**Evidencia:** Query `pg_policies WHERE cmd = 'DELETE'` retorna vazio. As policies `ALL` cobrem DELETE, entao admin, obras, financeira, comercial com policy `ALL` podem deletar. Porem, **nao ha DELETE policies especificas** para limitar quem pode deletar o que. Isso significa que qualquer usuario com role `obras` pode deletar QUALQUER obra, material, EPI, programacao - nao apenas os que ele criou.

**Risco:** Funcionario com role `obras` pode deletar dados de qualquer obra, incluindo dados criados por outros. Nao ha isolamento por `created_by` ou `responsavel_id`.

**Severidade:** ALTA

**Solucao:** Para tabelas operacionais, adicionar restricoes de DELETE por `created_by = auth.uid()` ou exigir role admin para delecao. Alternativamente, implementar soft delete.

---

### MEDIA - V4: IDOR potencial em updates

**Arquivo:** `src/hooks/useSupabaseData.ts`

**Problema:** Todas as mutations de update usam `.eq('id', id)` onde o `id` vem do frontend. A RLS com `ALL` baseada em role (ex: `has_role(auth.uid(), 'obras')`) permite que qualquer usuario com role `obras` atualize QUALQUER registro de obras, materiais, medicoes, etc - nao apenas os proprios.

**Risco:** Funcionario A de obras pode alterar dados de obras gerenciadas pelo funcionario B. Nao ha isolamento intra-role.

**Severidade:** MEDIA (mitigado pelo fato de que a equipe de obras e pequena e confiavel, mas viola principio de minimo privilegio)

**Solucao:** Adicionar policies RESTRICTIVE adicionais com `USING (created_by = auth.uid() OR responsavel_id = auth.uid())` para UPDATE em tabelas operacionais, ou aceitar o risco como decisao de negocio documentada.

---

### MEDIA - V5: Sem rate limiting no login

**Arquivo:** `src/pages/Login.tsx`

**Problema:** Nao ha protecao contra brute force no formulario de login. O Supabase tem rate limiting interno, mas nao ha feedback no frontend sobre tentativas excessivas.

**Severidade:** MEDIA (mitigado parcialmente pelo rate limiting do Supabase)

**Solucao:** Adicionar contador de tentativas no frontend com cooldown progressivo (3 tentativas -> esperar 30s). Considerar habilitar CAPTCHA no Supabase Auth.

---

### MEDIA - V6: Dados sensiveis em console.log

**Arquivo:** `src/pages/Financeiro/DetalhesRetencao.tsx` linhas 101, 112, 136, 155

**Problema:** Dados financeiros (valores de pagamento, tipos, IDs de retencao) sao logados no console do navegador.

**Severidade:** MEDIA

**Solucao:** Remover todos os `console.log` com dados de negocio. Usar apenas para erros em desenvolvimento.

---

### BAIXA - V7: Senha minima de 6 caracteres

**Arquivo:** `src/pages/Cadastro.tsx` linha 37, `src/pages/Configuracoes.tsx` linha 21

**Problema:** O requisito minimo de 6 caracteres e fraco para uma aplicacao empresarial com dados financeiros e pessoais.

**Severidade:** BAIXA

**Solucao:** Aumentar para 8 caracteres minimo. Adicionar requisitos de complexidade (maiuscula, numero, caractere especial).

---

### BAIXA - V8: Sem politica de retencao de dados (LGPD)

**Problema:** A tabela `logs_auditoria` tem campo `data_expiracao` mas nao ha mecanismo automatico de expurgo. Dados pessoais em `clientes` (CPF, CNPJ, telefone, email) nao tem politica de retencao definida.

**Severidade:** BAIXA (risco regulatorio, nao tecnico)

**Solucao:** Criar um cron job (pg_cron ou Edge Function scheduled) para expurgar logs expirados. Documentar politica de retencao de dados pessoais.

---

## RESUMO

| # | Vulnerabilidade | Severidade | Tipo |
|---|----------------|-----------|------|
| V1 | Auto-atribuicao de area quebrada | CRITICA | Funcionalidade |
| V2 | Modal gerenciar usuarios e mock | ALTA | Funcionalidade |
| V3 | Sem restricao de DELETE intra-role | ALTA | Broken Access Control |
| V4 | IDOR potencial em updates intra-role | MEDIA | Broken Access Control |
| V5 | Sem rate limiting no login | MEDIA | Brute Force |
| V6 | Console.log com dados financeiros | MEDIA | Information Disclosure |
| V7 | Senha minima fraca | BAIXA | Authentication |
| V8 | Sem expurgo automatico LGPD | BAIXA | Compliance |

---

## PLANO DE CORRECAO PROPOSTO (por prioridade)

### Fase 1 - Critico (imediato)
1. Criar function `self_assign_area` SECURITY DEFINER e atualizar `assignUserArea` para usar RPC
2. Implementar `GerenciarUsuarioModal` real com Edge Function para criar usuarios e RPC para atribuir roles

### Fase 2 - Alto
3. Implementar soft delete ou restringir DELETE por `created_by` nas tabelas operacionais

### Fase 3 - Medio
4. Remover `console.log` com dados sensiveis
5. Adicionar rate limiting visual no login
6. Avaliar necessidade de isolamento intra-role para updates

### Fase 4 - Baixo
7. Fortalecer requisitos de senha
8. Implementar expurgo automatico de logs

