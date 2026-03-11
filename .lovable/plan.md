

## Plano: Popular o sistema conectando Supabase + n8n

### Visao geral

A ideia e criar um fluxo completo onde o Supabase serve como banco de dados real e o n8n popula/processa dados automaticamente. Hoje o sistema inteiro roda em localStorage sem backend. A conexao Supabase + n8n permite que os 14 workflows alimentem o banco e o frontend consuma dados reais.

### Arquitetura

```text
[Frontend Lovable] <---> [Supabase (DB + Auth + Edge Functions)] <---> [n8n Workflows]
                              |                                           |
                              |-- Tabelas reais (obras, medicoes, etc)    |
                              |-- Auth real (email/senha)                 |
                              |-- Edge Functions (webhooks de saida) ---->|
                              |<--- Webhooks de entrada (n8n responde) ---|
```

### Etapas de implementacao

**Etapa 1 -- Conectar Supabase (Lovable Cloud)**
- Ativar Lovable Cloud no projeto
- Criar schema do banco: tabelas `obras`, `propostas`, `medicoes`, `programacoes`, `materiais`, `epis`, `boletins`, `logs_auditoria`, `notificacoes`, `user_roles`
- Configurar autenticacao real (substituir localStorage)
- Aplicar RLS em todas as tabelas

**Etapa 2 -- Edge Functions como ponte para n8n**
- Criar Edge Functions que disparam webhooks n8n quando acoes ocorrem no sistema:
  - `on-proposta-aprovada` → WF-01 (cria obra)
  - `on-programacao-criada` → WF-03 (agenda)
  - `on-medicao-executada` → WF-05 (gera medicao)
  - `on-acao-sensivel` → WF-13 (audit trail)
- Criar Edge Functions que recebem dados do n8n:
  - `webhook-criar-obra` (n8n envia obra criada)
  - `webhook-gerar-medicao` (n8n envia medicao calculada)
  - `webhook-notificacao` (n8n envia alertas)

**Etapa 3 -- Migrar frontend para Supabase**
- Substituir `AuthContext` de localStorage para `supabase.auth`
- Substituir dados mock por queries `supabase.from('tabela').select()`
- Dashboard consome dados reais via React Query + Supabase

**Etapa 4 -- Conectar n8n aos endpoints**
- Atualizar URLs dos webhooks nos 14 workflows para apontar para as Edge Functions do Supabase
- Substituir placeholders (`<__PLACEHOLDER_VALUE__>`) por URLs reais
- Testar fluxo completo: acao no frontend → Edge Function → n8n → processamento → resposta ao banco

### Primeiro passo concreto

Precisamos ativar o Lovable Cloud (Supabase) no projeto. Sem ele, nao ha banco de dados nem Edge Functions para o n8n consumir.

