
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Ruler, Plus, Search, Eye, Check, X } from 'lucide-react';
import NovaMedicaoModal from '@/components/Obras/NovaMedicaoModal';
import MedicaoDetailModal from '@/components/Obras/MedicaoDetailModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';

const Medicoes = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  // Estado reativo para medições
  const [medicoes, setMedicoes] = useState([
    { 
      id: 1,
      obraId: '1',
      obra: 'Obra Residencial Silva', 
      periodo: 'Jan/2024', 
      percentual: 75, 
      valor: 'R$ 18.500',
      status: 'pendente',
      data: '2024-01-20'
    },
    { 
      id: 2,
      obraId: '2',
      obra: 'Complexo Comercial ABC', 
      periodo: 'Jan/2024', 
      percentual: 100, 
      valor: 'R$ 32.000',
      status: 'aprovada',
      data: '2024-01-18'
    },
    { 
      id: 3,
      obraId: '3',
      obra: 'Reforma Escritório Costa', 
      periodo: 'Dez/2023', 
      percentual: 50, 
      valor: 'R$ 12.800',
      status: 'aprovada',
      data: '2024-01-15'
    }
  ]);

  // Estados para modais
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMedicao, setSelectedMedicao] = useState<any>(null);
  const [actionType, setActionType] = useState<'aprovar' | 'rejeitar' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const obras = [
    { id: '1', nome: 'Obra Residencial Silva' },
    { id: '2', nome: 'Complexo Comercial ABC' },
    { id: '3', nome: 'Reforma Escritório Costa' },
    { id: '4', nome: 'Instalação Industrial Beta' }
  ];

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'rejeitada', label: 'Rejeitada' }
  ];

  const filteredMedicoes = useMemo(() => {
    let result = medicoes;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(medicao => medicao.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(medicao => {
        const medicaoDate = new Date(medicao.data);
        return medicaoDate >= filters.dataInicial! && medicaoDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(medicao => medicao.status === filters.status);
    }

    // Aplicar busca textual
    if (searchTerm) {
      result = result.filter(medicao => 
        medicao.obra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicao.periodo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [medicoes, filters, searchTerm]);

  // Funções com funcionalidade real
  const handleConfirmarMedicao = (medicao: any) => {
    // Validar se medição existe e está pendente
    if (!medicao || medicao.status !== 'pendente') {
      toast({
        title: 'Erro',
        description: 'Esta medição não pode ser aprovada',
        variant: 'destructive',
      });
      return;
    }

    setSelectedMedicao(medicao);
    setActionType('aprovar');
    setShowConfirmModal(true);
  };

  const handleRejeitarMedicao = (medicao: any) => {
    // Validar se medição existe e está pendente
    if (!medicao || medicao.status !== 'pendente') {
      toast({
        title: 'Erro',
        description: 'Esta medição não pode ser rejeitada',
        variant: 'destructive',
      });
      return;
    }

    setSelectedMedicao(medicao);
    setActionType('rejeitar');
    setShowConfirmModal(true);
  };

  const handleVisualizarMedicao = (medicao: any) => {
    setSelectedMedicao(medicao);
    setShowDetailModal(true);
  };

  // Função para confirmar a ação
  const handleConfirmAction = async () => {
    if (!selectedMedicao) return;

    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (actionType === 'aprovar') {
        setMedicoes(prev => 
          prev.map(m => 
            m.id === selectedMedicao.id 
              ? { ...m, status: 'aprovada' }
              : m
          )
        );
        
        toast({
          title: 'Medição aprovada',
          description: `Medição de ${selectedMedicao.periodo} para ${selectedMedicao.obra} foi aprovada com sucesso`,
        });
      } else if (actionType === 'rejeitar') {
        setMedicoes(prev => 
          prev.map(m => 
            m.id === selectedMedicao.id 
              ? { ...m, status: 'rejeitada' }
              : m
          )
        );
        
        toast({
          title: 'Medição rejeitada',
          description: `Medição de ${selectedMedicao.periodo} para ${selectedMedicao.obra} foi rejeitada`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao processar a medição. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      setSelectedMedicao(null);
      setActionType('');
    }
  };

  // Função para aprovar/rejeitar do modal de detalhes
  const handleDetailModalAction = (medicao: any, action: 'aprovar' | 'rejeitar') => {
    setShowDetailModal(false);
    setSelectedMedicao(medicao);
    setActionType(action);
    setShowConfirmModal(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Medições</h1>
            <p className="text-slate-600 mt-1">Controle de medições das obras</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Medição
          </Button>
        </div>

        <AdvancedFilters
          onFiltersChange={setFilters}
          obras={obras}
          statusOptions={statusOptions}
        />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar medições..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-600">
            Exibindo {filteredMedicoes.length} de {medicoes.length} medições
          </div>
        </div>

        <div className="grid gap-4">
          {filteredMedicoes.map((medicao) => (
            <Card key={medicao.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{medicao.obra}</h3>
                      <p className="text-sm text-slate-600">
                        {medicao.periodo} - {medicao.percentual}% executado
                      </p>
                      <p className="text-xs text-slate-500">
                        Valor: {medicao.valor} | Data: {medicao.data}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      medicao.status === 'aprovada' ? 'default' :
                      medicao.status === 'pendente' ? 'secondary' : 'destructive'
                    }>
                      {medicao.status === 'aprovada' ? 'Aprovada' :
                       medicao.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVisualizarMedicao(medicao)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {medicao.status === 'pendente' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRejeitarMedicao(medicao)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleConfirmarMedicao(medicao)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <NovaMedicaoModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <MedicaoDetailModal
          medicao={selectedMedicao}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onAprovar={(medicao) => handleDetailModalAction(medicao, 'aprovar')}
          onRejeitar={(medicao) => handleDetailModalAction(medicao, 'rejeitar')}
        />

        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedMedicao(null);
            setActionType('');
          }}
          onConfirm={handleConfirmAction}
          title={actionType === 'aprovar' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
          description={
            selectedMedicao
              ? `Tem certeza que deseja ${actionType === 'aprovar' ? 'aprovar' : 'rejeitar'} a medição de ${selectedMedicao.periodo} da obra "${selectedMedicao.obra}"?`
              : ''
          }
          confirmText={actionType === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
          cancelText="Cancelar"
          type={actionType === 'aprovar' ? 'success' : 'danger'}
          loading={isLoading}
        />
      </div>
    </MainLayout>
  );
};

export default Medicoes;
