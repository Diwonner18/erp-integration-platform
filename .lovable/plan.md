# Overview Final - Sistema CT Guedes

## Estado Atual

Sistema seguro e funcional. Todas as vulnerabilidades das auditorias de segurança corrigidas. Modelo de acesso granular intra-role implementado. Role `gerenciador_tecnico` implementado para `diwonner13@gmail.com`.

## ✅ Implementado

- **Auth**: Supabase Auth com JWT, roles em `user_roles`, admin restrito a `carla@ctguedes.com.br`, gerenciador_tecnico restrito a `diwonner13@gmail.com`, rate limiting login (frontend + GoTrue)
- **RLS**: 26 tabelas com 100% cobertura, 70+ PERMISSIVE + 30+ RESTRICTIVE policies, gerenciador_tecnico com SELECT em todas as tabelas + ALL em user_roles/profiles
- **RLS user_roles**: RESTRICTIVE INSERT policy bloqueia inserts diretos de usuarios normais. Policy "GT cannot assign admin role" impede GT de escalar para admin via API direta.
- **RLS clientes (LGPD)**: Funcionarios obras/financeira so veem clientes vinculados a suas obras (created_by, responsavel_id ou acessos_compartilhados)
- **V4 IDOR intra-role**: `acessos_compartilhados` + `has_record_access()` SECURITY DEFINER (inclui gerenciador_tecnico) + `AccessGuard` frontend + dialog de niveis (view/edit/all) em Aprovacoes
- **V4 FKs**: Foreign keys confirmadas em `aceites_digitais` (proposta_id → propostas, cliente_id → clientes)
- **V5 RESTRICTIVE DELETE**: Politicas RESTRICTIVE para DELETE em `obras` e `clientes` (created_by ou admin/shared)
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
| GT pode escalar para admin via API | ALTA | ✅ RESTRICTIVE policy "GT cannot assign admin role" |
| PII de clientes exposta para todos internos | MEDIA | ✅ SELECT escopado por obras relacionadas |
| manage-user usa getUser() | MEDIA | ✅ Migrado para getClaims() |
| File Import sem limite tamanho | MEDIA | ✅ 10MB limit adicionado |
| File Import sem validação Zod | MEDIA | ✅ Validação Zod antes do insert |
| purge-expired-logs público | BAIXA | ✅ Retorna 403 para chamadas não autorizadas |

## ⚠️ Pendente (apenas baixa severidade ou ação manual)

- **V1 (Media)**: Habilitar rate limiting server-side no Supabase Auth Dashboard (Auth > Rate Limits)
- **V9 (Media)**: Considerar criptografia de CPF/CNPJ via pgcrypto/Vault (RLS ja protege)
- **V11 (Baixa)**: Monitoramento de comportamento suspeito via Log Drains/n8n
- **Templates e-mail**: Traduzir templates Supabase Auth para PT-BR no Dashboard
- **Leaked Password Protection**: Habilitar no Supabase Auth Dashboard (Auth > Password Security)

## Arquitetura

```
Frontend (React + AccessGuard + Zod + AdvancedFilters + Recharts + FileImport)
  → Supabase (Auth + RLS PERMISSIVE/RESTRICTIVE + has_record_access())
    → Edge Functions (manage-user [getClaims], purge-expired-logs [403 unauthorized], insert_audit_log)
    → pg_cron (purge-expired-logs-daily @ 00:00 UTC)
    → Trigger handle_new_user (auto-assign roles)
```
