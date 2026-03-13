

# Auditoria de Seguranca - Recursao Infinita em RLS

## Problema Critico (Sistema Quebrado)

O sistema esta retornando **500 em todas as queries** que envolvem `obras` ou `clientes` devido a recursao circular nas politicas RLS:

1. `clientes` → policy "Internal users can view related clientes" faz `SELECT FROM obras WHERE ...`
2. `obras` → policy "Clientes view own obras" faz `SELECT FROM clientes WHERE ...`
3. Quando qualquer query com JOIN entre as duas tabelas e executada, PostgreSQL avalia RLS de ambas, criando um loop infinito.

## Solucao

Criar funcoes **SECURITY DEFINER** que bypassam RLS para quebrar o ciclo de recursao, e atualizar as politicas para usa-las.

### Funcoes a criar:

```sql
-- Retorna IDs de clientes vinculados ao user_id (para clientes)
CREATE FUNCTION get_cliente_ids_for_user(uuid) RETURNS SETOF uuid
  SECURITY DEFINER -- bypassa RLS, quebrando recursao

-- Retorna IDs de clientes vinculados as obras do funcionario
CREATE FUNCTION get_related_cliente_ids(uuid) RETURNS SETOF uuid
  SECURITY DEFINER -- bypassa RLS, quebrando recursao
```

### Politicas a atualizar:

| Tabela | Politica | Mudanca |
|---|---|---|
| `obras` | "Clientes view own obras" | Usar `get_cliente_ids_for_user()` em vez de subquery em `clientes` |
| `clientes` | "Internal users can view related clientes" | Usar `get_related_cliente_ids()` em vez de subquery em `obras` |

### Politicas em outras tabelas que tambem referenciam `clientes` via `obras` (potencialmente afetadas):
- `medicoes` → "Clientes view own medicoes" (JOIN obras+clientes)
- `programacoes` → "Clientes view own programacoes" (JOIN obras+clientes)
- `propostas` → "Clientes view own propostas" (subquery em clientes)
- `aceites_digitais` → "Clientes view own aceites" e "Clientes can insert own aceite" (subquery em clientes)

Estas tambem devem usar as funcoes SECURITY DEFINER para prevenir recursao futura.

### Arquivo a modificar:
| Arquivo | Acao |
|---|---|
| Migration SQL (nova) | Criar funcoes SECURITY DEFINER + DROP/CREATE todas as politicas afetadas |

