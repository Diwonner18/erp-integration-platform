import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Archive, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FechamentoMensal = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isGenerating, setIsGenerating] = useState(false);

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const years = ['2022', '2023', '2024', '2025'];

  const documentos = [
    { nome: 'Relatório de Medições', tipo: 'PDF', size: '2.5 MB' },
    { nome: 'Planilha de Materiais', tipo: 'XLSX', size: '1.8 MB' },
    { nome: 'Controle Financeiro', tipo: 'PDF', size: '3.2 MB' },
    { nome: 'Relatório de Horas Extras', tipo: 'XLSX', size: '920 KB' },
    { nome: 'Resumo Executivo', tipo: 'PDF', size: '1.1 MB' }
  ];

  const handleGenerateDocuments = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({
        title: 'Dados incompletos',
        description: 'Selecione o mês e ano para gerar os documentos',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular geração de documentos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Documentos gerados',
        description: `Fechamento de ${months.find(m => m.value === selectedMonth)?.label}/${selectedYear} concluído`,
      });
    } catch (error) {
      toast({
        title: 'Erro na geração',
        description: 'Ocorreu um erro ao gerar os documentos',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocument = (documento: any) => {
    toast({
      title: 'Download iniciado',
      description: `Fazendo download de ${documento.nome}`,
    });
  };

  const handleBackup = () => {
    toast({
      title: 'Backup criado',
      description: 'Backup dos documentos criado com sucesso',
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Fechamento Mensal</h1>
            <p className="text-muted-foreground mt-1">Gerar e organizar documentos mensais</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Seleção de Período */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateDocuments} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Documentos'}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Documentos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos Gerados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentos.map((documento, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{documento.nome}</p>
                        <p className="text-sm text-muted-foreground">{documento.tipo} • {documento.size}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadDocument(documento)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleBackup}
                  className="w-full"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Criar Backup Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FechamentoMensal;