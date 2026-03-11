

## Plano: Converter todas as 71 RLS policies de RESTRICTIVE para PERMISSIVE

### Problema

Todas as 71 policies em 23 tabelas estao como RESTRICTIVE. No PostgreSQL, policies RESTRICTIVE so limitam acesso ja concedido por uma policy PERMISSIVE. Sem nenhuma PERMISSIVE, nenhum usuario consegue acessar dados via RLS -- o sistema so funciona se estiver bypassando RLS com service_role.

A migration anterior tentou corrigir isso mas nao foi aplicada com sucesso.

### Solucao

Uma unica SQL migration que:

1. Dropa todas as 71 policies existentes (por tabela)
2. Recria cada uma com `AS PERMISSIVE` explicito (nao depender do default)
3. Mantem exatamente as mesmas regras de acesso (USING/WITH CHECK)

### Tabelas afetadas (23)

aceites_digitais, alteracoes_escopo, aprovacoes, boletins_medicao, clientes, despesas, epis, equipamentos, horas_extras, logs_auditoria, materiais, medicoes, modelos_contrato, notificacoes, obra_checklist, obras, profiles, programacoes, propostas, relatorios_diarios, retencoes, user_roles, valores_unitarios

### Nenhuma alteracao de codigo

Apenas SQL. O frontend ja consome via Supabase client com anon key, que respeita RLS.

