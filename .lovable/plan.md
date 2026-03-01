

## Plano: Remover dados mock e PDFs falsos

### Locais com dados mock identificados

**1. `src/pages/Cliente/MeusRelatorios.tsx`**
- Cards de estatisticas (linhas 148-190): valores hardcoded "R$ 45.200", "7", "R$ 12.800", "R$ 8.400" — substituir por estado vazio (R$ 0, 0 obras, etc.)
- Historico de Investimentos (linhas 200-204): array hardcoded com 4 meses — substituir por array vazio com empty state
- Relatorios Disponiveis / PDFs falsos (linhas 224-228): array hardcoded com 4 PDFs — substituir por array vazio com empty state

**2. `src/pages/Cliente/SolicitarAgendamento.tsx`**
- Agendamentos Recentes (linhas 182-186): array hardcoded com 3 agendamentos — substituir por array vazio com empty state

### Abordagem

Seguir a politica do projeto: arrays vazios, estados limpos, mensagens de "Nenhum dado encontrado" com icones — exatamente como ja funciona em MinhasObras, MinhasPropostas e MeusPagamentos.

