

## Melhor Opção: Criar usuários via Painel Admin (sem restrição de domínio)

A abordagem mais segura e prática é **permitir que o admin crie usuários com qualquer e-mail** através da Edge Function `manage-user`, mantendo apenas as restrições críticas (admin e gerenciador_tecnico).

### Por que esta é a melhor opção

- **Sem gambiarras**: Não precisa de flags temporárias ou modos de teste para lembrar de desativar
- **Seguro**: Só o admin e o gerenciador técnico podem criar usuários (validado no backend)
- **Prático**: Você cria os usuários de teste direto pelo painel `/admin/usuarios` com seus e-mails pessoais
- **Produção-ready**: Em produção, quando a CT Guedes tiver os e-mails corporativos, funciona igual

### O que muda

**Edge Function `manage-user`** (linha 81): Remover a restrição de domínio `@ctguedes.com.br` para roles operacionais (obras, financeira, comercial). Manter as travas de:
- `admin` = apenas `carla@ctguedes.com.br`
- `gerenciador_tecnico` = apenas `diwonner13@gmail.com`

**Trigger `handle_new_user`**: Ajustar para que e-mails criados via `manage-user` (que já recebem role na criação) não sejam sobrescritos com `cliente`.

### Fluxo de teste

1. Cadastre-se como `carla@ctguedes.com.br` (admin)
2. No painel Admin > Gerenciar Usuários, crie:
   - `seuemail+obras@gmail.com` → role **obras**
   - `seuemail+financeiro@gmail.com` → role **financeira**
   - `seuemail+comercial@gmail.com` → role **comercial**
   - `seuemail+cliente@gmail.com` → role **cliente**
3. Faça login com cada e-mail e teste os módulos

> Dica: O Gmail ignora tudo após o `+`, então todos os e-mails caem na sua caixa de entrada.

### Detalhes técnicos

1. **`manage-user/index.ts`**: Remover a checagem `!email.endsWith('@ctguedes.com.br')` para roles operacionais
2. **`handle_new_user()` trigger**: Adicionar verificação se o usuário já tem role antes de atribuir `cliente` automaticamente (para não sobrescrever o role que a Edge Function já atribuiu)

