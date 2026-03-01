import React, { useState, useMemo } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Calendar, MapPin, User, Plus, Search, Filter, CheckSquare, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';
import ProgramacaoDetailModal from '../components/Programacao/ProgramacaoDetailModal';
import EditProgramacaoModal from '../components/Programacao/EditProgramacaoModal';

interface AceiteProgramacao {
  id: string;
  programacaoId: number;
  nomeCliente: string;
  dataAceite: string;
  comentario?: string;
}

const Programacao = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedProgramacao, setSelectedProgramacao] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAceiteModal, setShowAceiteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aceiteComentario, setAceiteComentario] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const [aceites, setAceites] = useState<AceiteProgramacao[]>([]);

  const [programacoes, setProgramacoes] = useState<any[]>([]);

  const obras: { id: string; nome: string }[] = [];

  const statusOptions = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'executando', label: 'Em Execução' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProgramacoes = useMemo(() => {
    let result = programacoes;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(programacao => programacao.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(programacao => {
        const programacaoDate = new Date(programacao.dataInicio);
        return programacaoDate >= filters.dataInicial! && programacaoDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(programacao => programacao.status === filters.status);
    }

    // Aplicar busca textual
    if (searchTerm) {
      result = result.filter(programacao => 
        programacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programacao.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programacao.escopo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [programacoes, filters, searchTerm]);

  const handleVisualizarProgramacao = (programacao: any) => {
    setSelectedProgramacao(programacao);
    setShowDetailModal(true);
  };

  const handleEditarProgramacao = (programacao: any) => {
    setSelectedProgramacao(programacao);
    setShowEditModal(true);
  };

  const handleSaveProgramacao = (updatedProgramacao: any) => {
    setProgramacoes(prev => 
      prev.map(pg => pg.id === updatedProgramacao.id ? updatedProgramacao : pg)
    );
    
    toast({
      title: "Programação atualizada",
      description: `Programação de ${updatedProgramacao.cliente} foi atualizada com sucesso`,
    });
  };

  const handleAceitarProgramacao = () => {
    if (!selectedProgramacao) return;

    const novoAceite: AceiteProgramacao = {
      id: Date.now().toString(),
      programacaoId: selectedProgramacao.id,
      nomeCliente: selectedProgramacao.cliente,
      dataAceite: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      comentario: aceiteComentario.trim() || undefined
    };

    setAceites(prev => [...prev, novoAceite]);
    setAceiteComentario('');
    setShowAceiteModal(false);
    setSelectedProgramacao(null);

    toast({
      title: "Programação aceita com sucesso!",
      description: `A programação foi confirmada digitalmente.`,
      duration: 3000,
    });
  };

  const isProgramacaoAceita = (programacaoId: number) => {
    return aceites.some(aceite => aceite.programacaoId === programacaoId);
  };

  const getAceiteProgramacao = (programacaoId: number) => {
    return aceites.find(aceite => aceite.programacaoId === programacaoId);
  };

  const handleSubmitNovaProgramacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    const formData = new FormData(e.target as HTMLFormElement);
    const novaProgramacao = {
      id: Date.now(),
      obraId: Date.now().toString(),
      cliente: formData.get('cliente') as string,
      metragem: formData.get('metragem') as string,
      endereco: formData.get('endereco') as string,
      escopo: formData.get('escopo') as string,
      dataInicio: formData.get('dataInicio') as string,
      dataFim: formData.get('dataFim') as string,
      status: 'agendado',
      prioridade: formData.get('prioridade') as string
    };

    setProgramacoes(prev => [...prev, novaProgramacao]);

    toast({
      title: "Programação criada",
      description: `Nova programação para ${novaProgramacao.cliente} foi criada com sucesso.`,
    });
    
    setLoading(false);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Em Execução':
        return 'bg-green-100 text-green-800';
      case 'Concluído':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Programação de Obras</h1>
            <p className="text-slate-600 mt-1">Gerencie a programação e execução das obras</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Obra
          </Button>
        </div>

        <AdvancedFilters
          onFiltersChange={setFilters}
          obras={obras}
          statusOptions={statusOptions}
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  placeholder="Buscar por cliente, endereço ou escopo..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="text-sm text-slate-600 flex items-center">
              Exibindo {filteredProgramacoes.length} de {programacoes.length} programações
            </div>
          </div>
        </div>

        {/* Agendamentos List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Obras Programadas</h3>
          </div>
          
          <div className="divide-y divide-slate-200">
            {filteredProgramacoes.map((programacao) => (
              <div key={programacao.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{programacao.cliente}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(programacao.status)}`}>
                        {programacao.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(programacao.prioridade)}`}>
                        {programacao.prioridade}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {programacao.endereco}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Metragem: {programacao.metragem}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Início: {new Date(programacao.dataInicio).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Fim: {new Date(programacao.dataFim).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mt-3">
                      <strong>Escopo:</strong> {programacao.escopo}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {/* Botão de Aceite */}
                    {programacao.status === 'agendado' && !isProgramacaoAceita(programacao.id) && (
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedProgramacao(programacao);
                          setShowAceiteModal(true);
                        }}
                      >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Aceitar
                      </Button>
                    )}
                    
                    {/* Indicador de Aceite */}
                    {isProgramacaoAceita(programacao.id) && (
                      <div className="flex items-center text-green-600 text-sm mr-2">
                        <CheckSquare className="w-4 h-4 mr-1" />
                        Aceito
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditarProgramacao(programacao)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVisualizarProgramacao(programacao)}
                    >
                      Visualizar
                    </Button>
                  </div>
                </div>

                {/* Informações do Aceite */}
                {isProgramacaoAceita(programacao.id) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center text-sm text-green-800 font-medium">
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Programação confirmada digitalmente
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Aceito em: {getAceiteProgramacao(programacao.id)?.dataAceite}
                          </span>
                        </div>
                        {getAceiteProgramacao(programacao.id)?.comentario && (
                          <div className="text-xs text-green-700 mt-2 italic">
                            <MessageCircle className="w-3 h-3 mr-1 inline" />
                            "{getAceiteProgramacao(programacao.id)?.comentario}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">Nova Programação de Obra</h2>
              </div>
              
              <form className="p-6 space-y-6" onSubmit={handleSubmitNovaProgramacao}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">
                       Cliente
                     </label>
                     <Input name="cliente" placeholder="Nome do cliente" required />
                   </div>
                  
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">
                       Metragem
                     </label>
                     <Input name="metragem" placeholder="Ex: 120m²" required />
                   </div>
                </div>
                
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">
                     Endereço Completo
                   </label>
                   <Input name="endereco" placeholder="Rua, número, bairro, cidade, CEP" required />
                 </div>
                
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">
                     Escopo da Obra
                   </label>
                   <textarea 
                     name="escopo"
                     className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     rows={4}
                     placeholder="Descreva detalhadamente o escopo da obra..."
                     required
                   ></textarea>
                 </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">
                       Data de Início
                     </label>
                     <Input name="dataInicio" type="date" required />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">
                       Data Prevista de Conclusão
                     </label>
                     <Input name="dataFim" type="date" required />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">
                       Prioridade
                     </label>
                     <select name="prioridade" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                       <option value="">Selecione a prioridade</option>
                       <option value="Alta">Alta</option>
                       <option value="Média">Média</option>
                       <option value="Baixa">Baixa</option>
                     </select>
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Responsável Técnico
                    </label>
                    <Input placeholder="Digite o Responsável Técnico" required />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                   <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                     {loading ? 'Salvando...' : 'Salvar Agendamento'}
                   </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedProgramacao && (
          <ProgramacaoDetailModal
            open={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedProgramacao(null);
            }}
            programacao={selectedProgramacao}
          />
        )}

        {/* Edit Modal */}
        {selectedProgramacao && (
          <EditProgramacaoModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProgramacao(null);
            }}
            programacao={selectedProgramacao}
            onSave={handleSaveProgramacao}
          />
        )}

        {/* Modal de Aceite */}
        <Dialog open={showAceiteModal} onOpenChange={setShowAceiteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Programação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                Você está confirmando a programação para:
                <div className="font-medium text-slate-900 mt-1">
                  {selectedProgramacao?.cliente} - {selectedProgramacao?.escopo}
                </div>
                <div className="text-slate-600 text-xs mt-1">
                  Data: {selectedProgramacao && new Date(selectedProgramacao.dataInicio).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Comentário (Opcional)
                </label>
                <Textarea
                  placeholder="Adicione um comentário sobre o aceite..."
                  value={aceiteComentario}
                  onChange={(e) => setAceiteComentario(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAceiteModal(false);
                    setAceiteComentario('');
                    setSelectedProgramacao(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAceitarProgramacao}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Confirmar Aceite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Programacao;
