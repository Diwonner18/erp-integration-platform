

# Correções na página de Configurações

## Problemas identificados

1. **Bug**: `getUserTypeLabel` não tem mapeamento para `gerenciador_tecnico`, mostrando o texto cru
2. **Notificações e Preferências não persistem**: Switches e selects só atualizam estado local e mostram toast falso; ao recarregar a página, tudo reseta

## Plano

### 1. Corrigir label do gerenciador_tecnico
Adicionar `gerenciador_tecnico: 'Gerenciador Técnico'` no mapa `getUserTypeLabel` em `Configuracoes.tsx`.

### 2. Persistir preferências no banco
- **Migration**: Adicionar coluna `preferencias jsonb default '{}'` na tabela `profiles`
- **Configuracoes.tsx**: 
  - Carregar preferências do profile ao montar o componente
  - Ao salvar notificações ou preferências, fazer `update` na coluna `preferencias` do profile
  - Estrutura do JSON: `{ notifications: {...}, preferences: {...} }`

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/pages/Configuracoes.tsx` | Fix label + carregar/salvar preferências do Supabase |
| Migration SQL | Adicionar coluna `preferencias` na tabela `profiles` |

