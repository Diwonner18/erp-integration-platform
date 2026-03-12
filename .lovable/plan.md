

# Analise Completa: Seguranca + Construcao do Site

Apos inspecionar todo o codigo, identifiquei pendencias em **duas categorias**: seguranca e construcao/UX.

---

## SEGURANCA - Pendencias

### 1. AccessGuard incompleto (Media)
O `AccessGuard` so esta aplicado em **2 de ~8 modais de edicao**:
- **Com AccessGuard:** `EditMaterialModal`, `EditProgramacaoModal`
- **Sem AccessGuard:** `EditEquipamentoModal`, `NovaMedicaoModal`, `SugestaoEscopoModal`, `NovoBoletimModal`, `MedicaoDetailModal`, `ObservacoesFaseModal`

Isso significa que o isolamento intra-role (V4) so funciona para materiais e programacoes. Nos demais modais, qualquer usuario do mesmo role pode editar registros de outros sem restricao no frontend.

### 2. Sem fluxo de "Esqueci minha senha" (Media)
Nao existe nenhuma pagina `/reset-password` nem botao "Esqueci minha senha" na tela de login. Usuarios que esquecerem a senha nao tem como recuperar acesso sem intervencion do admin.

### 3. V8 LGPD - Expurgo de logs (Baixa)
Continua pendente. `logs_auditoria` acumula dados sem limpeza automatica.

---

## CONSTRUCAO DO SITE - Pendencias

### 4. Layout nao responsivo (Alta)
- Sidebar fixa com `w-64` e `fixed left-0` sem versao mobile
- Header com `left-64` fixo
- Main content com `ml-64` fixo
- O hook `useIsMobile` existe mas **nao e usado em lugar nenhum**
- Em telas < 768px, o sidebar sobrepoe todo o conteudo e nao ha hamburger menu

### 5. Sidebar sem botao de logout (Baixa)
O logout so esta no Header. Na sidebar, onde o usuario ve seu nome/role, nao ha opcao de sair. E um padrao de UX esperado.

### 6. Configuracoes na Sidebar ausente (Baixa)
O link para `/configuracoes` nao aparece na sidebar para nenhum tipo de usuario. So e acessivel pelo icone de engrenagem no Header.

---

## Plano de Implementacao

### Etapa 1: Aplicar AccessGuard nos modais restantes
- Adicionar `useCheckRecordAccess` + `<AccessGuard>` em: `EditEquipamentoModal`, `NovaMedicaoModal`, `MedicaoDetailModal`, `SugestaoEscopoModal`, `NovoBoletimModal`, `ObservacoesFaseModal`

### Etapa 2: Fluxo "Esqueci minha senha"
- Adicionar link "Esqueci minha senha" na tela de Login
- Criar pagina `/reset-password` que recebe o token de recovery e permite definir nova senha
- Adicionar rota publica no `App.tsx`

### Etapa 3: Layout responsivo
- Modificar `Sidebar.tsx`: em mobile, sidebar fica oculta com overlay (drawer), ativada por botao hamburger
- Modificar `Header.tsx`: adicionar botao hamburger em mobile, remover `left-64` em telas pequenas
- Modificar `MainLayout.tsx`: remover `ml-64` em mobile
- Usar o hook `useIsMobile` ja existente

### Etapa 4 (opcional): Melhorias menores
- Adicionar link "Configuracoes" e botao "Sair" na sidebar

