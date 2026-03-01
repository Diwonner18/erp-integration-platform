

## Plano: Corrigir legibilidade do banner + erro de build

### 1. Banner do Dashboard com texto ilegivel (`src/pages/Dashboard.tsx`)

O gradiente `from-primary to-primary/80` usa tons de oliva escuro, e os textos `text-primary-foreground` (que e um bege claro) ficam com baixo contraste, especialmente os subtextos com opacidade (`/70`, `/60`).

**Solucao**: Trocar o fundo do banner para um tom mais escuro e solido, usando `bg-sidebar` (que e `#575547`, o tom mais escuro da paleta) com texto `text-sidebar-foreground` (bege claro `#d6d9c9`). Isso garante contraste forte. Os subtextos usarao `text-sidebar-foreground/80` em vez de `/70` e `/60`.

```
bg-sidebar rounded-lg p-6 text-sidebar-foreground
h1: text-sidebar-foreground (bege claro sobre fundo escuro)
p: text-sidebar-foreground/80
span: text-sidebar-foreground/70
```

### 2. Erro de build (`src/pages/Obras/ObrasConcluidas.tsx`)

O arquivo importa `@tanstack/react-table` que nao esta instalado. O arquivo ja nao usa nenhuma funcionalidade do react-table (nao chama `useReactTable`, usa `<Table>` do shadcn). Basta remover os imports nao utilizados das linhas 9-14 e 68.

### Arquivos afetados
- `src/pages/Dashboard.tsx` — banner gradient
- `src/pages/Obras/ObrasConcluidas.tsx` — imports quebrados

