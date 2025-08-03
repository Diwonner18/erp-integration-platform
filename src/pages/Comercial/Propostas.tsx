
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Eye, Edit, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NovaPropostaModal from '@/components/Comercial/NovaPropostaModal';
import EditPropostaModal from '@/components/Comercial/EditPropostaModal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const Propostas = () => {
  const { toast } = useToast();
  const [showNovaPropostaModal, setShowNovaPropostaModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const [propostas, setPropostas] = useState([
    { id: 1, obraId: '1', client: 'ABC Construções', value: 'R$ 45.000', status: 'pendente', date: '2024-01-15' },
    { id: 2, obraId: '2', client: 'Silva Engenharia', value: 'R$ 32.500', status: 'aprovada', date: '2024-01-10' },
    { id: 3, obraId: '3', client: 'Costa & Filhos', value: 'R$ 78.000', status: 'em_analise', date: '2024-01-08' },
    { id: 4, obraId: '4', client: 'Mendes Construtora', value: 'R$ 22.800', status: 'rejeitada', date: '2024-01-05' }
  ]);

  const obras = [
    { id: '1', nome: 'Obra ABC Construções' },
    { id: '2', nome: 'Obra Silva Engenharia' },
    { id: '3', nome: 'Obra Costa & Filhos' },
    { id: '4', nome: 'Obra Mendes Construtora' }
  ];

  const advancedStatusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'rejeitada', label: 'Rejeitada' }
  ];

  // Configurar atalhos de teclado
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: () => setShowNovaPropostaModal(true),
      description: 'Nova Proposta'
    },
    {
      key: 'f',
      ctrl: true,
      callback: () => document.getElementById('search-input')?.focus(),
      description: 'Buscar'
    }
  ]);

  // Filtros em tempo real
  const filteredPropostas = useMemo(() => {
    let result = propostas;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(proposta => proposta.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(proposta => {
        const propostaDate = new Date(proposta.date);
        return propostaDate >= filters.dataInicial! && propostaDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(proposta => proposta.status === filters.status);
    } else if (statusFilter !== 'all') {
      // Aplicar filtro de status simples se filtros avançados não estiverem preenchidos
      result = result.filter(proposta => proposta.status === statusFilter);
    }

    // Aplicar busca textual
    if (searchTerm) {
      result = result.filter(proposta => 
        proposta.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposta.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [propostas, searchTerm, statusFilter, filters]);

  const handleVisualizarProposta = (proposta: any) => {
    setSelectedProposta(proposta);
    setShowDetailModal(true);
  };

  const handleEditarProposta = (proposta: any) => {
    setSelectedProposta(proposta);
    setShowEditModal(true);
  };

  const handleSaveProposta = (updatedProposta: any) => {
    setPropostas(prev => 
      prev.map(p => p.id === updatedProposta.id ? updatedProposta : p)
    );
    
    toast({
      title: "Proposta atualizada",
      description: `Proposta para ${updatedProposta.client} foi atualizada com sucesso`,
    });
  };

  const handleDownloadProposta = (proposta: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando proposta para ${proposta.client}`,
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'rejeitada', label: 'Rejeitada' }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aprovada': return 'Aprovada';
      case 'pendente': return 'Pendente';
      case 'em_analise': return 'Em Análise';
      case 'rejeitada': return 'Rejeitada';
      default: return status;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Propostas</h1>
            <p className="text-slate-600 mt-1">Gerenciar propostas e contratos</p>
          </div>
          <Button 
            onClick={() => setShowNovaPropostaModal(true)}
            className="transition-all duration-150 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
            <span className="ml-2 text-xs opacity-70">Ctrl+N</span>
          </Button>
        </div>

        <AdvancedFilters
          onFiltersChange={setFilters}
          obras={obras}
          statusOptions={advancedStatusOptions}
        />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              id="search-input"
              placeholder="Buscar propostas... (Ctrl+F)" 
              className="pl-10 transition-all duration-150 focus:ring-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-slate-600 mb-4">
          Exibindo {filteredPropostas.length} de {propostas.length} propostas
        </div>

        <div className="grid gap-4">
          {filteredPropostas.map((proposta) => (
            <Card key={proposta.id} className="transition-all duration-150 hover:shadow-md hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-150">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{proposta.client}</h3>
                      <p className="text-sm text-slate-600">Valor: {proposta.value}</p>
                      <p className="text-xs text-slate-500">Data: {proposta.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      proposta.status === 'aprovada' ? 'default' :
                      proposta.status === 'pendente' ? 'secondary' :
                      proposta.status === 'em_analise' ? 'outline' : 'destructive'
                    } className="transition-colors duration-150">
                      {getStatusLabel(proposta.status)}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVisualizarProposta(proposta)}
                        className="transition-all duration-150 hover:scale-105"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditarProposta(proposta)}
                        className="transition-all duration-150 hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadProposta(proposta)}
                        className="transition-all duration-150 hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <NovaPropostaModal 
          open={showNovaPropostaModal}
          onClose={() => setShowNovaPropostaModal(false)}
        />

        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Proposta</DialogTitle>
            </DialogHeader>
            {selectedProposta && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Cliente</label>
                    <p className="text-slate-900">{selectedProposta.client}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Valor</label>
                    <p className="text-slate-900">{selectedProposta.value}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <p className="text-slate-900">{getStatusLabel(selectedProposta.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Data</label>
                    <p className="text-slate-900">{selectedProposta.date}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <EditPropostaModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProposta(null);
          }}
          proposta={selectedProposta}
          onSave={handleSaveProposta}
        />
      </div>
    </MainLayout>
  );
};

export default Propostas;
