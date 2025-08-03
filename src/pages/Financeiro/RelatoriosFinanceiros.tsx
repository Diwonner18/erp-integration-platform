import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RelatoriosFinanceiros = () => {
  const { toast } = useToast();

  const handleExportarTudo = () => {
    toast({
      title: "Exportação iniciada",
      description: "Todos os relatórios estão sendo exportados",
    });
  };

  const handleDownloadRelatorio = (relatorio: string) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${relatorio}`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Relatórios Financeiros</h1>
            <p className="text-slate-600 mt-1">Análises e relatórios financeiros detalhados</p>
          </div>
          <Button onClick={handleExportarTudo}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Tudo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Receitas por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { cliente: 'ABC Construções', valor: 'R$ 45.200', percentual: '35%' },
                  { cliente: 'Silva Engenharia', valor: 'R$ 32.800', percentual: '26%' },
                  { cliente: 'Costa & Filhos', valor: 'R$ 28.100', percentual: '22%' },
                  { cliente: 'Outros', valor: 'R$ 21.200', percentual: '17%' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.cliente}</span>
                    <div className="text-right">
                      <span className="font-semibold">{item.valor}</span>
                      <span className="text-xs text-slate-500 ml-2">({item.percentual})</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { mes: 'Janeiro', valor: 'R$ 127.300', crescimento: '+12%' },
                  { mes: 'Dezembro', valor: 'R$ 113.800', crescimento: '+8%' },
                  { mes: 'Novembro', valor: 'R$ 105.400', crescimento: '+5%' },
                  { mes: 'Outubro', valor: 'R$ 100.200', crescimento: '+3%' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.mes}</span>
                    <div className="text-right">
                      <span className="font-semibold">{item.valor}</span>
                      <span className="text-xs text-green-600 ml-2">{item.crescimento}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Relatórios Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Demonstrativo de Resultados',
                'Fluxo de Caixa Mensal',
                'Relatório de Inadimplência',
                'Análise por Cliente',
                'Retenções e Impostos',
                'Projeção de Recebimentos'
              ].map((relatorio, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleDownloadRelatorio(relatorio)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {relatorio}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RelatoriosFinanceiros;
