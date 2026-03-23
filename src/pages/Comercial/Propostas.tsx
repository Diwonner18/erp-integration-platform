import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Eye, Edit, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NovaPropostaModal from '@/components/Comercial/NovaPropostaModal';
import EditPropostaModal from '@/components/Comercial/EditPropostaModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';
import { usePropostas, useUpdateProposta, useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserModulePermissions } from '@/hooks/usePermissoesPerfil';

const Propostas = () => {
  const { toast } = useToast();
  const perms = useUserModulePermissions('propostas');
  const [showNovaPropostaModal, setShowNovaPropostaModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<any>(null);
  const [actionType, setActionType] = useState<'aprovar' | 'rejeitar' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const { data: propostas = [], isLoading } = usePropostas();
  const { data: obrasData = [] } = useObras();
  const updateProposta = useUpdateProposta();

  const obras = obrasData.map(o => ({ id: o.id, nome: o.nome }));
  const statusOptions = [
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'rejeitada', label: 'Rejeitada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  const filteredPropostas = useMemo(() => {
    let result = propostas;
    if (filters.obra) result = result.filter(p => p.obra_id === filters.obra);
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(p => {
        const d = new Date(p.created_at);
        return d >= filters.dataInicial! && d <= filters.dataFinal!;
      });
    }
    if (searchTerm) {
      result = result.filter(p =>
        (p.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientes?.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [propostas, searchTerm, filters]);

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = { aprovada: 'Aprovada', pendente: 'Pendente', em_analise: 'Em Análise', rejeitada: 'Rejeitada', rascunho: 'Rascunho', cancelada: 'Cancelada' };
    return map[s] || s;
  };

  const canChangeStatus = (status: string) => ['pendente', 'em_analise'].includes(status);

  const handleConfirmAction = async () => {
    if (!selectedProposta) return;
    const newStatus = actionType === 'aprovar' ? 'aprovada' : 'rejeitada';
    try {
      await updateProposta.mutateAsync({ id: selectedProposta.id, status: newStatus as any });
      toast({
        title: actionType === 'aprovar' ? 'Proposta aprovada' : 'Proposta rejeitada',
        description: `"${selectedProposta.titulo}" foi ${newStatus}.`,
        variant: actionType === 'rejeitar' ? 'destructive' : undefined,
      });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao processar a proposta.', variant: 'destructive' });
    } finally {
      setShowConfirmModal(false);
      setSelectedProposta(null);
      setActionType('');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold font-title text-foreground">Propostas</h1>
            <p className="text-muted-foreground mt-1">Gerenciar propostas e contratos</p>
          </div>
          {perms.incluir_editar && <Button onClick={() => setShowNovaPropostaModal(true)} data-tour="page-new-btn"><Plus className="w-4 h-4 mr-2" />Nova Proposta</Button>}
        </div>

        <div data-tour="page-filters"><AdvancedFilters onFiltersChange={setFilters} obras={obras} statusOptions={statusOptions} /></div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar propostas..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">{filteredPropostas.length} de {propostas.length} propostas</div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filteredPropostas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma proposta encontrada</p>
          </div>
        ) : (
          <div className="grid gap-4" data-tour="page-list">
            {filteredPropostas.map((proposta) => (
              <Card key={proposta.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{proposta.titulo}</h3>
                        <p className="text-sm text-muted-foreground">Cliente: {proposta.clientes?.razao_social || '-'}</p>
                        <p className="text-xs text-muted-foreground">Valor: {formatCurrency(proposta.valor)} | {new Date(proposta.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {proposta.data_validade && !['aprovada','rejeitada','cancelada'].includes(proposta.status) && (() => {
                        const days = Math.ceil((new Date(proposta.data_validade).getTime() - Date.now()) / (1000*60*60*24));
                        return days >= 0 && days <= 30 ? <Badge variant="outline" className="text-yellow-700 border-yellow-500 text-xs">Vence em {days}d</Badge> : null;
                      })()}
                      <Badge variant={proposta.status === 'aprovada' ? 'default' : proposta.status === 'pendente' ? 'secondary' : proposta.status === 'rejeitada' ? 'destructive' : 'outline'}>
                        {getStatusLabel(proposta.status)}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedProposta(proposta); setShowDetailModal(true); }}><Eye className="w-4 h-4" /></Button>
                        {perms.incluir_editar && <Button variant="outline" size="sm" onClick={() => { setSelectedProposta(proposta); setShowEditModal(true); }}><Edit className="w-4 h-4" /></Button>}
                        {canChangeStatus(proposta.status) && (
                          <>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => { setSelectedProposta(proposta); setActionType('rejeitar'); setShowConfirmModal(true); }}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => { setSelectedProposta(proposta); setActionType('aprovar'); setShowConfirmModal(true); }}>
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
        )}

        <NovaPropostaModal open={showNovaPropostaModal} onClose={() => setShowNovaPropostaModal(false)} />

        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Detalhes da Proposta</DialogTitle></DialogHeader>
            {selectedProposta && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium">Título</label><p>{selectedProposta.titulo}</p></div>
                  <div><label className="text-sm font-medium">Cliente</label><p>{selectedProposta.clientes?.razao_social || '-'}</p></div>
                  <div><label className="text-sm font-medium">Valor</label><p>{formatCurrency(selectedProposta.valor)}</p></div>
                  <div><label className="text-sm font-medium">Status</label><p>{getStatusLabel(selectedProposta.status)}</p></div>
                  {selectedProposta.prazo_execucao && <div><label className="text-sm font-medium">Prazo</label><p>{selectedProposta.prazo_execucao}</p></div>}
                  {selectedProposta.condicoes_pagamento && <div><label className="text-sm font-medium">Pagamento</label><p>{selectedProposta.condicoes_pagamento}</p></div>}
                </div>
                {selectedProposta.descricao && <div><label className="text-sm font-medium">Descrição</label><p className="text-sm text-muted-foreground">{selectedProposta.descricao}</p></div>}
                <div className="flex justify-end gap-2">
                  {canChangeStatus(selectedProposta.status) && (
                    <>
                      <Button variant="outline" className="text-red-600" onClick={() => { setShowDetailModal(false); setActionType('rejeitar'); setShowConfirmModal(true); }}>
                        <X className="w-4 h-4 mr-2" />Rejeitar
                      </Button>
                      <Button onClick={() => { setShowDetailModal(false); setActionType('aprovar'); setShowConfirmModal(true); }}>
                        <Check className="w-4 h-4 mr-2" />Aprovar
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>Fechar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <EditPropostaModal open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedProposta(null); }} proposta={selectedProposta} onSave={() => { toast({ title: 'Proposta atualizada' }); }} />

        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => { setShowConfirmModal(false); setSelectedProposta(null); setActionType(''); }}
          onConfirm={handleConfirmAction}
          title={actionType === 'aprovar' ? 'Aprovar Proposta' : 'Rejeitar Proposta'}
          description={selectedProposta ? `Tem certeza que deseja ${actionType === 'aprovar' ? 'aprovar' : 'rejeitar'} a proposta "${selectedProposta.titulo}"?` : ''}
          confirmText={actionType === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
          cancelText="Cancelar"
          type={actionType === 'aprovar' ? 'success' : 'danger'}
          loading={updateProposta.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default Propostas;
