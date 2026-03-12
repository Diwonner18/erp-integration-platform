import * as XLSX from 'xlsx';

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, any>[];
  sheetName: string;
}

export interface ParsedFileResult {
  sheets: ParsedSheet[];
  fileName: string;
}

// ==================== BR FORMAT HELPERS ====================

function parseBRCurrency(value: string): number | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/R\$\s*/gi, '').trim();
  if (!cleaned) return null;
  // BR format: 1.234,56 → 1234.56
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

function parseBRDate(value: string): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function isNumericLike(value: any): boolean {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return parseBRCurrency(value) !== null;
}

function normalizeValue(value: any): any {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Try BR currency
    if (/R\$/.test(trimmed) || /^\d{1,3}(\.\d{3})*(,\d{2})?$/.test(trimmed)) {
      const num = parseBRCurrency(trimmed);
      if (num !== null) return num;
    }
    // Try BR date
    const date = parseBRDate(trimmed);
    if (date) return date;
    return trimmed;
  }
  return value;
}

// ==================== EXCEL PARSING ====================

function detectHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let r = range.s.r; r <= Math.min(range.e.r, 25); r++) {
    let filledCells = 0;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
        filledCells++;
      }
    }
    if (filledCells >= 3) return r;
  }
  return 0;
}

function fillMergedCells(rows: any[][], headers: string[]): any[][] {
  // Fill empty cells with value from row above (unmerge logic)
  for (let col = 0; col < headers.length; col++) {
    for (let row = 1; row < rows.length; row++) {
      if (rows[row][col] === undefined || rows[row][col] === null || rows[row][col] === '') {
        rows[row][col] = rows[row - 1][col];
      }
    }
  }
  return rows;
}

export async function parseExcelFile(file: File): Promise<ParsedFileResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const sheets: ParsedSheet[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet['!ref']) continue;

    const headerRow = detectHeaderRow(sheet);
    const range = XLSX.utils.decode_range(sheet['!ref']);

    // Extract headers
    const headers: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c })];
      const val = cell ? String(cell.v).trim() : '';
      headers.push(val || `Col_${c + 1}`);
    }

    // Extract data rows
    const rawRows: any[][] = [];
    for (let r = headerRow + 1; r <= range.e.r; r++) {
      const row: any[] = [];
      let hasData = false;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        let val: any = '';
        if (cell) {
          if (cell.t === 'd' && cell.v instanceof Date) {
            val = cell.v.toISOString().split('T')[0];
          } else if (cell.w) {
            val = cell.w;
          } else {
            val = cell.v;
          }
        }
        row.push(val);
        if (val !== '' && val !== null && val !== undefined) hasData = true;
      }
      if (hasData) rawRows.push(row);
    }

    // Fill merged cells
    const filledRows = fillMergedCells(rawRows, headers);

    // Convert to records
    const rows: Record<string, any>[] = filledRows.map(row => {
      const record: Record<string, any> = {};
      headers.forEach((header, i) => {
        record[header] = normalizeValue(row[i]);
      });
      return record;
    });

    if (rows.length > 0) {
      sheets.push({ headers, rows, sheetName });
    }
  }

  return { sheets, fileName: file.name };
}

// ==================== PDF PARSING ====================

export async function parsePdfFile(file: File): Promise<ParsedFileResult> {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Use bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const allLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items by Y position to form lines
    const lineMap = new Map<number, { x: number; text: string }[]>();
    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const y = Math.round((item as any).transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ x: (item as any).transform[4], text: item.str });
    }

    // Sort lines by Y (descending, PDF coords are bottom-up)
    const sortedLines = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0]);

    for (const [, items] of sortedLines) {
      const sorted = items.sort((a, b) => a.x - b.x);
      const line = sorted.map(i => i.text).join('\t');
      if (line.trim()) allLines.push(line);
    }
  }

  // Try to identify tabular data
  const tabulatedLines = allLines.filter(l => l.includes('\t') && l.split('\t').filter(Boolean).length >= 3);
  
  if (tabulatedLines.length < 2) {
    // Fallback: return all text as single-column data
    return {
      sheets: [{
        headers: ['Conteúdo'],
        rows: allLines.map(line => ({ 'Conteúdo': line })),
        sheetName: 'PDF',
      }],
      fileName: file.name,
    };
  }

  // First tabulated line = headers
  const headers = tabulatedLines[0].split('\t').map(h => h.trim()).filter(Boolean);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < tabulatedLines.length; i++) {
    const cells = tabulatedLines[i].split('\t').map(c => c.trim());
    const record: Record<string, any> = {};
    headers.forEach((header, idx) => {
      record[header] = normalizeValue(cells[idx] || '');
    });
    // Only add if at least one cell has data
    if (Object.values(record).some(v => v !== '')) {
      rows.push(record);
    }
  }

  return {
    sheets: [{ headers, rows, sheetName: 'PDF' }],
    fileName: file.name,
  };
}

// ==================== UNIFIED PARSER ====================

export async function parseFile(file: File): Promise<ParsedFileResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (['xlsx', 'xls', 'xlsm'].includes(ext || '')) {
    return parseExcelFile(file);
  }
  if (ext === 'pdf') {
    return parsePdfFile(file);
  }
  throw new Error(`Formato não suportado: .${ext}`);
}

// ==================== COLUMN MAPPING ====================

export type TargetType = 'medicoes' | 'despesas' | 'horas_extras' | 'materiais' | 'epis';

export interface FieldMapping {
  key: string;
  label: string;
  required?: boolean;
}

export const TARGET_FIELDS: Record<TargetType, FieldMapping[]> = {
  medicoes: [
    { key: 'numero', label: 'Número' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'valor', label: 'Valor', required: true },
    { key: 'percentual', label: 'Percentual (%)' },
    { key: 'data_medicao', label: 'Data da Medição' },
    { key: 'periodo_inicio', label: 'Período Início' },
    { key: 'periodo_fim', label: 'Período Fim' },
  ],
  despesas: [
    { key: 'descricao', label: 'Descrição', required: true },
    { key: 'valor', label: 'Valor', required: true },
    { key: 'data', label: 'Data', required: true },
    { key: 'categoria', label: 'Categoria' },
  ],
  horas_extras: [
    { key: 'funcionario', label: 'Funcionário', required: true },
    { key: 'horas', label: 'Horas', required: true },
    { key: 'data', label: 'Data', required: true },
    { key: 'motivo', label: 'Motivo' },
    { key: 'valor_hora', label: 'Valor/Hora' },
  ],
  materiais: [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'valor_unitario', label: 'Valor Unitário' },
    { key: 'unidade', label: 'Unidade' },
    { key: 'fornecedor', label: 'Fornecedor' },
  ],
  epis: [
    { key: 'tipo', label: 'Tipo de EPI', required: true },
    { key: 'funcionario', label: 'Funcionário' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'certificado_aprovacao', label: 'C.A.' },
    { key: 'data_entrega', label: 'Data de Entrega' },
    { key: 'validade', label: 'Validade' },
  ],
};

const COLUMN_ALIASES: Record<string, string[]> = {
  descricao: ['descrição', 'descricao', 'descrição do equipamento', 'epi', 'desc', 'descrição do serviço'],
  valor: ['valor', 'valor total', 'total', 'bruto (r$)', 'vlr pago', 'liquido (r$)', 'bruto', 'valor bruto'],
  data: ['data', 'venc', 'vencimento', 'data saida', 'data emissão', 'data pgto', 'dt. saída', 'entrega'],
  data_medicao: ['data', 'data medicao', 'data medição', 'dt. medição'],
  funcionario: ['funcionário', 'funcionario', 'colaborador', 'empregado', 'nome', 'funcionários'],
  horas: ['horas', 'h.e.', 'h.e', 'horario', 'qde. he', 'qde he', 'horas extras'],
  nome: ['nome', 'material', 'item', 'produto', 'descrição'],
  quantidade: ['quantidade', 'qtd', 'qtd.', 'q.', 'quant', 'saida', 'q'],
  valor_unitario: ['valor unitário', 'valor unitario', 'unitário', 'unitario', 'vl. unit', 'vl unit'],
  unidade: ['unidade', 'un.', 'un', 'und'],
  fornecedor: ['fornecedor', 'forn.'],
  categoria: ['categoria', 'conta gerencial', 'tipo'],
  numero: ['número', 'numero', 'num', 'nº', 'n°'],
  percentual: ['percentual', '%', 'perc', 'porcentagem'],
  tipo: ['tipo', 'tipo epi', 'epi', 'descrição do equipamento'],
  certificado_aprovacao: ['c.a.', 'c.a', 'ca', 'certificado', 'certificado aprovação'],
  validade: ['validade', 'vencimento', 'valid'],
  data_entrega: ['data entrega', 'entrega', 'dt entrega', 'data saída'],
  motivo: ['motivo', 'observação', 'obs', 'justificativa'],
  valor_hora: ['valor/hora', 'valor hora', 'valor/h', 'vl hora'],
  periodo_inicio: ['período início', 'periodo inicio', 'início', 'inicio'],
  periodo_fim: ['período fim', 'periodo fim', 'fim', 'final'],
};

export function autoMapColumns(
  fileHeaders: string[],
  targetType: TargetType
): Record<string, string> {
  const fields = TARGET_FIELDS[targetType];
  const mapping: Record<string, string> = {};

  for (const field of fields) {
    const aliases = COLUMN_ALIASES[field.key] || [field.key];
    for (const header of fileHeaders) {
      const headerLower = header.toLowerCase().trim();
      if (aliases.some(alias => headerLower === alias || headerLower.includes(alias))) {
        mapping[field.key] = header;
        break;
      }
    }
  }

  return mapping;
}

export const TARGET_LABELS: Record<TargetType, string> = {
  medicoes: 'Medições',
  despesas: 'Despesas',
  horas_extras: 'Horas Extras',
  materiais: 'Materiais',
  epis: 'EPIs',
};
