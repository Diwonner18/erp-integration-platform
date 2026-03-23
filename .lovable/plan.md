

# Liberar Agente Temporario para Admins (Patricia)

## Alteracao

Uma unica linha em `src/contexts/AuthContext.tsx` (linha 214):

**Antes:**
```typescript
if (user?.type !== 'gerenciador_tecnico' && !user?.isDemo) return;
```

**Depois:**
```typescript
if (user?.type !== 'gerenciador_tecnico' && user?.type !== 'admin' && !user?.isDemo) return;
```

Isso libera o Agente Temporario para todos os admins (patricia.ariki@ctguedes.com.br, carla.todesco@ctguedes.com.br, adm@ctguedes.com.br), mantendo o acesso existente para o GT.

## Arquivo

| Tipo | Arquivo |
|---|---|
| Alteracao | `src/contexts/AuthContext.tsx` (1 linha) |

