

# Auditoria Completa de Seguranca - Projeto CT Guedes

---

## 1. PONTOS SEGUROS (ja implementados corretamente)

| Area | Detalhe |
|---|---|
| **RLS em todas as tabelas** | Todas as tabelas do projeto possuem RLS habilitado com politicas por role (admin, obras, financeira, comercial, cliente). Politicas RESTRICTIVE para UPDATE/DELETE limitam ao `created_by` ou acesso compartilhado. |
| **Roles via tabela separada** | `user_roles` usa tabela dedicada (nao em profiles). Funcoes `has_role()` e `get_user_role()` sao SECURITY DEFINER, evitando recursao RLS. |
| **Validacao server-side (Zod)** | Todas as mutations de insert usam schemas Zod (`validateInput`) antes do insert no Supabase. |
| **Proteção admin hardcoded no DB** | `assign_internal_role()` e `self_assign_area()` validam no banco que admin so pode ser `carla@ctguedes.com.br` e GT so pode ser `diwonner13@gmail.com`. |
| **Auditoria via SECURITY DEFINER** | `insert_audit_log()` captura user_id/email/nome do `auth.uid()` diretamente, impedindo spoofing. |
| **Brute force protection** | Login com limite de 5 tentativas + lockout de 30s. |
| **Password change re-auth** | Troca de senha exige re-autenticação com senha atual. |
| **LGPD log purging** | Logs expiram automaticamente apos 5 anos via pg_cron + Edge Function. |
| **Confirmação de e-mail** | Registro exige confirmacao de email antes do acesso. |
| **Impersonation restrita** | `startImpersonation` so funciona se `user.type === 'gerenciador_tecnico'` (client-side). |

---

## 2. VULNERABILIDADES ENCONTRADAS

### CRITICA - Edge Function `manage-user` sem JWT verification efetiva

**Severidade: CRITICA**

O `manage-user` Edge Function tem `verify_jwt = false` no config.toml. Embora a funcao valide o `Authorization` header manualmente via `supabaseAnon.auth.getUser()`, ela usa `getUser()` em vez de `getClaims()`. De acordo com as melhores praticas Supabase atuais, deveria usar `getClaims(token)` para validacao mais eficiente e segura.

Alem disso, a funcao cria usuarios com `supabaseAdmin` (service role key) - se um atacante conseguir um token valido de qualquer usuario autenticado que seja admin/GT, ele pode criar usuarios arbitrarios. Isso em si nao e uma vulnerabilidade (e o comportamento esperado), mas a protecao depende inteiramente da verificacao de role no banco.

**Risco**: Baixo na pratica (a validacao com getUser funciona), mas deveria seguir o padrao recomendado com getClaims.

**Solucao**: Substituir `getUser()` por `getClaims(token)` conforme padrao documentado.

---

### ALTA - `user_roles` sem RLS policies visiveis para INSERT/SELECT

**Severidade: ALTA**

A tabela `user_roles` nao aparece nas politicas RLS listadas no schema fornecido. No entanto, o codigo do frontend faz `INSERT` direto na tabela `user_roles`:

- `AuthContext.tsx` linha 301: `supabase.from('user_roles').insert(...)` durante login
- `AuthContext.tsx` linha 359-364: `supabase.from('user_roles').insert(...)` durante registro
- `useUserRoles()`: `supabase.from('user_roles').select('*')` - le todos os roles

Se a tabela `user_roles` nao tiver RLS ou tiver politicas permissivas, qualquer usuario autenticado poderia:
1. Ler os roles de todos os usuarios
2. Potencialmente inserir roles para si mesmo (privilege escalation)

**Risco**: Um usuario autenticado com role `cliente` poderia inserir `{ user_id: seu_id, role: 'admin' }` se nao houver restricao de INSERT na tabela.

**Solucao**:
- Verificar/criar politicas RLS na tabela `user_roles`:
  - SELECT: somente admin e GT
  - INSERT: somente via funcoes SECURITY DEFINER (`self_assign_area`, `assign_internal_role`, `handle_new_user`)
  - UPDATE/DELETE: somente admin via Edge Function
- Remover inserts diretos do frontend em `user_roles` (linhas 301 e 359-364 do AuthContext)

---

### ALTA - Frontend insere diretamente na tabela `user_roles`

**Severidade: ALTA**

Em `AuthContext.tsx`:
- Linha 301: `supabase.from('user_roles').insert({ user_id: data.user.id, role: 'gerenciador_tecnico' })`
- Linhas 359-364: Inserts diretos para `gerenciador_tecnico` e `cliente`

Esses inserts sao feitos pelo frontend com a anon key. Se a tabela `user_roles` permitir INSERT para usuarios autenticados, qualquer usuario pode escalar privilegios.

**Risco**: Privilege escalation direta.

**Solucao**: 
- Remover todos os `.insert()` em `user_roles` do frontend
- O trigger `handle_new_user` ja cria o role para `diwonner13@gmail.com`
- Para clientes, adicionar logica ao trigger `handle_new_user` para atribuir `cliente` quando nao for email @ctguedes.com.br
- Usar `self_assign_area` (RPC) para atribuicao de area (ja existe e e usado corretamente em `assignUserArea`)

---

### MEDIA - Impersonation so e validada no frontend

**Severidade: MEDIA**

A funcao `startImpersonation` valida `user.type !== 'gerenciador_tecnico'` apenas no client-side. Porem, a impersonation nao afeta as queries ao Supabase - o RLS continua usando o token real do usuario. Isso significa que:
- A impersonation e puramente visual (altera sidebar/permissoes exibidas)
- O usuario GT continua tendo acesso total aos dados via RLS

**Risco**: Baixo - nao ha risco de seguranca real porque RLS nao e afetado. Porem, um usuario GT impersonando "cliente" ainda pode ver todos os dados no banco.

**Solucao**: Documentar que impersonation e apenas cosmética/UX. Nenhuma acao tecnica necessaria.

---

### MEDIA - File Import sem validacao de tamanho de arquivo

**Severidade: MEDIA**

O `FileImportModal` aceita qualquer tamanho de arquivo sem limite. Um arquivo Excel/PDF de centenas de MB poderia causar:
- Consumo excessivo de memoria no browser
- DoS no client-side

**Risco**: Um usuario poderia travar seu proprio browser. Nao afeta outros usuarios.

**Solucao**: Adicionar validacao de tamanho maximo (ex: 10MB) antes de chamar `parseFile()`.

---

### MEDIA - File Import faz bulk insert sem validacao Zod

**Severidade: MEDIA**

O `FileImportModal.tsx` (linha 213) faz `supabase.from(tableName).insert(records)` diretamente, sem passar pela validacao Zod dos schemas (`validateInput`). Os hooks de criação individual (como `useCreateDespesa`) usam Zod, mas a importacao em massa bypassa essa validacao.

**Risco**: Dados malformados ou com valores inesperados podem ser inseridos no banco. RLS ainda protege contra acesso indevido, mas integridade de dados pode ser comprometida.

**Solucao**: Validar cada registro do array com o schema Zod correspondente antes do insert. Coletar erros e mostrar ao usuario quais linhas falharam na validacao.

---

### BAIXA - useUserRoles expoe todos os roles

**Severidade: BAIXA**

`useUserRoles()` faz `select('*')` na tabela `user_roles`. Se RLS permitir, qualquer admin/GT pode ver todos os roles. Isso e esperado para a pagina de gerenciamento de usuarios, mas a query deveria ter politicas RLS adequadas.

**Risco**: Informacao de roles de outros usuarios. Aceitavel para admin/GT.

---

### BAIXA - Lockout de brute force apenas no frontend

**Severidade: BAIXA**

O rate limiting de 5 tentativas + 30s lockout no Login.tsx e implementado com `useState` - reseta ao recarregar a pagina. Supabase Auth tem seu proprio rate limiting server-side (GoTrue), entao ha uma camada de protecao adicional.

**Risco**: Um atacante sofisticado pode fazer requests diretamente a API do Supabase Auth, ignorando o frontend. Porem, GoTrue tem rate limiting proprio.

**Solucao**: Confiar no rate limiting do GoTrue como camada primaria. O frontend e uma camada de UX adicional.

---

### BAIXA - Anon key exposta no codigo-fonte

**Severidade: BAIXA (esperado)**

A anon key do Supabase esta no `client.ts` e `.env`. Isso e o comportamento esperado e documentado do Supabase - a anon key e publica e a seguranca depende do RLS.

**Risco**: Nenhum, desde que RLS esteja configurado corretamente.

---

## 3. INTEGRAÇÕES EXTERNAS E WEBHOOKS

Nao foram encontradas integracoes com APIs externas de pagamento, WhatsApp ou CRM no codigo frontend/backend atual. Os workflows n8n estao documentados mas nao integrados via codigo. Nenhum webhook endpoint foi encontrado alem das Edge Functions.

O `purge-expired-logs` Edge Function tem `verify_jwt = false` - correto porque e chamado via pg_cron/pg_net internamente. Porem, tambem e acessivel publicamente. Deveria validar um header/secret ou verificar que o caller e interno.

---

## 4. DADOS SENSIVEIS E LGPD

| Dado | Tabela | Protecao |
|---|---|---|
| CPF/CNPJ | clientes | RLS por role |
| Email/telefone | clientes, profiles | RLS por role |
| Enderecos | clientes, obras | RLS por role |
| Valores financeiros | despesas, medicoes, etc | RLS por role |
| Logs de auditoria | logs_auditoria | Somente admin/GT podem ler. Ninguem pode inserir via API (apenas RPC). Expurgo automatico 5 anos. |

A protecao e adequada via RLS. Dados em transito sao protegidos por HTTPS (Supabase default). Dados em repouso sao gerenciados pelo Supabase (criptografia a nivel de disco).

---

## 5. RESUMO POR SEVERIDADE

| Severidade | Quantidade | Itens |
|---|---|---|
| **CRITICA** | 0 | (a Edge Function valida auth, embora nao use getClaims) |
| **ALTA** | 2 | RLS de user_roles possivelmente ausente; Frontend insere direto em user_roles |
| **MEDIA** | 3 | Impersonation client-only; File import sem limite de tamanho; File import sem validacao Zod |
| **BAIXA** | 3 | useUserRoles expoe roles; Lockout client-side; purge-expired-logs acessivel publicamente |

---

## 6. RECOMENDACOES PRIORITARIAS

1. **URGENTE**: Verificar e corrigir RLS da tabela `user_roles` - garantir que INSERT so e possivel via funcoes SECURITY DEFINER
2. **URGENTE**: Remover inserts diretos em `user_roles` do AuthContext.tsx - usar trigger `handle_new_user` e RPC `self_assign_area`
3. **IMPORTANTE**: Adicionar validacao Zod no FileImportModal antes do bulk insert
4. **IMPORTANTE**: Adicionar limite de tamanho de arquivo no FileImportModal (max 10MB)
5. **DESEJAVEL**: Migrar `manage-user` Edge Function para usar `getClaims()` em vez de `getUser()`
6. **DESEJAVEL**: Proteger `purge-expired-logs` com validacao de origem interna

