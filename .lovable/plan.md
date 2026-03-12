

# Agente Temporario - Impersonacao de Roles para Gerenciador Tecnico

## Conceito

Em vez de mostrar todos os menus combinados, o Gerenciador Tecnico vera seu menu admin basico + uma secao "Agente Temporario" com botoes para "entrar" em cada area (Obras, Financeiro, Comercial, Cliente). Ao clicar, o sidebar e as permissoes mudam para mostrar exatamente o que aquele role veria. Um banner fixo indica que esta em modo de impersonacao, com botao para voltar.

## Mudancas

### 1. AuthContext.tsx
- Adicionar estado `impersonatedRole: UserType | null` e funcoes `startImpersonation(role)` / `stopImpersonation()`
- Expor `effectiveType` (role impersonado ou real) e `effectivePermissions` no contexto
- Apenas `gerenciador_tecnico` pode impersonar
- As permissoes retornadas por `hasPermission` passam a refletir o role impersonado quando ativo

### 2. Sidebar.tsx
- Quando `user.type === 'gerenciador_tecnico'` e **nao** esta impersonando: mostrar menu admin basico (Usuarios, Permissoes, Aprovacoes, Automacao) + secao "Agente Temporario" com 4 botoes (Obras, Financeiro, Comercial, Cliente) com icones e cores distintas
- Quando esta impersonando: mostrar o menu do role impersonado + um banner/botao "Voltar ao Gerenciador" no topo
- Navegacao redireciona para Dashboard ao trocar de role

### 3. Componente de Banner (inline no MainLayout ou Sidebar)
- Faixa colorida no topo indicando: "Visualizando como: Obras" com botao X para sair
- Cor varia conforme o role impersonado

### 4. ProtectedRoute.tsx
- Checar `effectiveType` (ou o real type) para permitir acesso — o gerenciador_tecnico real sempre passa, independente do role impersonado

## Arquivos Modificados

| Arquivo | Mudanca |
|---|---|
| `src/contexts/AuthContext.tsx` | Estado de impersonacao + effectiveType |
| `src/components/Layout/Sidebar.tsx` | Secao Agente Temporario + menu dinamico |
| `src/components/Layout/MainLayout.tsx` | Banner de impersonacao |
| `src/components/Auth/ProtectedRoute.tsx` | Usar real type para acesso |

