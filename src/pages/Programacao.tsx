import React, { useState, useMemo } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Calendar, MapPin, User, Plus, Search, CheckSquare, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';
import ProgramacaoDetailModal from '../components/Programacao/ProgramacaoDetailModal';
import EditProgramacaoModal from '../components/Programacao/EditProgramacaoModal';
import { useProgramacoes, useObras, useCreateProgramacao, useUpdateProgramacao } from '@/hooks/useSupabaseData';
import NovaObraInlineModal from '../components/Obras/NovaObraInlineModal';

const Programacao = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedProgramacao, setSelectedProgramacao] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAceiteModal, setShowAceiteModal] = useState(false);
  const [showNovaObra, setShowNovaObra] = useState(false);
  const [aceiteComentario, setAceiteComentario] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const { data: programacoes = [], isLoading: loadingProgramacoes } = useProgramacoes();
  const { data: obrasData = [], isLoading: loadingObras } = useObras();
  const createProgramacao = useCreateProgramacao();
  const updateProgramacao = useUpdateProgramacao();

  // Form state for new programacao
  const [newFormData, setNewFormData] = useState({
    obraId: '',
    descricao: '',
    dataProgramada: '',
    responsavel: '',
    tipo: 'execucao' as string,
    horaInicio: '',
    horaFim: '',
  });

  const obrasOptions = obrasData.map(o => ({ id: o.id, nome: o.nome }));

  const statusOptions = [
    { value: 'programada', label: 'Programada' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'em_execucao', label: 'Em Execução' },
    { value: 'executada', label: 'Executada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  const filteredProgramacoes = useMemo(() => {
    let result = programacoes;

    if (filters.obra) {
      result = result.filter(p => p.obra_id === filters.obra);
    }
    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(p => {
        const d = new Date(p.data_programada);
        return d >= filters.dataInicial! && d <= filters.dataFinal!;
      });
    }
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (searchTerm) {
      result = result.filter(p =>
        (p.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.responsavel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((p as any).obras?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSaveProgramacao = async (updatedProgramacao: any) => {
    try {
      await updateProgramacao.mutateAsync({
        id: updatedProgramacao.id,
        descricao: updatedProgramacao.descricao,
        status: updatedProgramacao.status,
        responsavel: updatedProgramacao.responsavel,
      });
      toast({ title: "Programação atualizada", description: "Atualizada com sucesso" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleConfirmarProgramacao = async () => {
    if (!selectedProgramacao) return;
    try {
      await updateProgramacao.mutateAsync({
        id: selectedProgramacao.id,
        status: 'confirmada' as any,
      });
      toast({ title: "Programação confirmada!", description: "A programação foi confirmada digitalmente." });
      setShowAceiteModal(false);
      setSelectedProgramacao(null);
      setAceiteComentario('');
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmitNovaProgramacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormData.obraId || !newFormData.dataProgramada) {
      toast({ title: "Erro", description: "Obra e data são obrigatórios", variant: "destructive" });
      return;
    }

    try {
      await createProgramacao.mutateAsync({
        obra_id: newFormData.obraId,
        data_programada: newFormData.dataProgramada,
        descricao: newFormData.descricao || null,
        responsavel: newFormData.responsavel || null,
        tipo: newFormData.tipo as any,
        hora_inicio: newFormData.horaInicio || null,
        hora_fim: newFormData.horaFim || null,
      });
      toast({ title: "Programação criada", description: "Nova programação criada com sucesso." });
      setShowForm(false);
      setNewFormData({ obraId: '', descricao: '', dataProgramada: '', responsavel: '', tipo: 'execucao', horaInicio: '', horaFim: '' });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programada': return 'bg-blue-100 text-blue-800';
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'em_execucao': return 'bg-orange-100 text-orange-800';
      case 'executada': return 'bg-gray-100 text-gray-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'programada': return 'Programada';
      case 'confirmada': return 'Confirmada';
      case 'em_execucao': return 'Em Execução';
      case 'executada': return 'Executada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  if (loadingProgramacoes || loadingObras) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center" data-tour="page-header">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Programação de Obras</h1>
            <p className="text-muted-foreground mt-1">Gerencie a programação e execução das obras</p>
          </div>
          <Button onClick={() => setShowForm(true)} data-tour="page-new-btn">
            <Plus className="w-4 h-4 mr-2" />
            Nova Programação
          </Button>
        </div>

        <div data-tour="page-filters"><AdvancedFilters onFiltersChange={setFilters} obras={obrasOptions} statusOptions={statusOptions} /></div>

        <div className="bg-card rounded-lg shadow-sm border p-6" data-tour="page-search">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Buscar por descrição, responsável ou obra..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredProgramacoes.length} de {programacoes.length} programações
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border" data-tour="page-list">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-foreground">Obras Programadas</h3>
          </div>
          <div className="divide-y">
            {filteredProgramacoes.map((prog) => (
              <div key={prog.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{(prog as any).obras?.nome || 'Obra'}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prog.status)}`}>
                        {getStatusLabel(prog.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(prog.data_programada).toLocaleDateString('pt-BR')}
                      </div>
                      {prog.responsavel && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {prog.responsavel}
                        </div>
                      )}
                      {(prog as any).obras?.endereco && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {(prog as any).obras.endereco}
                        </div>
                      )}
                    </div>
                    {prog.descricao && (
                      <p className="text-sm text-muted-foreground mt-3">{prog.descricao}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {prog.status === 'programada' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                        setSelectedProgramacao(prog);
                        setShowAceiteModal(true);
                      }}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                    )}
                    {prog.status === 'confirmada' && (
                      <div className="flex items-center text-green-600 text-sm mr-2">
                        <CheckSquare className="w-4 h-4 mr-1" />
                        Confirmada
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEditarProgramacao(prog)}>Editar</Button>
                    <Button variant="outline" size="sm" onClick={() => handleVisualizarProgramacao(prog)}>Visualizar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nova Programação Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Programação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitNovaProgramacao} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Obra *</Label>
                    <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowNovaObra(true)}>
                      <Plus className="w-3 h-3 mr-1" /> Cadastrar nova
                    </Button>
                  </div>
                  <Select value={newFormData.obraId} onValueChange={(v) => setNewFormData(prev => ({...prev, obraId: v}))}>
                    <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                    <SelectContent>
                      {obrasData.map(o => (<SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Programada *</Label>
                  <Input type="date" value={newFormData.dataProgramada} onChange={(e) => setNewFormData(prev => ({...prev, dataProgramada: e.target.value}))} required />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newFormData.tipo} onValueChange={(v) => setNewFormData(prev => ({...prev, tipo: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visita">Visita</SelectItem>
                      <SelectItem value="execucao">Execução</SelectItem>
                      <SelectItem value="medicao">Medição</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input value={newFormData.responsavel} onChange={(e) => setNewFormData(prev => ({...prev, responsavel: e.target.value}))} placeholder="Responsável técnico" />
                </div>
                <div className="space-y-2">
                  <Label>Hora Início</Label>
                  <Input type="time" value={newFormData.horaInicio} onChange={(e) => setNewFormData(prev => ({...prev, horaInicio: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim</Label>
                  <Input type="time" value={newFormData.horaFim} onChange={(e) => setNewFormData(prev => ({...prev, horaFim: e.target.value}))} />
                </div>
              </div>

              {/* Auto-fill from selected obra */}
              {newFormData.obraId && (() => {
                const obraSelecionada = obrasData.find(o => o.id === newFormData.obraId);
                if (!obraSelecionada) return null;
                return (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
                    <p className="font-medium text-foreground">Dados da Obra:</p>
                    {obraSelecionada.metragem ? <p className="text-muted-foreground">M²: {obraSelecionada.metragem}</p> : null}
                    {obraSelecionada.endereco ? <p className="text-muted-foreground">Endereço: {obraSelecionada.endereco}</p> : null}
                    {obraSelecionada.escopo ? <p className="text-muted-foreground">Escopo: {obraSelecionada.escopo}</p> : null}
                    {obraSelecionada.data_inicio ? <p className="text-muted-foreground">Início: {new Date(obraSelecionada.data_inicio).toLocaleDateString('pt-BR')}</p> : null}
                    {obraSelecionada.data_previsao ? <p className="text-muted-foreground">Previsão: {new Date(obraSelecionada.data_previsao).toLocaleDateString('pt-BR')}</p> : null}
                  </div>
                );
              })()}

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={newFormData.descricao} onChange={(e) => setNewFormData(prev => ({...prev, descricao: e.target.value}))} placeholder="Descreva a programação..." rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={createProgramacao.isPending}>
                  {createProgramacao.isPending ? 'Salvando...' : 'Criar Programação'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        {selectedProgramacao && (
          <ProgramacaoDetailModal open={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedProgramacao(null); }} programacao={selectedProgramacao} />
        )}

        {/* Edit Modal */}
        {selectedProgramacao && (
          <EditProgramacaoModal open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedProgramacao(null); }} programacao={selectedProgramacao} onSave={handleSaveProgramacao} />
        )}

        {/* Modal de Aceite/Confirmação */}
        <Dialog open={showAceiteModal} onOpenChange={setShowAceiteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Programação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Confirmando programação para:
                <div className="font-medium text-foreground mt-1">
                  {(selectedProgramacao as any)?.obras?.nome} — {selectedProgramacao?.descricao || 'Sem descrição'}
                </div>
                <div className="text-xs mt-1">
                  Data: {selectedProgramacao && new Date(selectedProgramacao.data_programada).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div>
                <Label>Comentário (Opcional)</Label>
                <Textarea placeholder="Adicione um comentário..." value={aceiteComentario} onChange={(e) => setAceiteComentario(e.target.value)} rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setShowAceiteModal(false); setAceiteComentario(''); setSelectedProgramacao(null); }}>Cancelar</Button>
                <Button onClick={handleConfirmarProgramacao} className="bg-green-600 hover:bg-green-700" disabled={updateProgramacao.isPending}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {updateProgramacao.isPending ? 'Confirmando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal inline de criação de obra */}
        <NovaObraInlineModal
          open={showNovaObra}
          onClose={() => setShowNovaObra(false)}
          onCreated={(obra) => setNewFormData((prev) => ({ ...prev, obraId: obra.id }))}
        />
      </div>
    </MainLayout>
  );
};

export default Programacao;
