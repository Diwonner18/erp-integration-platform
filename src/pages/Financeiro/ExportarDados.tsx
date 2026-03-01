
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExportarDados = () => {
  const { toast } = useToast();

  const handleDownloadExcel = (cliente: string) => {
    toast({
      title: "Download iniciado",
      description: `Baixando planilha para ${cliente}`,
    });
  };

  const handleDownloadPDF = (relatorio: string) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${relatorio}`,
    });
  };

  const handleExportacaoPersonalizada = () => {
    toast({
      title: "Exportação personalizada",
      description: "Gerando arquivo personalizado...",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Exportar Dados</h1>
          <p className="text-muted-foreground mt-1">Gerar planilhas e relatórios para NF e auditoria</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Planilhas para Nota Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma medição disponível para exportação</p>
                <p className="text-sm">Crie medições para gerar planilhas de NF</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Relatórios PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Demonstrativo Mensal Completo',
                  'Relatório de Retenções',
                  'Análise de Inadimplência',
                  'Resumo por Cliente'
                ].map((relatorio, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="justify-between h-auto p-4"
                    onClick={() => handleDownloadPDF(relatorio)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{relatorio}</div>
                    </div>
                    <Download className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Exportação Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Período</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Selecione o período</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Todos os clientes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Formato</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Excel (.xlsx)</option>
                      <option>PDF (.pdf)</option>
                      <option>CSV (.csv)</option>
                    </select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleExportacaoPersonalizada}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Gerar Exportação Personalizada
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExportarDados;
