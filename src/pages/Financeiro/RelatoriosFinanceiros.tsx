import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, FileText, TrendingUp, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMedicoes, useDespesas, useRetencoes, useObras } from '@/hooks/useSupabaseData';
import { exportToPDF, exportToExcel, formatCurrencyExport, formatDateExport, formatPercentExport } from '@/lib/exportUtils';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const RelatoriosFinanceiros = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: medicoes = [], isLoading: loadingMedicoes } = useMedicoes();
  const { data: despesas = [], isLoading: loadingDespesas } = useDespesas();
  const { data: retencoes = [], isLoading: loadingRetencoes } = useRetencoes();

  const isLoading = loadingMedicoes || loadingDespesas || loadingRetencoes;
  const totalRecords = medicoes.length + despesas.length + retencoes.length;

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

  const availableReports = reports.filter(r => r.count > 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
            <p className="text-muted-foreground mt-1">Exporte dados em PDF ou Excel</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i}><CardContent className="pt-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></CardContent></Card>
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        ) : totalRecords === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum dado disponível para geração de relatório</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Cadastre medições, despesas ou retenções para gerar relatórios financeiros.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => navigate('/medicoes')}>
                  <PlusCircle className="w-4 h-4 mr-2" />Criar primeira medição
                </Button>
                <Button variant="outline" onClick={() => navigate('/lancamento-despesas')}>
                  <PlusCircle className="w-4 h-4 mr-2" />Registrar despesa
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour="page-stats">
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

            <div className="grid gap-4" data-tour="page-list">
              {availableReports.map(report => (
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
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatoriosFinanceiros;
