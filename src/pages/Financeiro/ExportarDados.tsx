
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
          <h1 className="text-3xl font-bold text-slate-900">Exportar Dados</h1>
          <p className="text-slate-600 mt-1">Gerar planilhas e relatórios para NF e auditoria</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { nome: 'Medições Janeiro 2024', cliente: 'ABC Construções', valor: 'R$ 8.500' },
                  { nome: 'Medições Janeiro 2024', cliente: 'Silva Engenharia', valor: 'R$ 12.300' },
                  { nome: 'Medições Janeiro 2024', cliente: 'Costa & Filhos', valor: 'R$ 5.800' },
                  { nome: 'Medições Janeiro 2024', cliente: 'Mendes Construtora', valor: 'R$ 15.600' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{item.cliente}</h4>
                      <p className="text-sm text-slate-600">{item.nome}</p>
                      <p className="text-xs text-slate-500">Valor: {item.valor}</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleDownloadExcel(item.cliente)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                ))}
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
                      <div className="text-xs text-slate-500">Janeiro 2024</div>
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
                    <label className="text-sm font-medium text-slate-700">Período</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Janeiro 2024</option>
                      <option>Dezembro 2023</option>
                      <option>Novembro 2023</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Cliente</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Todos os clientes</option>
                      <option>ABC Construções</option>
                      <option>Silva Engenharia</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Formato</label>
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
