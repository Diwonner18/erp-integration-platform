

## Dados de Demonstração para Apresentação

Vou inserir dados realistas de uma empresa de pintura industrial nas tabelas principais do sistema, usando o ID do usuário Diego (`1d25e381-565a-4c4a-9542-68e17fcc3cfb`) como `created_by`. Ao final, entrego o script DELETE para limpeza.

### Dados a inserir

**Clientes (5)**: Empresas industriais fictícias com CNPJ, endereço e contato
- Petrobras S.A., Vale Mineração, CSN Companhia Siderúrgica, Braskem Petroquímica, Usiminas

**Obras (6)**: Em diferentes status para mostrar o pipeline completo
- 2 em andamento (30% e 65% progresso)
- 1 em programação pendente
- 1 concluída
- 1 em execução
- 1 paralisada

**Propostas (5)**: Em vários status (rascunho, enviada, aprovada, rejeitada) com valores entre R$50k-R$500k e datas de validade variadas (algumas próximas do vencimento para ativar o alerta no dashboard)

**Programações (8)**: Atividades da semana atual e próxima, com equipes e horários

**Medições (4)**: Vinculadas às obras em andamento, com percentuais e valores

**Despesas (6)**: Material, mão de obra, equipamentos - últimos 3 meses para popular o gráfico do dashboard

**Boletins de Medição (3)**: Para o módulo financeiro

**Materiais (5)** e **Equipamentos (3)**: Vinculados às obras ativas

### Script de limpeza

Após a apresentação, um único script SQL deleta tudo na ordem correta (respeitando foreign keys):
```
DELETE FROM boletins_medicao WHERE created_by = '<id>';
DELETE FROM medicoes WHERE created_by = '<id>';
DELETE FROM despesas WHERE created_by = '<id>';
DELETE FROM materiais WHERE created_by = '<id>';
DELETE FROM equipamentos WHERE created_by = '<id>';
DELETE FROM programacoes WHERE created_by = '<id>';
DELETE FROM propostas WHERE created_by = '<id>';
DELETE FROM obras WHERE created_by = '<id>';
DELETE FROM clientes WHERE created_by = '<id>';
```

### Observações
- Todos os dados usam `created_by = Diego` para facilitar a limpeza
- Valores, datas e nomes são realistas para o segmento de pintura industrial
- As datas de despesas e boletins cobrem os últimos 3 meses para popular o gráfico "Resumo Mensal" no dashboard
- Propostas com vencimento próximo ativam o alerta amarelo no dashboard

