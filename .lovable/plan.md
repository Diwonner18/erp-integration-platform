

## Plano: Modernizar pagina de Cadastro

A pagina de Cadastro usa classes hardcoded (`bg-slate-50`, `text-blue-600`, `text-slate-600`) em vez do design system do projeto. A pagina de Login ja esta correta (`bg-background`, `text-primary`, `shadow-lg`, `font-title`, `font-body`).

### Alteracao: `src/pages/Cadastro.tsx`

Alinhar o estilo com a pagina de Login:

1. **Container**: `bg-slate-50` → `bg-background` (remove o fundo branco destoante)
2. **Card**: adicionar `shadow-lg` para profundidade
3. **Titulo "CT Guedes"**: `text-blue-600` → `text-primary` + adicionar `font-title font-bold`
4. **Subtitulo**: `text-slate-600` → `text-muted-foreground` + `font-body`
5. **CardTitle**: adicionar `font-title text-primary`
6. **CardDescription**: adicionar `font-body`
7. **Labels**: adicionar `font-body text-primary`
8. **Inputs**: adicionar `className="font-body"`
9. **Button**: adicionar `font-body`
10. **Link "Faca login"**: `text-blue-600` → `text-primary` + `font-medium`
11. **Texto rodape**: `text-slate-600` → `text-muted-foreground` + `font-body`

Nenhuma cor nova, nenhum layout novo -- apenas substituir classes hardcoded pelas variaveis do design system, exatamente como o Login.tsx ja faz.

