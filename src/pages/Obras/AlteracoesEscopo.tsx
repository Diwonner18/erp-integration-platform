import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileEdit, Plus, Search, Check, X } from 'lucide-react';
import SugestaoEscopoModal from '@/components/Obras/SugestaoEscopoModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';
import { useAlteracoesEscopo, useUpdateAlteracaoEscopo, useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserModulePermissions } from '@/hooks/usePermissoesPerfil';

const AlteracoesEscopo = () => {
  const { incluir_editar } = useUserModulePermissions('alteracoes_escopo');
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAlteracao, setSelectedAlteracao] = useState<any>(null);
  const [confirmationType, setConfirmationType] = useState<'aprovar' | 'rejeitar'>('aprovar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const { data: alteracoes = [], isLoading } = useAlteracoesEscopo();
  const { data: obrasData = [] } = useObras();
  const updateAlteracao = useUpdateAlteracaoEscopo();

  const obras = obrasData.map(o => ({ id: o.id, nome: o.nome }));
  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'rejeitada', label: 'Rejeitada' },
  ];

  const filteredAlteracoes = useMemo(() => {
    let result = alteracoes;
    if (filters.obra) result = result.filter(a => a.obra_id === filters.obra);
    if (filters.status) result = result.filter(a => a.status === filters.status);
    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(a => {
        const d = new Date(a.created_at);
        return d >= filters.dataInicial! && d <= filters.dataFinal!;
      });
    }
    if (searchTerm) {
      result = result.filter(a =>
        (a.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.obras?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [alteracoes, filters, searchTerm]);

  const handleConfirmAction = async () => {
    if (!selectedAlteracao) return;
    const newStatus = confirmationType === 'aprovar' ? 'aprovada' : 'rejeitada';
    try {
      await updateAlteracao.mutateAsync({ id: selectedAlteracao.id, status: newStatus as any });
      toast({
        title: confirmationType === 'aprovar' ? 'Alteração aprovada' : 'Alteração rejeitada',
        description: `A alteração foi ${newStatus} com sucesso.`,
        variant: confirmationType === 'rejeitar' ? 'destructive' : undefined,
      });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao processar.', variant: 'destructive' });
    } finally {
      setShowConfirmModal(false);
      setSelectedAlteracao(null);
    }
  };

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alterações de Escopo</h1>
            <p className="text-muted-foreground mt-1">Sugestões e aprovações de mudanças</p>
          </div>
          {incluir_editar && <Button onClick={() => setShowModal(true)} data-tour="page-new-btn"><Plus className="w-4 h-4 mr-2" />Nova Sugestão</Button>}
        </div>

        <div data-tour="page-filters"><AdvancedFilters onFiltersChange={setFilters} obras={obras} statusOptions={statusOptions} /></div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar alterações..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">{filteredAlteracoes.length} de {alteracoes.length} alterações</div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filteredAlteracoes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma alteração de escopo encontrada</p>
          </div>
        ) : (
          <div className="grid gap-4" data-tour="page-list">
            {filteredAlteracoes.map((alteracao) => (
              <Card key={alteracao.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileEdit className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{alteracao.descricao}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{alteracao.obras?.nome || 'Obra'}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Data: {new Date(alteracao.created_at).toLocaleDateString('pt-BR')}</span>
                          <span>Impacto: {formatCurrency(alteracao.impacto_valor)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge variant={
                        alteracao.status === 'aprovada' ? 'default' :
                        alteracao.status === 'pendente' ? 'secondary' : 'destructive'
                      }>
                        {alteracao.status === 'aprovada' ? 'Aprovada' :
                         alteracao.status === 'pendente' ? 'Pendente' :
                         alteracao.status === 'em_analise' ? 'Em Análise' : 'Rejeitada'}
                      </Badge>
                      {alteracao.status === 'pendente' && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => { setSelectedAlteracao(alteracao); setConfirmationType('rejeitar'); setShowConfirmModal(true); }}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => { setSelectedAlteracao(alteracao); setConfirmationType('aprovar'); setShowConfirmModal(true); }}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <SugestaoEscopoModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => { setShowConfirmModal(false); setSelectedAlteracao(null); }}
          onConfirm={handleConfirmAction}
          title={confirmationType === 'aprovar' ? 'Aprovar Alteração' : 'Rejeitar Alteração'}
          description={confirmationType === 'aprovar'
            ? `Tem certeza que deseja aprovar esta alteração?`
            : `Tem certeza que deseja rejeitar esta alteração?`}
          confirmText={confirmationType === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
          type={confirmationType === 'aprovar' ? 'success' : 'danger'}
          loading={updateAlteracao.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default AlteracoesEscopo;
