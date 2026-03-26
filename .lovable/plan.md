

# Criar Página Dedicada "Esqueci Minha Senha"

## O que será feito

Criar uma nova página `/esqueci-senha` com o AuthLayout, contendo um formulário dedicado para solicitar redefinição de senha. O botão "Esqueci minha senha" na tela de login passará a ser um link para essa nova página.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/pages/EsqueciSenha.tsx` |
| Editar | `src/pages/Login.tsx` — trocar o botão inline por `<Link to="/esqueci-senha">` |
| Editar | `src/App.tsx` — adicionar rota pública `/esqueci-senha` |

## Detalhes

### Nova página `EsqueciSenha.tsx`
- Usa `AuthLayout` (mesmo split-screen das demais telas de auth)
- Card com título "Recuperar Senha", descrição orientando o usuário
- Campo de email com label e validação
- Botão "Enviar link de recuperação" que chama `supabase.auth.resetPasswordForEmail(email, { redirectTo: .../reset-password })`
- Feedback via toast (sucesso/erro)
- Link "Voltar para o login" apontando para `/login`

### Login.tsx
- Remover o `onClick` inline do "Esqueci minha senha"
- Substituir por `<Link to="/esqueci-senha">`

### App.tsx
- Adicionar `<Route path="/esqueci-senha" element={<EsqueciSenha />} />` como rota pública

