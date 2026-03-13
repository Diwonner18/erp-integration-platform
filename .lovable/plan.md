# Overview Final - Sistema CT Guedes

## Estado Atual

Sistema seguro e funcional. Todas as vulnerabilidades das auditorias de segurança corrigidas. Modelo de acesso granular intra-role implementado. Role `gerenciador_tecnico` implementado para `diwonner13@gmail.com`.

## ✅ Implementado

- **Auth**: Supabase Auth com JWT, roles em `user_roles`, admin restrito a `carla@ctguedes.com.br`, gerenciador_tecnico restrito a `diwonner13@gmail.com`, rate limiting login (frontend + GoTrue)
- **RLS**: 26 tabelas com 100% cobertura, 70+ PERMISSIVE + 30+ RESTRICTIVE policies, gerenciador_tecnico com SELECT em todas as tabelas + ALL em user_roles/profiles
- **RLS user_roles**: RESTRICTIVE INSERT bloqueia inserts de usuarios normais. RESTRICTIVE UPDATE bloqueia escalação para admin. **RESTRICTIVE DELETE bloqueia remoção de role admin por não-admins.**
- **RLS clientes (LGPD)**: Funcionarios obras/financeira so veem clientes vinculados a suas obras (via `get_related_cliente_ids()` SECURITY DEFINER)
- **Recursão RLS corrigida**: Funções `get_cliente_ids_for_user`, `get_related_cliente_ids`, `get_obra_ids_for_cliente` (SECURITY DEFINER) quebram ciclo circular entre obras↔clientes
- **V4 IDOR intra-role**: `acessos_compartilhados` + `has_record_access()` SECURITY DEFINER + `AccessGuard` frontend + dialog de niveis (view/edit/all) em Aprovacoes
- **V4 FKs**: Foreign keys confirmadas em `aceites_digitais` (proposta_id → propostas, cliente_id → clientes)
- **V5 RESTRICTIVE DELETE**: Politicas RESTRICTIVE para DELETE em `obras`, `clientes` e `user_roles`
- **V6 Zod validation**: Schemas Zod para todas as entidades com validateInput + validação no FileImportModal
- **V7 Error exposure**: Mensagem generica no ResetPassword (sem expor erro Supabase)
- **V8 Expurgo LGPD**: Edge Function `purge-expired-logs` + pg_cron diario (00:00 UTC) + `insert_audit_log` auto-preenche `data_expiracao` (5 anos). Chamadas não autorizadas retornam 403.
- **Auditoria**: `insert_audit_log` SECURITY DEFINER, RLS admin-only + gerenciador_tecnico
- **Validacao**: Zod em forms + bulk import, senha forte, re-autenticacao em troca de senha
- **Gerenciador Tecnico**: Role `gerenciador_tecnico` no enum `app_role`, vinculado a `diwonner13@gmail.com`, com visibilidade total (SELECT em todas tabelas), gestao de usuarios (manage-user edge function), menu completo no Sidebar, rotas admin liberadas
- **File Import**: Importação automática Excel/PDF com parsing inteligente, preview, mapeamento de colunas, validação Zod, limite 10MB
- **handle_new_user trigger**: Auto-assign roles (GT para diwonner13, admin para carla, cliente para non-company, self_assign_area para company)
- **Edge Functions Auth**: manage-user usa getClaims() para verificação JWT eficiente

## ✅ Auditorias de Segurança - Todas as Correções Aplicadas

| Vulnerabilidade | Severidade | Status |
|---|---|---|
| user_roles sem RLS para INSERT | ALTA | ✅ RESTRICTIVE policy + trigger |
| Frontend insere direto em user_roles | ALTA | ✅ Removido do AuthContext |
| GT pode escalar para admin via API (INSERT) | ALTA | ✅ RESTRICTIVE "GT cannot assign admin role" |
| GT pode escalar para admin via API (UPDATE) | ALTA | ✅ RESTRICTIVE "GT cannot update to admin role" |
| GT pode deletar role admin via API (DELETE) | ALTA | ✅ RESTRICTIVE "GT cannot delete admin role" |
| Recursão infinita RLS obras↔clientes | CRÍTICA | ✅ Funções SECURITY DEFINER |
| PII de clientes exposta para todos internos | MEDIA | ✅ SELECT escopado via get_related_cliente_ids() |
| manage-user usa getUser() | MEDIA | ✅ Migrado para getClaims() |
| File Import sem limite tamanho | MEDIA | ✅ 10MB limit adicionado |
| File Import sem validação Zod | MEDIA | ✅ Validação Zod antes do insert |
| purge-expired-logs público | BAIXA | ✅ Retorna 403 para chamadas não autorizadas |

## ⚠️ Pendente (apenas baixa severidade ou ação manual)

- **V1 (Media)**: Habilitar rate limiting server-side no Supabase Auth Dashboard (Auth > Rate Limits)
- **V9 (Media)**: Considerar criptografia de CPF/CNPJ via pgcrypto/Vault (RLS ja protege)
- **V11 (Baixa)**: Monitoramento de comportamento suspeito via Log Drains/n8n
- **Templates e-mail**: Traduzir templates Supabase Auth para PT-BR no Dashboard
- **Leaked Password Protection**: Habilitar no Supabase Auth Dashboard (Auth > Password Security) - requer plano Pro

## Arquitetura

```
Frontend (React + AccessGuard + Zod + AdvancedFilters + Recharts + FileImport)
  → Supabase (Auth + RLS PERMISSIVE/RESTRICTIVE + has_record_access() + get_*_ids SECURITY DEFINER)
    → Edge Functions (manage-user [getClaims], purge-expired-logs [403 unauthorized], insert_audit_log)
    → pg_cron (purge-expired-logs-daily @ 00:00 UTC)
    → Trigger handle_new_user (auto-assign roles)
```
