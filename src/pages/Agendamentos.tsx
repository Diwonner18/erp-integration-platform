import React, { useState, useMemo } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Calendar, MapPin, User, Plus, Search, Filter, CheckSquare, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';
import AgendamentoDetailModal from '../components/Agendamentos/AgendamentoDetailModal';
import EditAgendamentoModal from '../components/Agendamentos/EditAgendamentoModal';

interface AceiteAgendamento {
  id: string;
  agendamentoId: number;
  nomeCliente: string;
  dataAceite: string;
  comentario?: string;
}

const Agendamentos = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
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

  const [aceites, setAceites] = useState<AceiteAgendamento[]>([
    // Mock data - em produção viria do banco
    {
      id: '1',
      agendamentoId: 1,
      nomeCliente: 'João Silva',
      dataAceite: '2024-01-16 14:30',
      comentario: 'Agendamento confirmado. Aguardando início dos trabalhos.'
    }
  ]);

  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      obraId: '1',
      cliente: 'João Silva',
      metragem: '120m²',
      endereco: 'Rua das Flores, 123 - Centro, São Paulo',
      escopo: 'Reforma completa da casa',
      dataInicio: '2024-02-01',
      dataFim: '2024-04-15',
      status: 'agendado',
      prioridade: 'Alta'
    },
    {
      id: 2,
      obraId: '2',
      cliente: 'Maria Santos',
      metragem: '80m²',
      endereco: 'Av. Paulista, 456 - Bela Vista, São Paulo',
      escopo: 'Ampliação de cômodos',
      dataInicio: '2024-02-15',
      dataFim: '2024-03-30',
      status: 'executando',
      prioridade: 'Média'
    }
  ]);

  const obras = [
    { id: '1', nome: 'Reforma João Silva' },
    { id: '2', nome: 'Ampliação Maria Santos' },
    { id: '3', nome: 'Construção Comercial Norte' },
    { id: '4', nome: 'Instalação Industrial Sul' }
  ];

  const statusOptions = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'executando', label: 'Em Execução' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgendamentos = useMemo(() => {
    let result = agendamentos;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(agendamento => agendamento.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(agendamento => {
        const agendamentoDate = new Date(agendamento.dataInicio);
        return agendamentoDate >= filters.dataInicial! && agendamentoDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(agendamento => agendamento.status === filters.status);
    }

    // Aplicar busca textual
    if (searchTerm) {
      result = result.filter(agendamento => 
        agendamento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.escopo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [agendamentos, filters, searchTerm]);

  const handleVisualizarAgendamento = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setShowDetailModal(true);
  };

  const handleEditarAgendamento = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setShowEditModal(true);
  };

  const handleSaveAgendamento = (updatedAgendamento: any) => {
    setAgendamentos(prev => 
      prev.map(ag => ag.id === updatedAgendamento.id ? updatedAgendamento : ag)
    );
    
    toast({
      title: "Agendamento atualizado",
      description: `Agendamento de ${updatedAgendamento.cliente} foi atualizado com sucesso`,
    });
  };

  const handleAceitarAgendamento = () => {
    if (!selectedAgendamento) return;

    const novoAceite: AceiteAgendamento = {
      id: Date.now().toString(),
      agendamentoId: selectedAgendamento.id,
      nomeCliente: selectedAgendamento.cliente,
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
    setSelectedAgendamento(null);

    toast({
      title: "Agendamento aceito com sucesso!",
      description: `O agendamento foi confirmado digitalmente.`,
      duration: 3000,
    });
  };

  const isAgendamentoAceito = (agendamentoId: number) => {
    return aceites.some(aceite => aceite.agendamentoId === agendamentoId);
  };

  const getAceiteAgendamento = (agendamentoId: number) => {
    return aceites.find(aceite => aceite.agendamentoId === agendamentoId);
  };

  const handleSubmitNovoAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    const formData = new FormData(e.target as HTMLFormElement);
    const novoAgendamento = {
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

    setAgendamentos(prev => [...prev, novoAgendamento]);

    toast({
      title: "Agendamento criado",
      description: `Novo agendamento para ${novoAgendamento.cliente} foi criado com sucesso.`,
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
            <h1 className="text-2xl font-bold text-slate-900">Agendamentos de Obras</h1>
            <p className="text-slate-600 mt-1">Gerencie o agendamento e execução das obras</p>
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
              Exibindo {filteredAgendamentos.length} de {agendamentos.length} agendamentos
            </div>
          </div>
        </div>

        {/* Agendamentos List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Obras Agendadas</h3>
          </div>
          
          <div className="divide-y divide-slate-200">
            {filteredAgendamentos.map((agendamento) => (
              <div key={agendamento.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{agendamento.cliente}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(agendamento.prioridade)}`}>
                        {agendamento.prioridade}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {agendamento.endereco}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Metragem: {agendamento.metragem}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Início: {new Date(agendamento.dataInicio).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Fim: {new Date(agendamento.dataFim).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mt-3">
                      <strong>Escopo:</strong> {agendamento.escopo}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {/* Botão de Aceite */}
                    {agendamento.status === 'agendado' && !isAgendamentoAceito(agendamento.id) && (
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedAgendamento(agendamento);
                          setShowAceiteModal(true);
                        }}
                      >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Aceitar
                      </Button>
                    )}
                    
                    {/* Indicador de Aceite */}
                    {isAgendamentoAceito(agendamento.id) && (
                      <div className="flex items-center text-green-600 text-sm mr-2">
                        <CheckSquare className="w-4 h-4 mr-1" />
                        Aceito
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditarAgendamento(agendamento)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVisualizarAgendamento(agendamento)}
                    >
                      Visualizar
                    </Button>
                  </div>
                </div>

                {/* Informações do Aceite */}
                {isAgendamentoAceito(agendamento.id) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center text-sm text-green-800 font-medium">
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Agendamento confirmado digitalmente
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Aceito em: {getAceiteAgendamento(agendamento.id)?.dataAceite}
                          </span>
                        </div>
                        {getAceiteAgendamento(agendamento.id)?.comentario && (
                          <div className="text-xs text-green-700 mt-2 italic">
                            <MessageCircle className="w-3 h-3 mr-1 inline" />
                            "{getAceiteAgendamento(agendamento.id)?.comentario}"
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
                <h2 className="text-xl font-semibold text-slate-900">Novo Agendamento de Obra</h2>
              </div>
              
              <form className="p-6 space-y-6" onSubmit={handleSubmitNovoAgendamento}>
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
                    <select className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                      <option value="">Selecione o responsável</option>
                      <option value="engenheiro1">Eng. Carlos Silva</option>
                      <option value="engenheiro2">Eng. Ana Santos</option>
                      <option value="engenheiro3">Eng. João Pedro</option>
                    </select>
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
        {selectedAgendamento && (
          <AgendamentoDetailModal
            open={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedAgendamento(null);
            }}
            agendamento={selectedAgendamento}
          />
        )}

        {/* Edit Modal */}
        {selectedAgendamento && (
          <EditAgendamentoModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedAgendamento(null);
            }}
            agendamento={selectedAgendamento}
            onSave={handleSaveAgendamento}
          />
        )}

        {/* Modal de Aceite */}
        <Dialog open={showAceiteModal} onOpenChange={setShowAceiteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                Você está confirmando o agendamento para:
                <div className="font-medium text-slate-900 mt-1">
                  {selectedAgendamento?.cliente} - {selectedAgendamento?.escopo}
                </div>
                <div className="text-slate-600 text-xs mt-1">
                  Data: {selectedAgendamento && new Date(selectedAgendamento.dataInicio).toLocaleDateString('pt-BR')}
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
                    setSelectedAgendamento(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAceitarAgendamento}
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

export default Agendamentos;
