# Overview Final de Seguranca - Sistema CT Guedes

## Estado Atual

Sistema seguro e funcional. Todas as vulnerabilidades criticas e altas corrigidas. Modelo de acesso granular intra-role implementado. Bug RLS em `acessos_compartilhados` corrigido (RESTRICTIVE → PERMISSIVE).

## ✅ Implementado

- **Auth**: Supabase Auth com JWT, roles em `user_roles`, admin restrito a `carla@ctguedes.com.br`, rate limiting login (frontend)
- **RLS**: 24 tabelas com 100% cobertura, 70+ PERMISSIVE + 30+ RESTRICTIVE policies
- **V4 IDOR intra-role**: `acessos_compartilhados` + `has_record_access()` SECURITY DEFINER + `AccessGuard` frontend + dialog de niveis (view/edit/all) em Aprovacoes
- **V4 FKs**: Foreign keys confirmadas em `aceites_digitais` (proposta_id → propostas, cliente_id → clientes)
- **V5 RESTRICTIVE DELETE**: Politicas RESTRICTIVE para DELETE em `obras` e `clientes` (created_by ou admin/shared)
- **V6 Zod validation**: Schemas Zod para `horas_extras` e `alteracoes_escopo` com validateInput
- **V7 Error exposure**: Mensagem generica no ResetPassword (sem expor erro Supabase)
- **V8 Expurgo LGPD**: Edge Function `purge-expired-logs` + pg_cron diario (00:00 UTC) + `insert_audit_log` auto-preenche `data_expiracao` (5 anos)
- **Auditoria**: `insert_audit_log` SECURITY DEFINER, RLS admin-only
- **Validacao**: Zod em forms, senha forte, re-autenticacao em troca de senha

## ✅ Roadmap - Etapas Concluidas

- **Etapa 1 - Nomenclatura**: Padronizada (Programacao)
- **Etapa 2 - Filtros Avancados**: AdvancedFilters em Medicoes, Programacao, Propostas, Boletins, AlteracoesEscopo, HorasExtras
- **Etapa 4 - Aceites Digitais**: Clientes podem aceitar propostas via MinhasPropostas com registro em aceites_digitais
- **Etapa 10 - Gestao de Senhas**: Troca de senha com re-autenticacao + Zod em Configuracoes
- **Etapa 12 - Identidade Visual**: Layout split-screen em Login, Cadastro, ResetPassword com AuthLayout
- **Etapa 13 - Botoes Funcionais**: Aprovar/rejeitar em Medicoes, AlteracoesEscopo e Propostas com ConfirmationModal + mutations Supabase

## ⏳ Roadmap - Proximos Lotes

### Lote 4
- **Etapa 4 - Edicao Obras + Aceites Digitais**: Formularios de edicao e assinatura digital

### Lote 4
- **Etapa 3 - Medicoes**: Calculo automatico, anexos, vinculo com programacoes
- **Etapa 5 - Relatorios com Export**: PDF/Excel via bibliotecas client-side
- **Etapa 6 - Horas/Custos**: Taxas configuraveis por obra

### Lote 5
- **Etapa 7 - Dashboards Financeiros**: Graficos Recharts (receita vs despesa, fluxo de caixa)
- **Etapa 8 - Contratos com Alertas**: Vencimentos e renovacoes automaticas
- **Etapa 9 - Materiais/Equipamentos Unificados**: Controle de inventario
- **Etapa 11 - Fechamento Mensal**: Automacao de fechamento

## ⚠️ Pendente (apenas media/baixa severidade)

- **V1 (Media)**: Habilitar rate limiting server-side no Supabase Auth Dashboard (Auth > Rate Limits)
- **V9 (Media)**: Considerar criptografia de CPF/CNPJ via pgcrypto/Vault (RLS ja protege)
- **V11 (Baixa)**: Monitoramento de comportamento suspeito via Log Drains/n8n
- **Templates e-mail**: Traduzir templates Supabase Auth para PT-BR no Dashboard

## Arquitetura

```
Frontend (React + AccessGuard + Zod + AdvancedFilters)
  → Supabase (Auth + RLS PERMISSIVE/RESTRICTIVE + has_record_access())
    → Edge Functions (manage-user, purge-expired-logs, insert_audit_log)
    → pg_cron (purge-expired-logs-daily @ 00:00 UTC)
```
