
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Download, Eye } from 'lucide-react';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import NovoBoletimModal from '@/components/Financeiro/NovoBoletimModal';
import { useToast } from '@/hooks/use-toast';

const BoletinsMedicao = () => {
  const { toast } = useToast();
  const [showNovoBoletimModal, setShowNovoBoletimModal] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const boletins = [
    { id: 1, obraId: '1', cliente: 'ABC Construções', valor: 'R$ 8.500', periodo: 'Jan/2024', status: 'emitido', numero: 'BM-001', data: '2024-01-15' },
    { id: 2, obraId: '2', cliente: 'Silva Engenharia', valor: 'R$ 12.300', periodo: 'Jan/2024', status: 'pendente', numero: 'BM-002', data: '2024-01-10' },
    { id: 3, obraId: '3', cliente: 'Costa & Filhos', valor: 'R$ 5.800', periodo: 'Jan/2024', status: 'emitido', numero: 'BM-003', data: '2024-01-08' },
    { id: 4, obraId: '4', cliente: 'Mendes Construtora', valor: 'R$ 15.600', periodo: 'Dez/2023', status: 'pago', numero: 'BM-004', data: '2023-12-28' }
  ];

  const obras = [
    { id: '1', nome: 'Obra ABC Construções' },
    { id: '2', nome: 'Obra Silva Engenharia' },
    { id: '3', nome: 'Obra Costa & Filhos' },
    { id: '4', nome: 'Obra Mendes Construtora' }
  ];

  const statusOptions = [
    { value: 'emitido', label: 'Emitido' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'pago', label: 'Pago' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const filteredBoletins = useMemo(() => {
    let result = boletins;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(boletim => boletim.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(boletim => {
        const boletimDate = new Date(boletim.data);
        return boletimDate >= filters.dataInicial! && boletimDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(boletim => boletim.status === filters.status);
    }

    return result;
  }, [boletins, filters]);

  const handleDownloadBoletim = (boletim: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando boletim ${boletim.numero}`,
    });
  };

  const handleVisualizarBoletim = (boletim: any) => {
    toast({
      title: "Visualizar Boletim",
      description: `Visualizando boletim ${boletim.numero}`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Boletins de Medição</h1>
            <p className="text-slate-600 mt-1">Emitir boletins para faturamento</p>
          </div>
          <Button onClick={() => setShowNovoBoletimModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Boletim
          </Button>
        </div>

        <AdvancedFilters
          onFiltersChange={setFilters}
          obras={obras}
          statusOptions={statusOptions}
        />

        <div className="text-sm text-slate-600 mb-4">
          Exibindo {filteredBoletins.length} de {boletins.length} boletins
        </div>

        <div className="grid gap-4">
          {filteredBoletins.map((boletim, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{boletim.cliente}</h3>
                      <p className="text-sm text-slate-600">{boletim.numero} - {boletim.periodo}</p>
                      <p className="text-xs text-slate-500">Valor: {boletim.valor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      boletim.status === 'pago' ? 'default' :
                      boletim.status === 'emitido' ? 'secondary' : 'outline'
                    }>
                      {boletim.status === 'pago' ? 'Pago' :
                       boletim.status === 'emitido' ? 'Emitido' : 'Pendente'}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVisualizarBoletim(boletim)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadBoletim(boletim)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <NovoBoletimModal 
          open={showNovoBoletimModal}
          onClose={() => setShowNovoBoletimModal(false)}
        />
      </div>
    </MainLayout>
  );
};

export default BoletinsMedicao;
