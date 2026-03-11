

## Plano: Fluxo de solicitacao de acesso com niveis (view/edit/all)

### Resumo

Funcionario solicita acesso a um registro de outro funcionario. O admin ve a solicitacao na tela de Aprovacoes e, ao aprovar, escolhe o nivel de acesso: **visualizar**, **editar** ou **completo** (view+edit+delete).

### 1. Nova tabela `acessos_compartilhados`

```sql
CREATE TABLE public.acessos_compartilhados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tabela text NOT NULL,
  registro_id uuid NOT NULL,
  nivel_acesso text NOT NULL DEFAULT 'view',  -- 'view', 'edit', 'all'
  concedido_por uuid REFERENCES auth.users(id),
  aprovacao_id uuid REFERENCES aprovacoes(id),
  expira_em timestamptz,
  created_at timestamptz DEFAULT now()
);
```

RLS: admin full access, usuario ve proprios acessos.

### 2. Function SECURITY DEFINER `has_record_access`

```sql
CREATE FUNCTION public.has_record_access(
  _user_id uuid, _tabela text, _registro_id uuid, _nivel text
) RETURNS boolean
```

Retorna true se:
- O registro foi criado pelo usuario (`created_by = _user_id`)
- O usuario e admin
- Existe registro em `acessos_compartilhados` com nivel compativel (ex: `_nivel = 'view'` aceita `view`, `edit` ou `all`; `_nivel = 'edit'` aceita `edit` ou `all`; `_nivel = 'delete'` aceita apenas `all`)

### 3. Policies RESTRICTIVE de UPDATE nas tabelas operacionais

Adicionar em 15 tabelas (obras, materiais, equipamentos, medicoes, programacoes, epis, horas_extras, despesas, relatorios_diarios, alteracoes_escopo, boletins_medicao, retencoes, modelos_contrato, valores_unitarios, obra_checklist):

```sql
CREATE POLICY "Restrict update X to creator or shared"
ON public.X FOR UPDATE TO authenticated AS RESTRICTIVE
USING (has_record_access(auth.uid(), 'X', id, 'edit'));
```

Tambem atualizar as policies de DELETE existentes para usar `has_record_access(..., 'delete')` em vez de apenas `created_by`.

### 4. Frontend: Hooks de acesso compartilhado

Em `src/hooks/useSupabaseData.ts`:
- `useAcessosCompartilhados()` - lista acessos do usuario
- `useSolicitarAcesso()` - cria aprovacao do tipo `acesso_registro` com `referencia_tabela` e `referencia_id`

### 5. Frontend: Tela de Aprovacoes com seletor de nivel

Em `src/pages/Admin/Aprovacoes.tsx`:
- Quando `tipo === 'acesso_registro'`, exibir informacoes do solicitante, tabela e registro
- Ao clicar "Aprovar", abrir um dialog/dropdown com 3 opcoes:
  - **Visualizar** (view) - apenas leitura
  - **Editar** (edit) - leitura + edicao
  - **Completo** (all) - leitura + edicao + exclusao
- Ao confirmar, inserir em `acessos_compartilhados` e atualizar status da aprovacao

### 6. Frontend: Botao "Solicitar Acesso" nos modais de edicao

Nos componentes que editam registros (EditProgramacaoModal, EditMaterialModal, etc.):
- Verificar se `created_by !== auth.uid()` e se nao ha acesso compartilhado
- Se nao tem acesso, exibir botao "Solicitar Acesso ao Admin" em vez do formulario de edicao
- Se tem acesso `view`, exibir dados em modo somente leitura
- Se tem acesso `edit` ou `all`, exibir formulario normal

### Arquivos afetados

- **SQL Migration**: tabela `acessos_compartilhados`, function `has_record_access`, 15 policies RESTRICTIVE UPDATE, atualizar 15 policies DELETE
- **`src/hooks/useSupabaseData.ts`**: hooks `useAcessosCompartilhados`, `useSolicitarAcesso`
- **`src/pages/Admin/Aprovacoes.tsx`**: dialog de nivel de acesso ao aprovar `acesso_registro`
- **Modais de edicao**: verificacao de `created_by` e exibicao condicional

