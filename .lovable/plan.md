

# Auditoria: Colaboradores vs Requisitos das Clientes

## O que JA esta implementado corretamente

| Requisito | Status |
|---|---|
| Abas: Dados, Contratacao, Beneficios, EPI, Historico Alocacao, Banco de Horas/Faltas | OK |
| Campos de Dados: Nome, CPF, RG, Dt. Nascimento, Telefone, Celular, Email, Endereco completo | OK |
| Contratacao: Data admissao, cargo, funcao, tipo contrato, salario base, PIS/PASEP, status | OK |
| Beneficios: VR, VT, Mobilidade com adicionar/remover | OK |
| Historico de Alocacao: vincular a obra, data inicio/fim, funcao | OK |
| Banco de Horas: saldo, lancamentos credito/debito | OK |
| Faltas e Licencas: justificada, injustificada, licenca, afastamento | OK |
| Aba de Encargos removida (conforme pedido) | OK |
| EPI vinculado ao nome do colaborador | OK |
| Listagem com busca por nome/CPF e filtro por status | OK |

## O que FALTA ou precisa de ajuste

### 1. Visual do modal nao segue o Obra Prima (imagem011)
O modal do Obra Prima mostra o layout com labels inline (ao lado dos campos, nao acima), e o titulo "Colaborador: Nome" com indicador de status "Ativo" no rodape junto com botao Salvar. Atualmente o nosso usa labels acima dos campos e o status esta no header como badge.

**Ajuste**: Manter como esta (labels acima e funcionais), pois e mais acessivel e responsivo. O layout inline do Obra Prima e especifico de desktop nativo. O nosso ja atende a funcionalidade.

### 2. Regra de negocio da 3a falta injustificada NAO esta implementada
A ata diz: "A partir da 3a falta sem justificativa o funcionario nao recebe mais dispensa remunerada, tudo vai para banco de horas (a compensar)".

**Falta**: Logica que conta faltas injustificadas e automaticamente converte horas extras em banco de horas quando >= 3 faltas. Isso pode ser feito como alerta visual no frontend + logica no backend via trigger ou edge function.

### 3. Horas Extras com categorias A, B e C nao estao integradas no Colaborador
A tabela `horas_extras` existe mas nao tem campo de categoria (A/B/C) nem os tipos especificos (virada, dobra, continuacao, diaria). O modal do colaborador nao mostra resumo de horas extras.

**Falta**: Campo `categoria` e `tipo_hora_extra` (normal/virada/dobra/diaria/continuacao) na tabela `horas_extras`, e uma sub-secao no modal do colaborador mostrando o resumo.

### 4. Campo "Empresa" nao existe
No Obra Prima (imagem011) existe um campo "Empresa" no topo. No nosso sistema so existe a CT Guedes, entao nao e necessario.

### 5. Aba "Anexos" do Obra Prima nao existe
O Obra Prima tem uma aba "Anexos". As clientes nao pediram isso explicitamente, entao nao e prioridade.

---

## Plano de correcoes necessarias

### Correcao 1: Alerta de 3a falta injustificada (frontend)
- No modal do colaborador, na aba Banco de Horas/Faltas, contar faltas injustificadas
- Se >= 3, exibir um alerta visual: "Este colaborador atingiu 3+ faltas injustificadas. Horas extras devem ser convertidas em banco de horas."
- Arquivo: `ColaboradorDetailModal.tsx`

### Correcao 2: Adicionar campo `colaborador_id` na tabela `epis` (migration)
- Atualmente o EPI e vinculado por nome (texto livre), o que e fragil
- As clientes pediram que o modulo de EPI busque automaticamente o nome dos colaboradores cadastrados
- Adicionar `colaborador_id uuid references colaboradores(id)` na tabela `epis`
- No frontend de EPIs, usar um Select com busca dos colaboradores ao inves de campo texto livre

### Correcao 3: Adicionar tipos de hora extra (migration + frontend)
- Adicionar colunas `categoria text` (A/B/C) e `tipo_hora_extra text` (normal/virada/dobra/diaria/continuacao) na tabela `horas_extras`
- Atualizar a pagina de Horas Extras para incluir esses campos
- No modal do colaborador, adicionar sub-secao mostrando horas extras do colaborador (filtrando por nome ou colaborador_id)

---

## Arquivos afetados

| Arquivo | Mudanca |
|---|---|
| 1 migration SQL | Adicionar `colaborador_id` em `epis` + `categoria`/`tipo_hora_extra` em `horas_extras` |
| `ColaboradorDetailModal.tsx` | Alerta 3a falta + sub-secao horas extras |
| `src/pages/Obras/EPIs.tsx` | Select de colaboradores ao inves de texto livre |
| `src/pages/Obras/HorasExtras.tsx` | Campos categoria e tipo |
| `src/hooks/useSupabaseData.ts` | Atualizar mutations de EPIs e Horas Extras |
| `src/integrations/supabase/types.ts` | Atualizar tipos apos migration |

