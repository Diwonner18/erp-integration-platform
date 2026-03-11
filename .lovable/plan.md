

## Plano: Migrar paginas restantes para Supabase

### Paginas a migrar

6 paginas ainda usam `useState<any[]>([])` ou arrays vazios hardcoded:

1. **EPIs.tsx** -- `useState<any[]>([])` para registrosEPI, arrays vazios para obras/colaboradores/responsaveis
2. **Materiais.tsx** -- `useState<any[]>([])` para materiais
3. **MateriaisEquipamentos.tsx** -- `useState<any[]>([])` para materiais e equipamentos
4. **EquipeAtiva.tsx** -- arrays vazios para funcionarios, obras, alocacoesDiarias
5. **RelatorioDiarioObra.tsx** -- arrays vazios para obras, relatorios
6. **Programacao.tsx** -- `useState<any[]>([])` para programacoes, aceites, obras

### Hooks ja existentes

Todos os hooks necessarios ja existem em `useSupabaseData.ts`: `useEPIs`, `useMateriais`, `useEquipamentos`, `useObras`, `useProgramacoes`, `useRelatoriosDiarios`, `useCreateEPI`, `useCreateMaterial`, `useDeleteMaterial`, `useUpdateMaterial`, `useCreateEquipamento`, `useDeleteEquipamento`, `useUpdateEquipamento`, `useCreateProgramacao`, `useUpdateProgramacao`, `useCreateRelatorioDiario`.

### Mutations faltantes no hooks

Preciso adicionar ao `useSupabaseData.ts`:
- `useDeleteProgramacao`
- `useUpdateRelatorioDiario`

### Migracao por pagina

**EPIs.tsx**: Substituir `registrosEPI` por `useEPIs()`. Usar `useObras()` para popular select de obras. Modal de registro usa `useCreateEPI()`. Mapear campos: `tipoEPI` -> `tipo`, `colaborador` -> `funcionario`, `dataEntrega` -> `data_entrega`.

**Materiais.tsx**: Substituir `materiais` por `useMateriais()`. Delete usa `useDeleteMaterial()`. Edit usa `useUpdateMaterial()`. Adaptar filtro (`categoria` nao existe na tabela -- usar `fornecedor` ou `status`).

**MateriaisEquipamentos.tsx**: Mesma abordagem -- `useMateriais()` + `useEquipamentos()`. Create/edit/delete usam mutations existentes.

**EquipeAtiva.tsx**: Nao existe tabela `funcionarios` no Supabase. Esta pagina mostra equipe vinculada a obras. Usarei `useProfiles()` + `useUserRoles()` para listar usuarios internos, e `useObras()` para popular selects. Alocacoes diarias permanecem como estado local (nao ha tabela dedicada).

**RelatorioDiarioObra.tsx**: Substituir `obras: string[]` por `useObras()`. Substituir `relatorios` por `useRelatoriosDiarios()`. Salvar usa `useCreateRelatorioDiario()`.

**Programacao.tsx**: Substituir `programacoes` por `useProgramacoes()`. Substituir `obras` por `useObras()`. Nova programacao usa `useCreateProgramacao()`. Editar usa `useUpdateProgramacao()`. Aceites permanecem como estado local (tabela `aceites_digitais` e para propostas, nao programacoes).

### Abordagem

- Importar hooks existentes em cada pagina
- Remover `useState<any[]>([])` e arrays vazios
- Adicionar loading states com Skeleton
- Mapear campos do frontend para colunas reais do banco
- Manter logica de UI (filtros, modais) intacta

