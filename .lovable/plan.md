# Overview Final - Sistema CT Guedes

## Estado Atual

Sistema seguro e funcional. Todas as vulnerabilidades criticas e altas corrigidas. Modelo de acesso granular intra-role implementado. Role `gerenciador_tecnico` implementado para `diwonner13@gmail.com`.

## ✅ Implementado

- **Auth**: Supabase Auth com JWT, roles em `user_roles`, admin restrito a `carla@ctguedes.com.br`, gerenciador_tecnico restrito a `diwonner13@gmail.com`, rate limiting login (frontend)
- **RLS**: 24 tabelas com 100% cobertura, 70+ PERMISSIVE + 30+ RESTRICTIVE policies, gerenciador_tecnico com SELECT em todas as tabelas + ALL em user_roles/profiles
- **V4 IDOR intra-role**: `acessos_compartilhados` + `has_record_access()` SECURITY DEFINER (inclui gerenciador_tecnico) + `AccessGuard` frontend + dialog de niveis (view/edit/all) em Aprovacoes
- **V4 FKs**: Foreign keys confirmadas em `aceites_digitais` (proposta_id → propostas, cliente_id → clientes)
- **V5 RESTRICTIVE DELETE**: Politicas RESTRICTIVE para DELETE em `obras` e `clientes` (created_by ou admin/shared)
- **V6 Zod validation**: Schemas Zod para `horas_extras` e `alteracoes_escopo` com validateInput
- **V7 Error exposure**: Mensagem generica no ResetPassword (sem expor erro Supabase)
- **V8 Expurgo LGPD**: Edge Function `purge-expired-logs` + pg_cron diario (00:00 UTC) + `insert_audit_log` auto-preenche `data_expiracao` (5 anos)
- **Auditoria**: `insert_audit_log` SECURITY DEFINER, RLS admin-only + gerenciador_tecnico
- **Validacao**: Zod em forms, senha forte, re-autenticacao em troca de senha
- **Gerenciador Tecnico**: Role `gerenciador_tecnico` no enum `app_role`, vinculado a `diwonner13@gmail.com`, com visibilidade total (SELECT em todas tabelas), gestao de usuarios (manage-user edge function), menu completo no Sidebar, rotas admin liberadas

## ✅ Roadmap - Todas as Etapas Concluidas

- **Etapa 1 - Nomenclatura**: Padronizada (Programacao)
- **Etapa 2 - Filtros Avancados**: AdvancedFilters em Medicoes, Programacao, Propostas, Boletins, AlteracoesEscopo, HorasExtras
- **Etapa 3 - Medicoes**: Auto-calculo com IGP-M, vinculo com programacoes executadas, NovaMedicaoModal refeito com Supabase
- **Etapa 4 - Aceites Digitais**: Clientes podem aceitar propostas via MinhasPropostas com registro em aceites_digitais
- **Etapa 5 - Relatorios com Export**: exportUtils.ts (jspdf + xlsx), exportacao PDF/Excel em Medicoes, HorasExtras e RelatoriosFinanceiros
- **Etapa 6 - Horas/Custos**: Valor/hora configuravel por registro no formulario de HorasExtras
- **Etapa 7 - Dashboards Financeiros**: Graficos Recharts (BarChart receita vs despesa, AreaChart fluxo de caixa) em ControleFinanceiro, RelatoriosComerciais e Dashboard
- **Etapa 8 - Contratos com Alertas**: Badge "Vencendo" em Propostas + secao de alertas no Dashboard para propostas < 30 dias
- **Etapa 9 - Materiais/Equipamentos Unificados**: Cards de resumo (total materiais, equipamentos, valor estoque, pendentes) em MateriaisEquipamentos
- **Etapa 10 - Gestao de Senhas**: Troca de senha com re-autenticacao + Zod em Configuracoes
- **Etapa 11 - Fechamento Mensal**: Export real via exportUtils com dados filtrados por periodo (medicoes, despesas, boletins, horas extras)
- **Etapa 12 - Identidade Visual**: Layout split-screen em Login, Cadastro, ResetPassword com AuthLayout
- **Etapa 13 - Botoes Funcionais**: Aprovar/rejeitar em Medicoes, AlteracoesEscopo e Propostas com ConfirmationModal + mutations Supabase
- **Etapa 14 - Gerenciador Tecnico**: Role `gerenciador_tecnico` para diwonner13@gmail.com com acesso total de leitura + gestao de usuarios

## ⚠️ Pendente (apenas media/baixa severidade)

- **V1 (Media)**: Habilitar rate limiting server-side no Supabase Auth Dashboard (Auth > Rate Limits)
- **V9 (Media)**: Considerar criptografia de CPF/CNPJ via pgcrypto/Vault (RLS ja protege)
- **V11 (Baixa)**: Monitoramento de comportamento suspeito via Log Drains/n8n
- **Templates e-mail**: Traduzir templates Supabase Auth para PT-BR no Dashboard

## Arquitetura

```
Frontend (React + AccessGuard + Zod + AdvancedFilters + Recharts)
  → Supabase (Auth + RLS PERMISSIVE/RESTRICTIVE + has_record_access())
    → Edge Functions (manage-user, purge-expired-logs, insert_audit_log)
    → pg_cron (purge-expired-logs-daily @ 00:00 UTC)
```
