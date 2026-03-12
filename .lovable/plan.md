

# Auditoria Completa de Seguranca - Sistema CT Guedes

## 1. AUTENTICACAO E AUTORIZACAO

### Pontos Seguros
- Autenticacao via Supabase Auth com JWT, sem localStorage custom para credenciais
- Roles armazenados em tabela separada `user_roles` (nao no profile) - correto
- Admin restrito a `carla@ctguedes.com.br` validado tanto no Edge Function quanto na RPC `assign_internal_role`
- `self_assign_area` valida dominio, impede admin, e bloqueia re-atribuicao
- Rate limiting de login (5 tentativas, 30s lockout)
- Re-autenticacao exigida para troca de senha
- Confirmacao de e-mail obrigatoria no cadastro
- ProtectedRoute valida role no frontend, RLS valida no backend (dupla camada)

### Vulnerabilidade V1 - Rate Limiting Apenas no Frontend (Severidade: MEDIA)
**Risco**: O rate limiting de login (MAX_ATTEMPTS=5, LOCKOUT_SECONDS=30) esta implementado apenas no state do React (`loginAttempts`, `lockoutUntil`). Um atacante pode contornar isso chamando `supabase.auth.signInWithPassword` diretamente via console ou ferramenta externa, ignorando completamente o bloqueio.
**Solucao**: Habilitar rate limiting no Supabase Auth (Auth > Rate Limits no dashboard). O Supabase ja possui rate limiting nativo configuravel, mas deve ser verificado se esta ativado com valores adequados.

### Vulnerabilidade V2 - Fallback de Role Silencioso (Severidade: BAIXA)
**Risco**: Em `buildUser`, se `role` for null, o usuario recebe `type: 'cliente'` como fallback (linha 189). Um funcionario `@ctguedes.com.br` sem role atribuido poderia temporariamente ter acesso a rotas de cliente. Porem, o fluxo de `needsAreaSelection` mitiga isso no login.
**Solucao**: Nenhuma acao imediata necessaria. O fluxo ja trata o caso.

---

## 2. BACKEND, BANCO DE DADOS E SUPABASE

### Pontos Seguros
- 100% das tabelas possuem RLS habilitado
- Politicas PERMISSIVE para acesso base por role + RESTRICTIVE para UPDATE/DELETE por creator/shared
- `has_role()` e `has_record_access()` sao SECURITY DEFINER, evitando recursao em RLS
- `insert_audit_log` e SECURITY DEFINER, captura identidade do servidor
- Trigger `set_created_by` garante que created_by e preenchido automaticamente
- Trigger `rls_auto_enable` garante RLS em novas tabelas automaticamente
- `logs_auditoria` nao permite INSERT/UPDATE/DELETE direto (somente via RPC)

### Vulnerabilidade V3 - Edge Function manage-user com verify_jwt = false (Severidade: ALTA)
**Risco**: O `config.toml` define `verify_jwt = false` para `manage-user`. Embora a funcao valide manualmente o header Authorization e checa `has_role('admin')`, a desativacao do JWT nativo significa que a funcao aceita qualquer request e depende inteiramente da validacao interna. Se houver um bug no codigo de validacao, a funcao fica exposta.
**Mitigacao existente**: A funcao JA valida o JWT manualmente via `supabaseAnon.auth.getUser()` e verifica role admin. O risco residual e baixo, pois a implementacao esta correta.
**Solucao**: Manter como esta (necessario para o padrao signing-keys). A implementacao manual esta adequada.

### Vulnerabilidade V4 - Tabela `aceites_digitais` sem FK validada (Severidade: BAIXA)
**Risco**: As colunas `proposta_id` e `cliente_id` nao possuem foreign keys definidas. Dados podem ser inseridos com IDs invalidos.
**Solucao**: Adicionar foreign keys para `propostas(id)` e `clientes(id)`.

### Vulnerabilidade V5 - Deletes sem politica RESTRICTIVE em algumas tabelas (Severidade: MEDIA)
**Risco**: A tabela `obras` tem politica RESTRICTIVE apenas para UPDATE, mas nao para DELETE. Um usuario com role `obras` pode deletar qualquer obra via RLS PERMISSIVE (ALL). O mesmo ocorre para `clientes` (comercial pode deletar qualquer cliente).
**Solucao**: Adicionar politicas RESTRICTIVE para DELETE em `obras` e `clientes`, limitando a `created_by = auth.uid()` ou admin.

---

## 3. FRONTEND E FLUXOS DE USUARIO

### Pontos Seguros
- Permissoes no frontend sao COMPLEMENTARES ao RLS (nao unica camada)
- Validacao Zod em todos os formularios principais antes do insert
- Nenhum `console.log` com dados sensiveis encontrado
- Nenhum uso de `localStorage.setItem` ou `sessionStorage` para dados sensiveis (exceto sessao Supabase nativa)
- `dangerouslySetInnerHTML` usado apenas no componente chart.tsx do shadcn (CSS, nao dados de usuario)

### Vulnerabilidade V6 - Sem validacao Zod em horas_extras e alteracoes_escopo (Severidade: BAIXA)
**Risco**: `useCreateHorasExtras` e `useCreateAlteracaoEscopo` nao chamam `validateInput()` antes do insert (diferente de todas as outras mutations).
**Solucao**: Criar schemas Zod para essas entidades e adicionar validacao.

### Vulnerabilidade V7 - Erro de reset expoe mensagem do Supabase (Severidade: BAIXA)
**Risco**: Em `ResetPassword.tsx` linha 66: `toast.error('Erro ao redefinir senha: ' + error.message)` expoe a mensagem de erro do Supabase diretamente ao usuario. Pode vazar informacoes do backend.
**Solucao**: Usar mensagem generica: "Erro ao redefinir senha. Tente novamente."

---

## 4. INTEGRACOES EXTERNAS E WEBHOOKS

### Ponto Seguro
- Nao existem integracoes externas ativas (sem WhatsApp, pagamentos, CRM). Os workflows n8n estao documentados mas nao conectados.
- Unica Edge Function (`manage-user`) valida autorizacao corretamente.

**Nenhuma vulnerabilidade encontrada nesta categoria.**

---

## 5. DADOS SENSIVEIS E LGPD

### Pontos Seguros
- Dados em transito protegidos por HTTPS (padrao Supabase)
- Senhas gerenciadas pelo Supabase Auth (hashed com bcrypt)
- Logs de auditoria capturam acoes com metadados de usuario

### Vulnerabilidade V8 - Expurgo automatico de logs LGPD (Severidade: BAIXA)
**Risco**: A coluna `data_expiracao` em `logs_auditoria` existe mas nao ha processo automatico de expurgo. Dados podem ser retidos alem do necessario.
**Status**: Ja documentado como pendente no plan.md.
**Solucao**: Implementar pg_cron ou Edge Function scheduled para deletar registros expirados.

### Vulnerabilidade V9 - CPF/CNPJ armazenados em texto plano (Severidade: MEDIA)
**Risco**: A tabela `clientes` armazena `cpf` e `cnpj` como texto plano. Sao dados sensiveis LGPD.
**Mitigacao existente**: RLS impede acesso nao autorizado.
**Solucao**: Para conformidade total, considerar criptografia em repouso via pgcrypto ou Supabase Vault. Risco pratico e baixo dado que o RLS esta robusto.

---

## 6. EDGE CASES E ATAQUES COMUNS

### Pontos Seguros
- **Acesso direto via URL**: ProtectedRoute redireciona para /login. RLS bloqueia dados no backend.
- **Alteracao de IDs**: RLS RESTRICTIVE impede update/delete de registros alheios.
- **XSS**: Nenhum `dangerouslySetInnerHTML` com dados de usuario. React escapa HTML por padrao.
- **Injection**: Queries via Supabase client (parametrizadas). Nenhum SQL raw.
- **CSRF**: Supabase Auth usa Bearer tokens (nao cookies), imune a CSRF classico.
- **Broken Access Control**: Dupla camada (frontend + RLS).

### Vulnerabilidade V10 - Race Condition em self_assign_area (Severidade: BAIXA)
**Risco**: A funcao `self_assign_area` verifica se usuario ja tem role e depois insere. Em teoria, duas requisicoes simultaneas poderiam contornar a verificacao.
**Mitigacao existente**: O constraint `UNIQUE (user_id, role)` na tabela `user_roles` impede duplicatas.
**Solucao**: O risco e negligivel gracas ao unique constraint.

---

## 7. LOGS, ERROS E OBSERVABILIDADE

### Pontos Seguros
- Nenhum `console.log` em producao
- Logs de auditoria via SECURITY DEFINER (anti-spoofing)
- `logs_auditoria` somente SELECT para admin (nao pode ser adulterada via client)
- Erros no Edge Function retornam mensagens genericas ("Erro interno do servidor")

### Vulnerabilidade V11 - Sem monitoramento de comportamento suspeito (Severidade: BAIXA)
**Risco**: Nao ha alertas automaticos para tentativas de acesso negado, falhas de RLS, ou padroes de ataque.
**Solucao**: Considerar Supabase Log Drains ou monitoramento via n8n para alertas.

---

## RESUMO EXECUTIVO

| ID | Vulnerabilidade | Severidade | Status |
|----|----------------|------------|--------|
| V1 | Rate limiting apenas no frontend | MEDIA | Corrigir |
| V3 | verify_jwt=false (mitigado) | BAIXA* | OK |
| V5 | Falta RESTRICTIVE DELETE em obras/clientes | MEDIA | Corrigir |
| V6 | Falta validacao Zod em 2 mutations | BAIXA | Corrigir |
| V7 | Erro expoe mensagem Supabase | BAIXA | Corrigir |
| V8 | Expurgo LGPD pendente | BAIXA | Pendente |
| V9 | CPF/CNPJ em texto plano | MEDIA | Avaliar |
| V4 | FKs ausentes em aceites_digitais | BAIXA | Corrigir |
| V10 | Race condition mitigada por UK | BAIXA | OK |
| V11 | Sem alertas de comportamento suspeito | BAIXA | Futuro |

**Conclusao**: O sistema esta em bom estado de seguranca. Nenhuma vulnerabilidade CRITICA encontrada. As duas vulnerabilidades de severidade MEDIA mais acionaveis sao V1 (rate limiting server-side) e V5 (politicas RESTRICTIVE para DELETE). Recomendo corrigir essas primeiro.

Deseja que eu implemente as correcoes para V1, V5, V6 e V7?

