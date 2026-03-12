

# Execucao das 13 Etapas do Roadmap - Plano em Lotes

## Realidade

Implementar tudo de uma vez em uma unica mensagem nao e viavel -- sao mudancas em 30+ arquivos com logica complexa. A melhor abordagem e dividir em **5 lotes**, cada um em uma mensagem separada.

## Sequencia de Lotes

### Lote 1 (esta mensagem, apos aprovacao)
- **Etapa 12 - Identidade Visual**: Layout split-screen moderno nas telas de Login, Cadastro e Reset Password
- **Etapa 1 - Nomenclatura**: Ja foi implementada (Programacao no lugar de Agendamentos) -- apenas validar

### Lote 2 (proxima mensagem)
- **Etapa 2 - Filtros Avancados**: Componente `AdvancedFilters` ja existe e esta em uso em Medicoes. Padronizar em todas as telas de listagem (Propostas, Obras, Materiais, Boletins, etc.)
- **Etapa 10 - Gestao de Senhas**: Fluxo de troca de senha ja implementado com re-autenticacao

### Lote 3
- **Etapa 13 - Botoes Funcionais**: Tornar funcionais botoes de aprovar/rejeitar/editar em Medicoes, Alteracoes de Escopo e Propostas
- **Etapa 4 - Edicao Obras + Aceites Digitais**: Formularios de edicao e assinatura digital

### Lote 4
- **Etapa 3 - Medicoes**: Calculo automatico, anexos, vinculo com programacoes
- **Etapa 5 - Relatorios com Export**: PDF/Excel via bibliotecas client-side
- **Etapa 6 - Horas/Custos**: Taxas configuraveis por obra

### Lote 5
- **Etapa 7 - Dashboards Financeiros**: Graficos Recharts (receita vs despesa, fluxo de caixa)
- **Etapa 8 - Contratos com Alertas**: Vencimentos e renovacoes automaticas
- **Etapa 9 - Materiais/Equipamentos Unificados**: Controle de inventario
- **Etapa 11 - Fechamento Mensal**: Automacao de fechamento

## Lote 1 - Detalhamento Tecnico

### Etapa 12: Identidade Visual (Login, Cadastro, Reset Password)

**O que muda:**
- Layout split-screen: lado esquerdo com banner CT Guedes (fundo primary, logotipo, slogan), lado direito com formulario
- Responsivo: em mobile, banner vira header compacto
- Cores do tema CT Guedes (primary, sidebar background)
- Tipografia Eymen Pro (titulos) + Open Sans (corpo)

**Arquivos a modificar:**
- `src/pages/Login.tsx` -- layout split-screen com painel esquerdo decorativo
- `src/pages/Cadastro.tsx` -- mesmo layout split-screen
- `src/pages/ResetPassword.tsx` -- mesmo layout split-screen

**Estrutura do layout:**
```text
┌──────────────────┬──────────────────┐
│                  │                  │
│   CT GUEDES      │   [Formulario]   │
│   Logotipo       │   Email          │
│   "Sistema de    │   Senha          │
│    Gestao de     │   [Entrar]       │
│    Obras"        │                  │
│                  │                  │
│   bg-sidebar     │   bg-background  │
└──────────────────┴──────────────────┘
```

### Etapa 1: Nomenclatura
Ja implementada. Verificar se algum link residual aponta para `/agendamentos`.

## Creditos Estimados

Cada lote consumira 1 credito (1 mensagem). Total: ~5 mensagens para completar todas as 13 etapas.

## Etapas que NAO podem ser feitas por codigo

- **Rate limiting server-side**: Configuracao manual no Supabase Dashboard
- **Templates de e-mail PT-BR**: Configuracao manual no Supabase Dashboard
- **Integracao n8n**: Requer instancia n8n do usuario

