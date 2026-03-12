

# Lote 7a - Completar Funcionalidades de EPIs

## Situacao Atual

A tela de EPIs tem criacao e listagem funcionais com Supabase. Faltam:
- **Editar** EPI (nao existe hook `useUpdateEPI` nem UI de edicao)
- **Excluir** EPI (hook `useDeleteEPI` existe mas nao esta conectado na UI)
- **Alertas de validade** (EPIs vencidos ou vencendo em 30 dias)
- **Estatisticas completas** no tab Relatorios (vencidos, vencendo, por tipo de EPI)
- **Estado vazio** quando nao ha registros

## Plano

### 1. Hook `useUpdateEPI` em `useSupabaseData.ts`

Adicionar mutation para atualizar EPI existente (mesmo padrao de `useUpdateHorasExtras`).

### 2. Refatorar `EPIs.tsx`

**Funcionalidades novas:**
- Botao de editar e excluir em cada linha da tabela
- Modal de edicao reutilizando o mesmo formulario do registro (pre-populado)
- Confirmacao antes de excluir (dialog)
- Badge de status na coluna Validade: "Vencido" (vermelho), "Vence em Xd" (amarelo), "Valido" (verde)
- Cards de resumo no topo: Total EPIs, EPIs Vencidos, EPIs Vencendo (30 dias), Colaboradores Atendidos
- Tab Relatorios: tabela por tipo de EPI com quantidades + grafico de distribuicao
- Estado vazio com mensagem e botao de acao

### 3. Sem Migration

Tabela `epis` ja tem todos os campos necessarios. Apenas codigo frontend.

## Arquivos Modificados

| Arquivo | Mudanca |
|---|---|
| `useSupabaseData.ts` | Adicionar `useUpdateEPI` |
| `EPIs.tsx` | Editar, excluir, alertas de validade, stats, estado vazio |

