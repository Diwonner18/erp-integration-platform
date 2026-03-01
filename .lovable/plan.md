

## Plano: Adicionar logotipo nas paginas de Login, Cadastro e Sidebar

### Acoes

1. **Copiar o logotipo** para `src/assets/logotipo.png`

2. **Login.tsx** (linhas 77-79): Substituir `<h1>CT Guedes</h1>` por `<img>` importado do asset, com tamanho adequado (~180px largura), centralizado, com `alt="CT Guedes"`

3. **Cadastro.tsx** (linhas 63-65): Mesma substituicao

4. **Sidebar.tsx** (linha 136): Substituir o `<h1>CT Guedes</h1>` pelo logo em tamanho menor (~120px), adaptado ao fundo escuro com `brightness` ou `invert` CSS filter se necessario (logo e preto, sidebar e escura)

Manter o subtitulo "Sistema de Gestao de Obras" abaixo do logo em todos os locais.

