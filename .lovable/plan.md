

# Auditoria Completa de Seguranca - CT Guedes

---

## 1. AUTENTICACAO E AUTORIZACAO

### Pontos Seguros
- Autenticacao via Supabase Auth com `signInWithPassword` e `signUp`
- Rate limiting no login: 5 tentativas antes de lockout de 30s
- Re-autenticacao obrigatoria para alteracao de senha (`changePassword` verifica senha atual)
- Validacao de senha no cadastro: minimo 8 chars, maiuscula + numero
- Trigger `handle_new_user` atribui roles automaticamente com logica segura
- Funcao `self_assign_area` restrita a emails `@ctguedes.com.br` e roles operacionais
- Impersonacao restrita a admin/GT (nao altera permissoes reais de admin/GT)
- ProtectedRoute valida `allowedUserTypes` e `modulo` via `permissoes_perfil`
- Edge Function `manage-user` valida JWT via `getClaims()` e verifica role admin/GT antes de qualquer operacao

### Vulnerabilidade V-01: Leaked Password Protection desabilitada
- **Severidade: MEDIA**
- **Risco**: Usuarios podem cadastrar senhas que ja foram vazadas em breaches publicos (ex: "Password1")
- **Solucao**: Ativar em Supabase Dashboard > Auth > Security > Enable leaked password protection

### Vulnerabilidade V-02: Politicas de UPDATE em `user_roles` — risco teorico de escalacao GT
- **Severidade: MEDIA** (mitigada pela combinacao de politicas restritivas)
- **Risco**: A policy `Only admins can update to privileged roles` usa USING e WITH CHECK que verificam `role <> ALL (ARRAY['admin', 'gerenciador_tecnico'])`. Isso bloqueia GT de atualizar PARA roles privilegiados (WITH CHECK) e DE roles privilegiados (USING). Analisando todas as 14 policies no `user_roles`, a combinacao efetiva impede escalacao. Porem, a complexidade (14 policies com logicas PERMISSIVE + RESTRICTIVE cruzadas) e fragil e dificil de auditar.
- **Solucao**: Simplificar para 4-5 policies mais claras. Consolidar as 3 RESTRICTIVE de INSERT em uma unica. Adicionar teste automatizado que valida cenarios de escalacao.

---

## 2. BACKEND, BANCO DE DADOS E RLS

### Pontos Seguros
- 100% das tabelas publicas tem RLS habilitado
- Event trigger `rls_auto_enable` garante RLS em tabelas futuras
- Politicas RESTRICTIVE em UPDATE/DELETE nas tabelas operacionais (criador ou acesso compartilhado)
- Funcoes SECURITY DEFINER (`has_role`, `has_record_access`, `get_cliente_ids_for_user`) evitam recursao
- `insert_audit_log` captura identidade do usuario automaticamente da sessao (anti-spoofing)
- Expurgo LGPD automatico via `purge-expired-logs` com retencao de 5 anos
- Tabela `logs_auditoria` sem politicas de INSERT/UPDATE/DELETE = bloqueio total de escrita direta (correto por design)
- Validacao Zod em todas as mutations criticas no frontend

### Vulnerabilidade V-03: `observacoes_internas` expostas ao cliente em `agendamentos`
- **Severidade: MEDIA**
- **Risco**: A coluna `observacoes_internas` na tabela `agendamentos` e visivel ao cliente via `SELECT *` (policy `Clientes can view own agendamentos` nao restringe colunas). Notas internas da equipe podem conter informacoes sensiveis sobre o cliente.
- **Solucao**: Mover `observacoes_internas` para tabela separada (`agendamento_notas_internas`) com RLS que bloqueia acesso do cliente. Alternativa: criar VIEW sem a coluna para acesso do cliente.

### Vulnerabilidade V-04: INSERT de `colaboradores` sem restricao de escopo para role `obras`
- **Severidade: BAIXA**
- **Risco**: Qualquer usuario `obras` pode inserir colaboradores arbitrarios (a policy de INSERT so verifica `has_role('obras')`). O SELECT e UPDATE ja sao corretamente filtrados por alocacao. O risco pratico e baixo porque inserir um colaborador nao concede acesso a dados de outros.
- **Solucao**: Adicionar `created_by = auth.uid()` no WITH CHECK do INSERT, e garantir que o trigger `set_created_by` esta ativo na tabela.

### Achado V-05: Realtime — canal de notificacoes sem autorizacao por topico
- **Severidade: BAIXA** (dados ja filtrados por RLS no SELECT)
- **Risco**: Qualquer usuario autenticado pode se inscrever no canal `notificacoes-realtime` e receber eventos de INSERT. Porem, o Supabase Realtime aplica RLS nas mensagens — o evento so e entregue se o usuario tiver permissao de SELECT no registro. Logo, o risco real e minimo (o usuario nao vera o conteudo de notificacoes de terceiros).
- **Solucao**: Nenhuma acao necessaria. O design atual e seguro porque o RLS do SELECT filtra automaticamente.

---

## 3. FRONTEND E FLUXOS DE USUARIO

### Pontos Seguros
- Nenhum uso de `dangerouslySetInnerHTML` com input de usuario (apenas no `chart.tsx` da biblioteca shadcn com dados estaticos)
- Nenhum segredo armazenado em localStorage/sessionStorage (apenas flags de tour/onboarding)
- Roles determinadas pelo backend (trigger + `user_roles`), nao por localStorage
- Tokens gerenciados pelo Supabase SDK (`auth.storage = localStorage` e padrao seguro)
- Validacao Zod antes de cada mutation (client-side)
- Todas as rotas protegidas por `ProtectedRoute` com verificacao de tipo e modulo

### Achado V-06: Permissoes `permissoes_perfil` default como `true` durante carregamento
- **Severidade: BAIXA**
- **Risco**: Em `useAllUserPermissions`, `hasModuleAccess()` retorna `true` quando `query.data` ainda nao carregou (linha 109). Isso permite flash momentaneo de conteudo protegido no Sidebar. O `ProtectedRoute` tambem depende desse hook, mas tem loading state separado.
- **Solucao**: Alterar default para `false` quando `query.data` e null/undefined: `if (!query.data) return false;`

---

## 4. INTEGRACOES EXTERNAS E WEBHOOKS

### Pontos Seguros
- `send-auth-email`: Valida assinatura HMAC (`x-supabase-webhook-signature`) antes de processar
- `purge-expired-logs`: Valida `service_role_key` via header/body antes de executar
- `manage-user`: Valida JWT via `getClaims()` + verifica role admin/GT
- Resend API key armazenada como Supabase Secret (nao exposta no frontend)
- Nenhuma integracao com APIs externas de pagamento/WhatsApp/CRM no momento

### Achado V-07: Log de email do destinatario em `send-auth-email`
- **Severidade: INFORMATIVA**
- **Risco**: Linha 214 faz `console.log` do email do destinatario. Logs do Edge Function sao visiveis no dashboard Supabase para admins do projeto. Risco minimo, mas nao ideal para LGPD.
- **Solucao**: Substituir por hash parcial: `console.log(\`Email sent: type=\${emailType}, to=\${recipientEmail.substring(0,3)}***\`)`

---

## 5. DADOS SENSIVEIS E LGPD

### Pontos Seguros
- Tabela `colaboradores` com PII (CPF, RG, PIS/PASEP, salario) protegida por RLS granular
- Frontend oculta campos sensiveis para role `obras` (apenas admin/GT/financeira veem)
- Expurgo automatico de logs apos 5 anos (LGPD compliance)
- Funcao `insert_audit_log` registra usuario, acao e dados anteriores/novos
- `logs_auditoria` bloqueada para escrita direta (anti-tamper)
- Clientes isolados por `user_id` e funcoes SECURITY DEFINER

### Achado V-08: Dados de `clientes` (CPF, CNPJ, email, telefone) visiveis para `comercial` sem restricao de coluna
- **Severidade: BAIXA**
- **Risco**: Role `comercial` tem full access a tabela `clientes` incluindo CPF e CNPJ. Isso e provavelmente intencional (comercial precisa desses dados para propostas), mas viola principio de minimizacao se houver usuarios comerciais que nao necessitam desses dados.
- **Solucao**: Avaliar se e necessario restringir. Se sim, criar VIEW sem CPF/CNPJ para comercial operacional.

---

## 6. EDGE CASES E ATAQUES COMUNS

### Pontos Seguros
- **IDOR**: Mitigado por RLS em todas as tabelas — alterar IDs na URL/request nao permite acessar dados de terceiros
- **Injection (SQL)**: Supabase SDK usa queries parametrizadas. Validacao Zod adiciona camada extra
- **XSS**: Sem uso de `dangerouslySetInnerHTML` com input do usuario. React escapa HTML por padrao
- **CSRF**: Supabase usa Bearer tokens (nao cookies de sessao), CSRF nao se aplica
- **Race conditions**: Nao ha fluxos criticos sujeitos a race conditions (operacoes atomicas via Supabase)
- **Acesso direto via URL**: `ProtectedRoute` bloqueia todas as rotas protegidas
- **Requisicoes duplicadas**: React Query previne duplicacao via cache e deduplicacao
- **Replay attacks**: JWT tem expiracao (`autoRefreshToken: true`), tokens expirados sao rejeitados

---

## 7. LOGS, ERROS E OBSERVABILIDADE

### Pontos Seguros
- Erros de API capturados sem expor stacktrace ao usuario (mensagens genericas como "Erro interno do servidor")
- Edge Functions retornam mensagens de erro limpas (sem detalhes internos)
- `console.error` no frontend captura erros para debug sem expor ao usuario
- Auditoria via `insert_audit_log` registra acoes criticas com nivel de sensibilidade

### Achado V-09: `console.error` no AuthContext pode logar detalhes de autenticacao
- **Severidade: INFORMATIVA**
- **Risco**: `console.error('Login error:', error)` pode logar mensagens de erro do Supabase Auth no console do navegador, potencialmente incluindo detalhes sobre a existencia ou nao de contas.
- **Solucao**: Remover ou sanitizar `console.error` em producao

---

## RESUMO EXECUTIVO

| ID | Vulnerabilidade | Severidade | Status |
|----|----------------|------------|--------|
| V-01 | Leaked Password Protection desabilitada | MEDIA | Pendente |
| V-02 | Complexidade excessiva nas policies de user_roles | MEDIA | Risco mitigado, refatoracao recomendada |
| V-03 | `observacoes_internas` expostas ao cliente | MEDIA | Pendente |
| V-04 | INSERT irrestrito de colaboradores por `obras` | BAIXA | Risco pratico minimo |
| V-05 | Realtime sem autorizacao por topico | BAIXA | Mitigado por RLS no SELECT |
| V-06 | Default `true` para permissoes durante loading | BAIXA | Pendente |
| V-07 | Log de email em Edge Function | INFO | Recomendacao |
| V-08 | Dados PII de clientes para comercial | BAIXA | Avaliar necessidade |
| V-09 | console.error com detalhes de auth | INFO | Recomendacao |

**Conclusao**: O sistema demonstra maturidade de seguranca acima da media para aplicacoes Lovable/Supabase. As protecoes fundamentais (RLS 100%, SECURITY DEFINER functions, validacao Zod, JWT verification em Edge Functions, anti-privilege-escalation, LGPD compliance) estao corretamente implementadas. As 3 vulnerabilidades de severidade media sao corrigiveis com mudancas pontuais e nenhuma e critica ou permite acesso nao autorizado imediato.

## PLANO DE CORRECAO (por prioridade)

1. **V-01**: Ativar leaked password protection no dashboard Supabase (1 clique)
2. **V-06**: Alterar default de `hasModuleAccess` para `false` quando dados nao carregaram
3. **V-03**: Mover `observacoes_internas` para tabela separada ou criar VIEW para clientes
4. **V-02**: Simplificar policies de `user_roles` (consolidar 14 → 6-7 policies)
5. **V-07/V-09**: Sanitizar logs em producao

