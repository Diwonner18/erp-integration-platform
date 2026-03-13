import React, { useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMedicoes, useDespesas, useRetencoes, useClientes } from '@/hooks/useSupabaseData';
import { exportToPDF, exportToExcel, formatCurrencyExport, formatDateExport, formatPercentExport } from '@/lib/exportUtils';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ExportarDados = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: medicoes = [], isLoading: lm } = useMedicoes();
  const { data: despesas = [], isLoading: ld } = useDespesas();
  const { data: retencoes = [], isLoading: lr } = useRetencoes();
  const { data: clientes = [] } = useClientes();

  const isLoading = lm || ld || lr;
  const hasMedicoes = medicoes.length > 0;
  const hasDespesas = despesas.length > 0;
  const hasRetencoes = retencoes.length > 0;
  const hasAnyData = hasMedicoes || hasDespesas || hasRetencoes;

  const availableReports = useMemo(() => {
    const reports: { label: string; key: string; exportFn: () => void }[] = [];

    if (hasMedicoes || hasDespesas) {
      reports.push({
        label: 'Demonstrativo Mensal Completo',
        key: 'demonstrativo',
        exportFn: () => {
          const allData = [
            ...medicoes.map(m => ({ tipo: 'Medição', descricao: m.numero || m.descricao || '-', valor: m.valor, data: m.data_medicao || m.created_at, status: m.status })),
            ...despesas.map(d => ({ tipo: 'Despesa', descricao: d.descricao, valor: d.valor, data: d.data, status: d.categoria })),
          ];
          exportToPDF({
            title: 'Demonstrativo Mensal Completo',
            columns: [
              { header: 'Tipo', key: 'tipo' },
              { header: 'Descrição', key: 'descricao' },
              { header: 'Valor', key: 'valor', format: formatCurrencyExport },
              { header: 'Data', key: 'data', format: formatDateExport },
              { header: 'Status', key: 'status' },
            ],
            data: allData,
            filename: `demonstrativo_${new Date().toISOString().split('T')[0]}`,
          });
        },
      });
    }

    if (hasRetencoes) {
      reports.push({
        label: 'Relatório de Retenções',
        key: 'retencoes',
        exportFn: () => {
          exportToPDF({
            title: 'Relatório de Retenções',
            columns: [
              { header: 'Tipo', key: 'tipo' },
              { header: 'Percentual', key: 'percentual', format: formatPercentExport },
              { header: 'Base Cálculo', key: 'base_calculo', format: formatCurrencyExport },
              { header: 'Valor', key: 'valor', format: formatCurrencyExport },
              { header: 'Status', key: 'status' },
            ],
            data: retencoes,
            filename: `retencoes_${new Date().toISOString().split('T')[0]}`,
          });
        },
      });
    }

    if (hasMedicoes) {
      reports.push({
        label: 'Resumo por Cliente',
        key: 'resumo_cliente',
        exportFn: () => {
          const byClient: Record<string, { cliente: string; total: number; count: number }> = {};
          medicoes.forEach(m => {
            const nome = (m as any).obras?.clientes?.razao_social || 'Sem cliente';
            if (!byClient[nome]) byClient[nome] = { cliente: nome, total: 0, count: 0 };
            byClient[nome].total += m.valor || 0;
            byClient[nome].count += 1;
          });
          exportToPDF({
            title: 'Resumo por Cliente',
            columns: [
              { header: 'Cliente', key: 'cliente' },
              { header: 'Medições', key: 'count' },
              { header: 'Valor Total', key: 'total', format: formatCurrencyExport },
            ],
            data: Object.values(byClient),
            filename: `resumo_cliente_${new Date().toISOString().split('T')[0]}`,
          });
        },
      });
    }

    return reports;
  }, [hasMedicoes, hasDespesas, hasRetencoes, medicoes, despesas, retencoes]);

  const nfData = medicoes.filter(m => m.status === 'aprovada');

  const handleExportNF = (m: typeof medicoes[0]) => {
    exportToExcel({
      title: `Planilha NF - Medição ${m.numero}`,
      columns: [
        { header: 'Número', key: 'numero' },
        { header: 'Valor', key: 'valor', format: formatCurrencyExport },
        { header: 'Data', key: 'data_medicao', format: formatDateExport },
        { header: 'Status', key: 'status' },
      ],
      data: [m],
      filename: `nf_medicao_${m.numero || m.id}`,
    });
    toast({ title: 'Download iniciado', description: `Planilha NF gerada para medição ${m.numero}` });
  };

  const [selectedFormat, setSelectedFormat] = React.useState('xlsx');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold text-primary">Exportar Dados</h1>
          <p className="text-muted-foreground mt-1">Gerar planilhas e relatórios para NF e auditoria</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !hasAnyData ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum dado disponível para exportação</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Cadastre medições, despesas ou retenções para poder gerar relatórios e planilhas.
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
          <div className="grid gap-6">
            {/* Planilhas para NF */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Planilhas para Nota Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nfData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Nenhuma medição aprovada para exportação</p>
                    <p className="text-sm">Medições precisam estar aprovadas para gerar planilhas de NF</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nfData.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Medição {m.numero || '-'}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrencyExport(m.valor)} • {formatDateExport(m.data_medicao)}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleExportNF(m)}>
                          <Download className="w-4 h-4 mr-2" />Excel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relatórios PDF */}
            {availableReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Relatórios PDF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableReports.map(report => (
                      <Button
                        key={report.key}
                        variant="outline"
                        className="justify-between h-auto p-4"
                        onClick={() => {
                          report.exportFn();
                          toast({ title: 'Download iniciado', description: `Baixando ${report.label}` });
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">{report.label}</div>
                        </div>
                        <Download className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exportação Personalizada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Exportação Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                      <Select>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Todos os clientes" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os clientes</SelectItem>
                          {clientes.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Formato</label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                          <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const fmt = selectedFormat === 'pdf' ? 'pdf' : 'excel';
                      const exportFn = fmt === 'pdf' ? exportToPDF : exportToExcel;
                      const allData = [
                        ...medicoes.map(m => ({ tipo: 'Medição', descricao: m.numero || '-', valor: m.valor || 0, data: m.data_medicao || '', status: m.status })),
                        ...despesas.map(d => ({ tipo: 'Despesa', descricao: d.descricao, valor: d.valor, data: d.data, status: d.categoria })),
                        ...retencoes.map(r => ({ tipo: 'Retenção', descricao: r.tipo, valor: r.valor || 0, data: r.created_at, status: r.status || '-' })),
                      ];
                      exportFn({
                        title: 'Exportação Personalizada',
                        columns: [
                          { header: 'Tipo', key: 'tipo' },
                          { header: 'Descrição', key: 'descricao' },
                          { header: 'Valor', key: 'valor', format: formatCurrencyExport },
                          { header: 'Data', key: 'data', format: formatDateExport },
                          { header: 'Status', key: 'status' },
                        ],
                        data: allData,
                        filename: `exportacao_personalizada_${new Date().toISOString().split('T')[0]}`,
                      });
                      toast({ title: 'Exportação concluída', description: 'Arquivo gerado com sucesso' });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Exportação Personalizada
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExportarDados;
