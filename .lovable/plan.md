

# Auto-atribuir Gerenciador Técnico + Acesso a Todas as Áreas

## Resumo

Duas mudanças:
1. **Auto-atribuição**: Ao registrar/logar com `diwonner13@gmail.com`, o role `gerenciador_tecnico` é atribuído automaticamente (sem precisar de admin para configurar).
2. **Menu completo**: O Gerenciador Técnico verá **todos** os itens de menu de **todas** as áreas (Admin + Obras + Financeira + Comercial + Cliente), não apenas o menu admin.

## Mudanças

### 1. Database - Inserir role via migration
Inserir o role `gerenciador_tecnico` para o usuário `diwonner13@gmail.com` diretamente no banco, caso já exista na tabela `auth.users`. Também atualizar o trigger/função `handle_new_user` ou criar uma função que auto-atribui o role ao detectar esse email.

### 2. AuthContext.tsx - Auto-atribuição no login
No fluxo de `login`, se o email for `diwonner13@gmail.com` e não tiver role, auto-atribuir `gerenciador_tecnico` via RPC `assign_internal_role` ou insert direto.

No fluxo de `register`, se o email for `diwonner13@gmail.com`, atribuir `gerenciador_tecnico` em vez de `cliente`.

### 3. Sidebar.tsx - Menu combinado de todas as áreas
Para `gerenciador_tecnico`, em vez de mostrar apenas o menu admin, combinar **todos** os itens de todas as áreas:
- Admin: Usuários, Permissões, Aprovações, Automação
- Obras: Programação, Medições, Alterações de Escopo, Materiais, EPIs, Horas Extras, Relatório Diário
- Financeira: Boletins, Controle Financeiro, Relatórios Financeiros, Exportar, Retenções, Fechamento, Despesas
- Comercial: Propostas, Valores Unitários, Aceites, Modelos de Contrato, Relatórios Comerciais
- Cliente: (visibilidade apenas, já coberto pelos itens acima)

Organizar por seções com separadores visuais (labels de grupo).

### 4. App.tsx - Rotas
Garantir que `gerenciador_tecnico` está em `allowedUserTypes` de **todas** as rotas (já deve estar nas admin, adicionar nas demais como obras, financeira, comercial).

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/contexts/AuthContext.tsx` | Auto-atribuir role no login/register para diwonner13@gmail.com |
| `src/components/Layout/Sidebar.tsx` | Menu combinado com todas as áreas |
| `src/App.tsx` | Adicionar gerenciador_tecnico em todas as rotas |
| Migration SQL | Inserir role + criar função de auto-atribuição no DB |

