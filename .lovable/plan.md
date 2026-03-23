

# Etapa 1: Sidebar agrupada + Campo m² na Medição

## 1. Sidebar com agrupamento visual (Sidebar.tsx)

Reorganizar o menu do admin em seções visuais com labels separadores, conforme pedido pelas clientes ("caixinhas" para cada módulo):

```text
ADMINISTRAÇÃO
  Dashboard | Usuários | Permissões | Aprovações | Automação | Relatórios Gerais

COMERCIAL
  Propostas | Valores Unitários | Aceites | Modelos Contrato | Relatórios Comerciais

OBRAS
  Programação | Medições | Alterações de Escopo | Materiais e Equip. | EPIs | Horas Extras | RDO | Relatórios Obra

FINANCEIRO
  Controle Financeiro | Boletins | Despesas | Retenções | Fechamento | Exportar | Relatórios Financeiros
```

**Implementação:**
- Refatorar `getMenuItemsByRole` para retornar arrays agrupados com `{ section: string, items: [...] }`
- Para o role `admin`, mostrar **TODAS** as seções (Administração + Comercial + Obras + Financeiro) com separadores visuais
- Para o `gerenciador_tecnico` sem impersonação, mostrar o mesmo layout completo
- Cada seção renderizada com um label uppercase cinza e um separador sutil
- Manter o comportamento existente para roles individuais (obras, financeira, comercial, cliente)

**Arquivo:** `src/components/Layout/Sidebar.tsx`

---

## 2. Campo metragem (m²) na Medição

**Migration SQL:** Adicionar coluna `metragem` na tabela `medicoes`:
```sql
ALTER TABLE public.medicoes ADD COLUMN IF NOT EXISTS metragem numeric DEFAULT 0;
```

**Frontend:**
- `src/components/Obras/NovaMedicaoModal.tsx`: Adicionar campo "Metragem (m²)" no formulário, campo numérico com step 0.01
- Atualizar o schema Zod para incluir `metragem: z.number().min(0).optional()`
- `src/pages/Obras/Medicoes.tsx`: Exibir metragem na listagem/detalhe quando preenchida

**Hooks:** Atualizar `useCreateMedicao` em `useSupabaseData.ts` para incluir `metragem` no insert

---

## Arquivos modificados
- `src/components/Layout/Sidebar.tsx` (refatoração seções visuais)
- `src/components/Obras/NovaMedicaoModal.tsx` (campo m²)
- `src/pages/Obras/Medicoes.tsx` (exibir m²)
- `src/hooks/useSupabaseData.ts` (incluir metragem no mutation)
- 1 migration SQL (coluna metragem)

