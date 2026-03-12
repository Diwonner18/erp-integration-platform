import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, FileText, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMedicoes, useDespesas, useRetencoes, useObras } from '@/hooks/useSupabaseData';
import { exportToPDF, exportToExcel, formatCurrencyExport, formatDateExport, formatPercentExport } from '@/lib/exportUtils';

const RelatoriosFinanceiros = () => {
  const { toast } = useToast();
  const { data: medicoes = [] } = useMedicoes();
  const { data: despesas = [] } = useDespesas();
  const { data: retencoes = [] } = useRetencoes();
  const { data: obras = [] } = useObras();

  const medicoesColumns = [
    { header: 'Obra', key: 'obra_nome' },
    { header: 'Número', key: 'numero' },
    { header: 'Data', key: 'data_medicao', format: formatDateExport },
    { header: 'Valor Bruto', key: 'valor_bruto', format: formatCurrencyExport },
    { header: 'Valor Final', key: 'valor', format: formatCurrencyExport },
    { header: '% Executado', key: 'percentual', format: formatPercentExport },
    { header: 'Status', key: 'status' },
  ];

  const despesasColumns = [
    { header: 'Descrição', key: 'descricao' },
    { header: 'Obra', key: 'obra_nome' },
    { header: 'Categoria', key: 'categoria' },
    { header: 'Data', key: 'data', format: formatDateExport },
    { header: 'Valor', key: 'valor', format: formatCurrencyExport },
  ];

  const retencoesColumns = [
    { header: 'Obra', key: 'obra_nome' },
    { header: 'Tipo', key: 'tipo' },
    { header: 'Percentual', key: 'percentual', format: formatPercentExport },
    { header: 'Base Cálculo', key: 'base_calculo', format: formatCurrencyExport },
    { header: 'Valor', key: 'valor', format: formatCurrencyExport },
    { header: 'Status', key: 'status' },
  ];

  const handleExport = (type: string, format: 'pdf' | 'excel') => {
    const exportFn = format === 'pdf' ? exportToPDF : exportToExcel;

    if (type === 'medicoes') {
      exportFn({
        title: 'Relatório de Medições',
        columns: medicoesColumns,
        data: medicoes.map(m => ({ ...m, obra_nome: m.obras?.nome || '-' })),
        filename: `medicoes_${new Date().toISOString().split('T')[0]}`,
      });
    } else if (type === 'despesas') {
      exportFn({
        title: 'Relatório de Despesas',
        columns: despesasColumns,
        data: despesas.map(d => ({ ...d, obra_nome: d.obras?.nome || '-' })),
        filename: `despesas_${new Date().toISOString().split('T')[0]}`,
      });
    } else if (type === 'retencoes') {
      exportFn({
        title: 'Relatório de Retenções e Impostos',
        columns: retencoesColumns,
        data: retencoes.map(r => ({ ...r, obra_nome: r.obras?.nome || '-' })),
        filename: `retencoes_${new Date().toISOString().split('T')[0]}`,
      });
    }

    toast({ title: 'Exportação concluída', description: `Arquivo ${format.toUpperCase()} gerado com sucesso.` });
  };

  const totalReceita = medicoes.filter(m => m.status === 'aprovada').reduce((acc, m) => acc + (m.valor || 0), 0);
  const totalDespesas = despesas.reduce((acc, d) => acc + (d.valor || 0), 0);
  const totalRetencoes = retencoes.reduce((acc, r) => acc + (r.valor || 0), 0);

  const reports = [
    { key: 'medicoes', title: 'Medições', count: medicoes.length, icon: BarChart3 },
    { key: 'despesas', title: 'Despesas', count: despesas.length, icon: TrendingUp },
    { key: 'retencoes', title: 'Retenções e Impostos', count: retencoes.length, icon: FileText },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
            <p className="text-muted-foreground mt-1">Exporte dados em PDF ou Excel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Receita Aprovada</p>
              <p className="text-2xl font-bold text-primary">{formatCurrencyExport(totalReceita)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Despesas</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrencyExport(totalDespesas)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Retenções</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrencyExport(totalRetencoes)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {reports.map(report => (
            <Card key={report.key}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <report.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.count} registros</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport(report.key, 'pdf')}>
                      <Download className="w-4 h-4 mr-2" />PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(report.key, 'excel')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default RelatoriosFinanceiros;
