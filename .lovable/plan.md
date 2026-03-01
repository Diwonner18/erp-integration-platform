

## Plano: Redesign CSS — Estilo Profissional e Corporativo

O sistema atualmente usa cores hardcoded (`bg-white`, `text-slate-*`, `bg-blue-*`, `border-slate-*`) em **43 arquivos** em vez dos tokens do tema definidos no `index.css`. Isso causa inconsistencia visual e dificulta manutenção. O redesign vai padronizar tudo usando os tokens do tema e aplicar um estilo mais profissional e corporativo.

---

### O que muda (somente CSS/estilo)

**1. Tokens globais (`src/index.css`)**
- Bordas mais definidas (reduzir `--radius` para `0.35rem`)
- Sombras mais sutis e profissionais
- Adicionar classes utilitarias `.card-corporate`, `.page-header`, `.stat-icon` para padronizar componentes recorrentes

**2. StatsCard (`src/components/Dashboard/StatsCard.tsx`)**
- Trocar `bg-white` → `bg-card`, `text-slate-*` → tokens do tema
- Trocar icone `bg-blue-100 text-blue-600` → `bg-primary/10 text-primary`
- Borda lateral esquerda colorida para dar destaque corporativo

**3. Dashboard (`src/pages/Dashboard.tsx`)**
- Trocar gradiente `bg-blue-600/800` → gradiente usando cores do tema (`from-primary to-primary/80`)
- Trocar `bg-white` → `bg-card`, `text-slate-*` → tokens do tema
- Botões de ação rápida: borda sólida em vez de dashed, hover com `bg-accent`

**4. RecentProjects (`src/components/Dashboard/RecentProjects.tsx`)**
- Trocar `bg-white`, `text-slate-*`, `bg-blue-600` → tokens do tema
- Progress bar: `bg-primary` em vez de `bg-blue-600`

**5. Header (`src/components/Layout/Header.tsx`)**
- Trocar alertas `bg-orange-50/blue-50` → cores do tema com opacidade

**6. Todas as 43 paginas com cores hardcoded**
- Busca e substituição global: `bg-white` → `bg-card`
- `text-slate-900` → `text-foreground`
- `text-slate-600` → `text-muted-foreground`
- `text-slate-500` → `text-muted-foreground`
- `text-slate-400` → `text-muted-foreground/70`
- `text-slate-700` → `text-foreground`
- `border-slate-200` → `border-border`
- `border-slate-300` → `border-border`
- `bg-blue-100` → `bg-primary/10`
- `bg-blue-600` → `bg-primary`
- `text-blue-600` → `text-primary`
- `bg-blue-50` → `bg-accent/30`
- `hover:bg-blue-50` → `hover:bg-accent/20`
- `hover:border-blue-400` → `hover:border-primary`
- `hover:text-blue-600` → `hover:text-primary`
- `bg-slate-200` → `bg-muted`

**7. Tipografia reforçada**
- Titulos de pagina: adicionar `font-title` onde falta
- Reduzir uso de `font-bold` em textos secundarios, manter apenas nos titulos principais

---

### O que NAO muda
- Paleta de cores (HSL tokens permanecem identicos)
- Funcionalidades e logica
- Layout e estrutura dos componentes
- Cores semanticas de status (verde/amarelo/vermelho para estados de obras)

### Resultado esperado
Visual mais coeso, profissional e consistente com a identidade CT Guedes, sem nenhuma cor "avulsa" fora do design system.

