

# Pendencias Restantes - Sistema CT Guedes

## Status Geral

O sistema esta em bom estado de seguranca. Todas as vulnerabilidades criticas e altas foram corrigidas. Restam apenas itens de severidade media e baixa.

---

## SEGURANCA - Pendencias

### 1. V1 - Rate Limiting Server-Side (Severidade: MEDIA) -- MANUAL
O rate limiting de login esta apenas no frontend (React state). Precisa ser habilitado no Supabase Dashboard.

**Como resolver (manual, 2 minutos):**
1. Acesse o Supabase Dashboard > Authentication > Rate Limits
2. Configure: `Rate limit for signing in with email and password` para 5 tentativas por 60 segundos
3. Configure: `Rate limit for sending password reset emails` para 3 por 60 segundos

**Nao e possivel fazer via codigo** -- e configuracao do dashboard.

---

### 2. V4 - Foreign Keys em aceites_digitais (Severidade: BAIXA) -- IMPLEMENTAVEL
O plan.md diz que FKs ja existiam, mas o schema atual mostra que `aceites_digitais` NAO possui foreign keys para `proposta_id` e `cliente_id`. Isso permite insercao de dados com IDs invalidos.

**Solucao:** Migration SQL para adicionar as duas FKs.

---

### 3. V9 - CPF/CNPJ em Texto Plano (Severidade: MEDIA) -- AVALIAR
A tabela `clientes` armazena `cpf` e `cnpj` sem criptografia. RLS protege o acesso, mas para conformidade LGPD total, criptografia em repouso seria ideal.

**Solucao:** Usar `pgcrypto` para encrypt/decrypt ou Supabase Vault. Impacto alto -- requer alterar todas as queries que leem/escrevem esses campos.

**Recomendacao:** O RLS ja protege adequadamente. Implementar apenas se houver requisito regulatorio explicito.

---

### 4. V11 - Monitoramento de Comportamento Suspeito (Severidade: BAIXA) -- FUTURO
Nao ha alertas automaticos para tentativas de acesso negado ou padroes de ataque.

**Solucao futura:** Supabase Log Drains + n8n workflow para alertas via e-mail/WhatsApp.

---

## FUNCIONAL - Pendencias

### 5. Templates de E-mail PT-BR -- MANUAL
Os e-mails de confirmacao, reset de senha e magic link estao em ingles (padrao Supabase).

**Como resolver (manual):**
1. Supabase Dashboard > Authentication > Email Templates
2. Traduzir os templates para portugues

---

### 6. Conexao n8n Workflows -- FUTURO
14 workflows n8n estao documentados em `docs/n8n-workflows/` mas nenhum esta conectado ao sistema.

---

### 7. Roadmap de Produto (do roteiro de 13 etapas)
Funcionalidades de produto pendentes do roadmap original, como filtros avancados, fechamento mensal automatizado, exportacao de relatorios, etc.

---

## RESUMO

| # | Item | Severidade | Tipo | Acao |
|---|------|-----------|------|------|
| 1 | Rate limiting server-side (V1) | Media | Seguranca | Manual no Dashboard |
| 2 | FKs em aceites_digitais (V4) | Baixa | Seguranca | Implementavel |
| 3 | Criptografia CPF/CNPJ (V9) | Media | LGPD | Avaliar necessidade |
| 4 | Monitoramento suspeito (V11) | Baixa | Seguranca | Futuro |
| 5 | Templates e-mail PT-BR | Baixa | UX | Manual no Dashboard |
| 6 | Conexao n8n | Media | Funcional | Futuro |
| 7 | Roadmap produto | -- | Funcional | Continuo |

**Itens que posso implementar agora:** Item 2 (FKs em aceites_digitais).
**Itens manuais:** Itens 1 e 5 (configuracao no Supabase Dashboard).
**Itens para avaliar:** Item 3 (criptografia CPF/CNPJ -- alto impacto, baixo risco pratico).

