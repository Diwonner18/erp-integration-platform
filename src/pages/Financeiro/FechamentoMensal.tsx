import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Archive, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMedicoes, useDespesas, useHorasExtras, useBoletins } from '@/hooks/useSupabaseData';
import { exportToPDF, exportToExcel, formatCurrencyExport, formatDateExport } from '@/lib/exportUtils';

const FechamentoMensal = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: medicoes = [] } = useMedicoes();
  const { data: despesas = [] } = useDespesas();
  const { data: horasExtras = [] } = useHorasExtras();
  const { data: boletins = [] } = useBoletins();

  const months = [
    { value: '01', label: 'Janeiro' }, { value: '02', label: 'Fevereiro' }, { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' }, { value: '05', label: 'Maio' }, { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];
  const years = ['2023', '2024', '2025', '2026'];
  const prefix = `${selectedYear}-${selectedMonth}`;
  const periodSelected = selectedMonth !== '';

  const filtered = useMemo(() => ({
    medicoes: medicoes.filter(m => (m.data_medicao || m.created_at).startsWith(prefix)),
    despesas: despesas.filter(d => d.data.startsWith(prefix)),
    horasExtras: horasExtras.filter(h => h.data.startsWith(prefix)),
    boletins: boletins.filter(b => (b.data_emissao || b.created_at).startsWith(prefix)),
  }), [medicoes, despesas, horasExtras, boletins, prefix]);

  const documentos = [
    { nome: 'Relatório de Medições', tipo: 'PDF', count: filtered.medicoes.length, export: (fmt: 'pdf'|'excel') => {
      const opts = { title: `Medições - ${months.find(m=>m.value===selectedMonth)?.label}/${selectedYear}`, filename: `medicoes_${prefix}`, columns: [
        { header: 'Nº', key: 'numero' }, { header: 'Obra', key: 'obra' }, { header: 'Data', key: 'data_medicao', format: formatDateExport },
        { header: 'Valor', key: 'valor', format: formatCurrencyExport }, { header: 'Status', key: 'status' },
      ], data: filtered.medicoes.map(m => ({ ...m, obra: (m as any).obras?.nome || '-' })) };
      fmt === 'pdf' ? exportToPDF(opts) : exportToExcel(opts);
    }},
    { nome: 'Planilha de Despesas', tipo: 'XLSX', count: filtered.despesas.length, export: (fmt: 'pdf'|'excel') => {
      const opts = { title: `Despesas - ${months.find(m=>m.value===selectedMonth)?.label}/${selectedYear}`, filename: `despesas_${prefix}`, columns: [
        { header: 'Descrição', key: 'descricao' }, { header: 'Data', key: 'data', format: formatDateExport },
        { header: 'Categoria', key: 'categoria' }, { header: 'Valor', key: 'valor', format: formatCurrencyExport },
      ], data: filtered.despesas };
      fmt === 'pdf' ? exportToPDF(opts) : exportToExcel(opts);
    }},
    { nome: 'Boletins de Medição', tipo: 'PDF', count: filtered.boletins.length, export: (fmt: 'pdf'|'excel') => {
      const opts = { title: `Boletins - ${months.find(m=>m.value===selectedMonth)?.label}/${selectedYear}`, filename: `boletins_${prefix}`, columns: [
        { header: 'Nº', key: 'numero' }, { header: 'Obra', key: 'obra' },
        { header: 'Valor', key: 'valor', format: formatCurrencyExport }, { header: 'Status', key: 'status' },
      ], data: filtered.boletins.map(b => ({ ...b, obra: (b as any).obras?.nome || '-' })) };
      fmt === 'pdf' ? exportToPDF(opts) : exportToExcel(opts);
    }},
    { nome: 'Relatório de Horas Extras', tipo: 'XLSX', count: filtered.horasExtras.length, export: (fmt: 'pdf'|'excel') => {
      const opts = { title: `Horas Extras - ${months.find(m=>m.value===selectedMonth)?.label}/${selectedYear}`, filename: `horas_extras_${prefix}`, columns: [
        { header: 'Funcionário', key: 'funcionario' }, { header: 'Data', key: 'data', format: formatDateExport },
        { header: 'Horas', key: 'horas' }, { header: 'Valor/h', key: 'valor_hora', format: formatCurrencyExport },
        { header: 'Total', key: 'total', format: formatCurrencyExport },
      ], data: filtered.horasExtras.map(h => ({ ...h, total: (h.horas || 0) * (h.valor_hora || 0) })) };
      fmt === 'pdf' ? exportToPDF(opts) : exportToExcel(opts);
    }},
  ];

  const availableDocs = documentos.filter(d => d.count > 0);
  const hasAnyData = availableDocs.length > 0;

  const handleBackup = () => {
    availableDocs.forEach(d => d.export(d.tipo === 'XLSX' ? 'excel' : 'pdf'));
    toast({ title: 'Backup completo', description: 'Todos os documentos foram exportados' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-primary">Fechamento Mensal</h1><p className="text-muted-foreground mt-1">Gerar e exportar documentos mensais</p></div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Período</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue placeholder="Selecione o mês" /></SelectTrigger>
                  <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger><SelectValue placeholder="Selecione o ano" /></SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Documentos</CardTitle></CardHeader>
            <CardContent>
              {!periodSelected ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Selecione um período</p>
                  <p className="text-sm">Escolha o mês e ano para visualizar os documentos disponíveis</p>
                </div>
              ) : !hasAnyData ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Nenhum registro encontrado para o período selecionado</p>
                  <p className="text-sm">Não há medições, despesas, boletins ou horas extras em {months.find(m => m.value === selectedMonth)?.label}/{selectedYear}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {availableDocs.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                          <div>
                            <p className="font-medium text-foreground">{doc.nome}</p>
                            <p className="text-sm text-muted-foreground">{doc.tipo} • {doc.count} registros</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => doc.export('pdf')}><Download className="w-4 h-4 mr-1" />PDF</Button>
                          <Button variant="outline" size="sm" onClick={() => doc.export('excel')}><Download className="w-4 h-4 mr-1" />Excel</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={handleBackup} className="w-full"><Archive className="w-4 h-4 mr-2" />Exportar Todos</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FechamentoMensal;
