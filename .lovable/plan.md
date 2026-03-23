

# Etapa 2: Modulo de Colaboradores

Criar o modulo completo de Colaboradores com tabelas no banco, hooks de dados e pagina com abas conforme referencia do Obra Prima.

---

## 1. Banco de Dados (1 migration com todas as tabelas)

### Tabela `colaboradores`
```text
id, nome, cpf, rg, data_nascimento, telefone, celular, email,
cep, logradouro, numero, bairro, complemento, uf, cidade,
data_admissao, cargo, funcao, tipo_contrato (text), salario_base (numeric),
pis_pasep, status (ativo/afastado/desligado),
created_by, created_at, updated_at
```

### Tabela `colaborador_beneficios`
```text
id, colaborador_id (FK), tipo (vr/vt/mobilidade/outro), valor, ativo, created_at
```

### Tabela `colaborador_alocacoes`
```text
id, colaborador_id (FK), obra_id (FK), data_inicio, data_fim, funcao, created_at
```

### Tabela `banco_horas`
```text
id, colaborador_id (FK), tipo (credito/debito), horas (numeric), motivo, data, created_by, created_at
```

### Tabela `faltas_licencas`
```text
id, colaborador_id (FK), tipo (falta_justificada/falta_injustificada/licenca/afastamento),
data_inicio, data_fim, remunerada (boolean), observacoes, created_by, created_at
```

RLS: admin/GT full access, obras manage, financeira view.

---

## 2. Hooks de Dados (useSupabaseData.ts)

Adicionar hooks:
- `useColaboradores()` - listagem com filtro por status
- `useCreateColaborador()` - insert com validacao Zod
- `useUpdateColaborador()` - update
- `useDeleteColaborador()` - delete
- `useColaboradorBeneficios(colaboradorId)` - beneficios do colaborador
- `useCreateBeneficio()` / `useDeleteBeneficio()`
- `useColaboradorAlocacoes(colaboradorId)` - historico de alocacao
- `useCreateAlocacao()` / `useDeleteAlocacao()`
- `useBancoHoras(colaboradorId)` - movimentacoes banco de horas
- `useCreateBancoHoras()`
- `useFaltasLicencas(colaboradorId)` - faltas e licencas
- `useCreateFaltaLicenca()`

---

## 3. Pagina de Colaboradores

### Listagem (`src/pages/Colaboradores/ColaboradoresPage.tsx`)
- Tabela com colunas: Nome, CPF, Cargo, Status, Acoes
- Busca por nome/CPF
- Filtro por status (ativo/afastado/desligado)
- Botao "Novo Colaborador"

### Modal de Detalhe (`src/pages/Colaboradores/ColaboradorDetailModal.tsx`)
Com abas:
- **Dados**: Nome, CPF, RG, Dt. Nascimento, Telefone, Celular, Email, Endereco completo
- **Contratacao**: Data admissao, cargo, funcao, tipo contrato, salario base, PIS/PASEP
- **Beneficios**: Lista de beneficios (VR, VT, Mobilidade), adicionar/remover
- **EPI**: EPIs entregues (busca da tabela `epis` filtrado por colaborador)
- **Historico de Alocacao**: Obras onde trabalhou, datas, funcao (para CNO)
- **Banco de Horas / Faltas**: Saldo, movimentacoes, faltas e licencas

---

## 4. Integracao

- Rota `/colaboradores` no `App.tsx`
- Item "Colaboradores" na secao OBRAS do Sidebar
- Schema Zod em `validationSchemas.ts`

---

## Arquivos

| Tipo | Arquivo |
|---|---|
| Migration | 1 SQL (5 tabelas + RLS) |
| Novo | `src/pages/Colaboradores/ColaboradoresPage.tsx` |
| Novo | `src/pages/Colaboradores/ColaboradorDetailModal.tsx` |
| Alteracao | `src/hooks/useSupabaseData.ts` |
| Alteracao | `src/lib/validationSchemas.ts` |
| Alteracao | `src/App.tsx` (rota) |
| Alteracao | `src/components/Layout/Sidebar.tsx` (item menu) |
| Alteracao | `src/integrations/supabase/types.ts` (auto-atualizado apos migration) |

