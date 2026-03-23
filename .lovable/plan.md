

# Auditoria Completa de Seguranca - Revisao Pos-Correcoes

## PONTOS SEGUROS CONFIRMADOS

1. **V-01 CORRIGIDO** - Demo guard agora tem enforcement server-side via `is_demo_user()` + politicas RESTRICTIVE em 28 tabelas
2. **V-04 CORRIGIDO** - `permissoes_perfil` tem SELECT para usuarios operacionais lerem permissoes do proprio perfil
3. **V-05 CORRIGIDO** - `aprovacoes` INSERT agora e PERMISSIVE com `WITH CHECK (solicitante_id = auth.uid())`
4. **V-07/V-08 CORRIGIDOS** - `useCreateValorUnitario` e `useCreateModeloContrato` agora usam `validateInput` com schemas Zod
5. **RLS abrangente** - Todas as tabelas com PERMISSIVE por role + RESTRICTIVE para UPDATE/DELETE
6. **SECURITY DEFINER functions** - `has_role`, `has_record_access`, `is_demo_user`, `get_user_role`, `insert_audit_log`
7. **Protecao contra escalacao de privilegios** - `user_roles` com RESTRICTIVE impedindo self-escalation
8. **Roles NAO em localStorage** - Verificado: nenhum armazenamento client-side de roles
9. **Validacao Zod** - Todas as mutations principais agora possuem validacao
10. **Auditoria segura** - `insert_audit_log` captura identidade do JWT
11. **Edge Functions protegidas** - JWT + role verification em `manage-user`; HMAC em `send-auth-email`
12. **LGPD** - Expurgo automatico apos 5 anos
13. **Isolamento multi-tenant** - Clientes so veem dados proprios; funcionarios so veem clientes vinculados
14. **Sem XSS** - Nenhum `dangerouslySetInnerHTML` com dados de usuario
15. **Sem vazamento de credenciais** - Nenhum `console.log` expoe tokens/senhas

---

## VULNERABILIDADES REMANESCENTES

### ALTA

**V-03 (mantida): CORS `Access-Control-Allow-Origin: *` em Edge Functions**
- Severidade: **ALTA**
- Local: `manage-user/index.ts`, `send-auth-email/index.ts`, `purge-expired-logs/index.ts`
- Risco: Qualquer dominio pode fazer requests cross-origin. Mitigado por JWT, mas amplia superficie de ataque com tokens roubados.
- Solucao: Restringir ao dominio de producao. Nota: Lovable exige `*` para preview, mas em producao deve ser restrito.
- Status: **Nao corrigido** (requer deploy com dominio definitivo)

---

### MEDIA

**V-02 (rebaixada): Impersonation apenas visual**
- Severidade: **MEDIA** (rebaixada de CRITICA para MEDIA)
- Risco: GT impersonando outro perfil mantem acesso total no RLS. E "by design" para supervisao, mas nao ha enforcement real.
- Mitigacao: Documentar que impersonation e apenas navegacao/visualizacao. Nao e exploitavel externamente pois so GT pode ativar.

**V-06 (mantida): Lockout de brute force apenas client-side**
- Severidade: **MEDIA**
- Risco: Refresh reseta contador. Supabase GoTrue tem rate limiting nativo que mitiga parcialmente.
- Solucao: Verificar configuracao de rate limiting no Supabase Dashboard.

**V-09 (mantida): Assinatura digital fraca em aceites**
- Severidade: **MEDIA**
- Local: `useSupabaseData.ts` linha 751 - `assinatura_digital: aceite_digital_${Date.now()}`
- Risco: Timestamp previsivel, sem captura de IP/user-agent/hash criptografico.
- Solucao: Mover geracao de assinatura para Edge Function com hash incluindo user_id + proposta_id + timestamp + IP.

---

### BAIXA

**V-11 (mantida parcialmente): Rotas sem prop `modulo`**
- Severidade: **BAIXA**
- Rotas faltantes: `/materiais`, `/obras-concluidas`, `/obras-em-andamento`, `/obras-agendadas`, `/equipe-ativa`, `/central-alertas`, `/retencoes/:id`
- Risco: Admin pode desativar modulo mas usuario acessa via URL direta.
- Solucao: Adicionar `modulo` correspondente a cada rota.

**V-12 (mantida): Uso de `as any` em queries**
- Severidade: **BAIXA**
- Local: `useSupabaseData.ts` - `acessos_compartilhados`, `has_record_access`, `retencao_*`
- Solucao: Regenerar types do Supabase.

**V-13 (nova): `useCreateAceiteDigital` atualiza proposta sem validacao de ownership**
- Severidade: **BAIXA**
- Local: `useSupabaseData.ts` linha 755 - `supabase.from('propostas').update({ status: 'aprovada' }).eq('id', params.proposta_id)`
- Risco: RLS ja protege (cliente so ve propostas do proprio cliente_id), mas nao ha validacao explicita no frontend.
- Mitigacao existente: RLS da tabela `propostas` impede update por quem nao tem permissao.

---

## NOVA ANALISE: Pontos Verificados Apos Correcoes

### Tabelas sem INSERT direto pelo frontend (seguro)
- `logs_auditoria` - apenas via RPC `insert_audit_log` (SECURITY DEFINER)
- `user_roles` - apenas via `manage-user` Edge Function ou `self_assign_area` RPC

### Fluxo de Cadastro (seguro)
- `handle_new_user` trigger atribui roles automaticamente
- `self_assign_area` RPC valida: so `@ctguedes.com.br`, so roles operacionais, so se nao tem role

### ProtectedRoute (funcional)
- Verifica `allowedUserTypes` + `modulo` via `hasModuleAccess`
- Admin e GT sempre passam (bypass)
- Paginas operacionais mostram/escondem botoes via `useUserModulePermissions`

### Realtime Notifications (seguro)
- Channel subscription escuta INSERT/UPDATE na tabela `notificacoes`
- RLS garante que usuarios so veem notificacoes proprias (`user_id = auth.uid()`)
- Cleanup do channel no unmount previne memory leaks

---

## RESUMO ATUALIZADO

| Severidade | Qtd | IDs |
|---|---|---|
| Critica | 0 | - |
| Alta | 1 | V-03 |
| Media | 3 | V-02, V-06, V-09 |
| Baixa | 3 | V-11, V-12, V-13 |

### Comparacao com auditoria anterior

| Antes | Agora | Corrigidos |
|---|---|---|
| 2 criticas | 0 criticas | V-01, V-04/V-05 movidos |
| 3 altas | 1 alta | V-04, V-05 corrigidos |
| 5 medias | 3 medias | V-07, V-08 corrigidos |
| 2 baixas | 3 baixas | V-13 nova |

### Prioridade de correcao recomendada
1. **V-11** (rotas sem `modulo`) - rapido de corrigir, adicionar prop em 7 rotas
2. **V-09** (assinatura digital) - mover para Edge Function com hash criptografico
3. **V-03** (CORS) - restringir quando tiver dominio de producao
4. **V-12** (types) - regenerar tipos Supabase

### O que implementar agora
Recomendo corrigir **V-11** (adicionar `modulo` nas 7 rotas faltantes) e **V-12** (remover `as any`). Sao correcoes rapidas sem risco de regressao.

