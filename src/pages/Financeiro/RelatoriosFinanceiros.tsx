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
            <h1 className="text-3xl font-bold text-primary">Relatórios Financeiros</h1>
            <p className="text-muted-foreground mt-1">Análises e relatórios financeiros detalhados</p>
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
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Sem dados de receita</p>
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
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Sem dados de performance</p>
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
