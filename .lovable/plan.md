

# Implementar Role "Gerenciador Tecnico" para diwonner13@gmail.com

## Resumo

Criar o cargo `gerenciador_tecnico` no sistema, vinculado exclusivamente ao e-mail `diwonner13@gmail.com`. Este role terá acesso quase total ao sistema (visibilidade completa, gestao de usuarios), ficando abaixo apenas do Admin Principal (`carla@ctguedes.com.br`).

## 1. Migracoes de Banco de Dados

### 1a. Adicionar valor ao enum `app_role`
```sql
ALTER TYPE public.app_role ADD VALUE 'gerenciador_tecnico';
```

### 1b. Adicionar RLS policies para o novo role
Adicionar policies PERMISSIVE de SELECT em todas as tabelas de dados (obras, propostas, medicoes, despesas, materiais, equipamentos, epis, horas_extras, programacoes, boletins_medicao, relatorios_diarios, clientes, alteracoes_escopo, retencoes, logs_auditoria, notificacoes, aprovacoes, aceites_digitais, modelos_contrato, valores_unitarios, profiles, user_roles, acessos_compartilhados) para que `gerenciador_tecnico` tenha visibilidade total (SELECT).

Tambem adicionar policies ALL nas tabelas de gestao de usuarios (`user_roles`, `profiles`) para permitir gestao de usuarios.

### 1c. Adicionar policy de leitura de logs para gerenciador_tecnico
```sql
CREATE POLICY "Gerenciador tecnico can view logs"
ON public.logs_auditoria FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
```

## 2. Edge Function `manage-user`

Atualizar para:
- Permitir que `gerenciador_tecnico` (alem de `admin`) chame a funcao
- Impedir que `gerenciador_tecnico` altere o role do Admin Principal (`carla@ctguedes.com.br`)
- Impedir que `gerenciador_tecnico` remova a si proprio
- Permitir que `gerenciador_tecnico` atribua qualquer role, incluindo `admin` (promover usuarios)
- Validar que o role `gerenciador_tecnico` so pode ser atribuido a `diwonner13@gmail.com`
- Permitir `diwonner13@gmail.com` como excecao a regra de e-mails `@ctguedes.com.br` para roles internos

## 3. Frontend - AuthContext.tsx

- Adicionar `'gerenciador_tecnico'` ao type `UserType`
- Adicionar case `gerenciador_tecnico` em `getPermissionsByUserType` com todas as permissoes = `true` (identico ao admin)

## 4. Frontend - Sidebar.tsx

- Adicionar bloco de menu para `gerenciador_tecnico` com os mesmos itens do admin
- Adicionar cor e label: `'gerenciador_tecnico': 'text-cyan-400'` / `'Gerenciador Tecnico'`

## 5. Frontend - App.tsx (Rotas)

- Adicionar `'gerenciador_tecnico'` em todas as rotas que possuem `'admin'` no `allowedUserTypes`

## 6. Frontend - GerenciarUsuarioModal.tsx

- Adicionar opcao `gerenciador_tecnico` no Select de tipo de usuario
- Adicionar validacao: nao permitir editar o role do Admin Principal

## 7. Frontend - GerenciarUsuarios.tsx

- Adicionar `gerenciador_tecnico` no filtro e no `roleLabels`

## 8. DB Functions

Atualizar `assign_internal_role` para aceitar chamadas de `gerenciador_tecnico` alem de `admin`, e adicionar validacao de que `gerenciador_tecnico` so pode ser atribuido a `diwonner13@gmail.com`.

## Arquivos Modificados

| Arquivo | Mudanca |
|---|---|
| Migration SQL | Enum + RLS policies |
| `supabase/functions/manage-user/index.ts` | Permitir gerenciador_tecnico como caller + protecoes |
| `src/contexts/AuthContext.tsx` | Novo UserType + permissoes |
| `src/components/Layout/Sidebar.tsx` | Menu + label + cor |
| `src/App.tsx` | Adicionar role nas rotas admin |
| `src/components/Admin/GerenciarUsuarioModal.tsx` | Opcao no select |
| `src/pages/Admin/GerenciarUsuarios.tsx` | Filtro + label |
| `src/components/Auth/ProtectedRoute.tsx` | Adicionar ao default allowedUserTypes |

