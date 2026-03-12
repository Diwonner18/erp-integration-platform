

# Pendencias Restantes - Sistema CT Guedes

## 1. BUG DE SEGURANCA ENCONTRADO (Implementavel)

### `acessos_compartilhados` - Politicas RESTRICTIVE sem PERMISSIVE

**Problema:** Todas as 5 politicas RLS da tabela `acessos_compartilhados` sao RESTRICTIVE. No PostgreSQL, politicas RESTRICTIVE so restringem o que politicas PERMISSIVE ja permitem. Sem nenhuma PERMISSIVE, o resultado e **acesso negado para todos**, incluindo admins.

Isso significa que ninguem consegue criar, ler, editar ou deletar registros de acesso compartilhado via API. A funcao `has_record_access()` continua funcionando (SECURITY DEFINER bypassa RLS), mas a gestao de acessos pela interface esta quebrada.

**Solucao:** Converter as politicas admin de RESTRICTIVE para PERMISSIVE e manter as de usuario como PERMISSIVE tambem:
- Admin ALL → PERMISSIVE
- Users SELECT own → PERMISSIVE

---

## 2. PENDENCIAS MANUAIS (Nao-implementaveis via codigo)

| Item | Severidade | Onde configurar |
|------|-----------|-----------------|
| V1 - Rate limiting server-side | Media | Supabase Dashboard > Auth > Rate Limits |
| Templates e-mail PT-BR | Baixa | Supabase Dashboard > Auth > Email Templates |

---

## 3. PENDENCIAS OPCIONAIS (Avaliar necessidade)

| Item | Severidade | Notas |
|------|-----------|-------|
| V9 - Criptografia CPF/CNPJ | Media | RLS ja protege. Implementar so se exigido |
| V11 - Monitoramento suspeito | Baixa | Log Drains + n8n (futuro) |

---

## 4. ROADMAP DE PRODUTO

As 13 etapas do roadmap de produto continuam pendentes (filtros, medicoes, relatorios, fechamento mensal, etc).

---

## Plano de Implementacao

**Unica acao implementavel agora:** Corrigir as politicas RLS da tabela `acessos_compartilhados`.

Migration SQL:
1. DROP das 5 politicas RESTRICTIVE existentes
2. CREATE politica PERMISSIVE ALL para admins
3. CREATE politica PERMISSIVE SELECT para usuarios (own records)
4. CREATE politica PERMISSIVE INSERT para admins
5. CREATE politica PERMISSIVE UPDATE para admins
6. CREATE politica PERMISSIVE DELETE para admins

Isso restaura o funcionamento correto da gestao de acessos compartilhados na interface.

