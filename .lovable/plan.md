

## Trocar Favicon da Lovable pela Logo CT Guedes

### Objetivo
Substituir o favicon atual (ícone da Lovable) pela logo da CT Guedes que o usuário enviou.

### Arquivos Necessários

1. **Copiar imagem**: `user-uploads://image-25.png` → `public/favicon.png`
   - A imagem já está no formato adequado (logo da CT Guedes com fundo cinza)

2. **Atualizar `index.html`**: Adicionar linha do favicon
   ```html
   <link rel="icon" href="/favicon.png" type="image/png" />
   ```

### Fluxo
1. Copiar a logo enviada para `public/favicon.png`
2. Adicionar a tag `<link rel="icon">` no `<head>` do `index.html`

### Resultado
A aba do navegador exibirá a logo "CG Guedes" ao invés do ícone da Lovable.

