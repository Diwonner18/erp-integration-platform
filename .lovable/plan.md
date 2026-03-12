

# Importacao Automatica de Arquivos Excel e PDF

## Formatos Analisados (12 arquivos no total)

Alem dos 8 arquivos anteriores, agora temos mais 4 novos formatos:

| Arquivo | Tipo | Estrutura |
|---|---|---|
| **Ficha de EPI** (.xlsx) | Entrega de EPI por funcionario | Header com EMPRESA/EMPREGADO/FUNCAO, tabela com Quantidade, Descricao do Equipamento, C.A, Validade, Entrega. Multiplas paginas (1 por funcionario) |
| **Controle de EPI** (.xlsm) | Estoque de EPI | Seções MOVIMENTACAO/COLABORADOR/ESTOQUE. Colunas: DATA, COLABORADOR, FUNCAO, EPI, SAIDA, EST., RESPONSAVEL |
| **Contas a Pagar** (.xlsx) | Financeiro - contas a pagar | Header empresarial, colunas: Doc, Tipo, Num, Parc, Obra, Fornecedor, Venc, Bruto (R$), Liquido (R$), Data Pgto, Vlr pago, Situacao. ~900 linhas |
| **Contas a Receber** (.xlsx) | Financeiro - contas a receber | Mesma estrutura do Contas a Pagar mas com Cliente em vez de Fornecedor. Situacao: Atrasado/Aberto |

### Desafios adicionais identificados

1. **Ficha de EPI**: Multiplas paginas no mesmo arquivo, cada uma com header repetido (empresa, empregado, funcao) + tabela de itens. Precisa extrair nome do funcionario do header.
2. **Contas a Pagar/Receber**: Headers na linha 13 (linhas 1-12 sao metadata da empresa). Valores em formato BR com ponto de milhar. Colunas vazias intercaladas.
3. **Controle de EPI (.xlsm)**: Formato macro-enabled, mas `xlsx` lib le normalmente. Multiplas seções na mesma aba.

## Plano de Implementacao

### 1. `src/lib/fileParser.ts` -- Motor de parsing

- `parseExcelFile(file: File)`: usa lib `xlsx` (ja instalada)
  - Detecta header automaticamente (primeira linha com 3+ celulas preenchidas e nao-vazias)
  - Preenche celulas vazias com valor da celula acima (unmerge logic)
  - Remove linhas completamente vazias
  - Converte valores BR (`R$ 4.000,00` -> `4000.00`, datas BR `dd/mm/yyyy`)
  - Suporte a multiplas sheets (retorna array)
- `parsePdfFile(file: File)`: usa `pdfjs-dist` (nova dependencia)
  - Extrai texto por pagina, tenta identificar linhas tabulares
  - Retorna mesmo formato padronizado
- Interface: `{ headers: string[], rows: Record<string, any>[], sheetName?: string }`

### 2. `src/components/shared/FileImportModal.tsx` -- Modal 3 etapas

**Etapa 1 - Upload**: Input file (.xlsx, .xls, .xlsm, .pdf) com drag-and-drop. Mostra spinner durante parsing.

**Etapa 2 - Preview**: Tabela com dados extraidos, valores formatados. Checkbox para selecionar/deselecionar linhas. Se multiplas sheets, tabs para alternar.

**Etapa 3 - Mapeamento + Confirmacao**:
- Selecionar tipo de registro destino: Medicoes, Despesas, Horas Extras, Materiais, EPIs, Documentos Financeiros
- Selecionar obra destino (quando aplicavel, com busca por nome nas obras existentes)
- Mapeamento automatico de colunas com override manual via selects
- Botoes: "Criar registros automaticamente" / "Cancelar"

### 3. `src/components/shared/FileImportButton.tsx` -- Botao reutilizavel

Props: `targetType` (pre-seleciona tipo), `className`

### 4. Mapeamento automatico ampliado

| Coluna detectada | Campo destino |
|---|---|
| OBRA / Obra | obra_id (busca por nome) |
| DATA / Data / Venc. / DATA SAIDA | data |
| FUNCIONARIO / COLABORADOR / EMPREGADO | funcionario |
| VALOR / Bruto (R$) / Vlr. pago | valor |
| DESCRIÇÃO / Descrição do Equipamento / EPI | descricao / tipo |
| QUANTIDADE / Q. / SAIDA | quantidade |
| VALOR UNITÁRIO | valor_unitario |
| HORARIO / H.E. | horas |
| FORNECEDOR / Fornecedor | fornecedor |
| C.A / Certificado | certificado_aprovacao |
| Validade | validade |
| Situação | status |
| Cliente | cliente (busca por nome) |

### 5. Integracao nas paginas

Adicionar botao "Importar Arquivo" ao header de:
- `Medicoes.tsx` (targetType: medicoes)
- `LancamentoDespesas.tsx` (targetType: despesas)
- `HorasExtras.tsx` (targetType: horas_extras)
- `Materiais.tsx` (targetType: materiais)
- `EPIs.tsx` (targetType: epis)

### Dependencia nova
- `pdfjs-dist` para parsing de PDF client-side

### Arquivos a criar/modificar

| Arquivo | Acao |
|---|---|
| `src/lib/fileParser.ts` | Criar |
| `src/components/shared/FileImportModal.tsx` | Criar |
| `src/components/shared/FileImportButton.tsx` | Criar |
| `src/pages/Obras/Medicoes.tsx` | Adicionar botao importar |
| `src/pages/Financeiro/LancamentoDespesas.tsx` | Adicionar botao importar |
| `src/pages/Obras/HorasExtras.tsx` | Adicionar botao importar |
| `src/pages/Obras/Materiais.tsx` | Adicionar botao importar |
| `src/pages/Obras/EPIs.tsx` | Adicionar botao importar |

