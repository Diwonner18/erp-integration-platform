import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any) => string;
}

interface ExportOptions {
  title: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  filename: string;
}

const formatValue = (value: any, format?: (v: any) => string): string => {
  if (format) return format(value);
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return value.toString();
  return String(value);
};

export const exportToPDF = ({ title, columns, data, filename }: ExportOptions) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
  doc.text(`Total de registros: ${data.length}`, 14, 34);

  // Table
  const headers = columns.map(c => c.header);
  const rows = data.map(row =>
    columns.map(col => formatValue(row[col.key], col.format))
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 65, 122], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = ({ title, columns, data, filename }: ExportOptions) => {
  const headers = columns.map(c => c.header);
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col.key];
      // Keep numbers as numbers for Excel
      if (typeof val === 'number' && !col.format) return val;
      return formatValue(val, col.format);
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([
    [title],
    [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
    [],
    headers,
    ...rows,
  ]);

  // Column widths
  ws['!cols'] = columns.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Pre-built formatters
export const formatCurrencyExport = (v: number | null) =>
  v != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

export const formatDateExport = (v: string | null) =>
  v ? new Date(v).toLocaleDateString('pt-BR') : '-';

export const formatPercentExport = (v: number | null) =>
  v != null ? `${v}%` : '0%';
