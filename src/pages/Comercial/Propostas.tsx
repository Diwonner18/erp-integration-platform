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
import { useToast } from '@/hooks/use-toast';
import { usePropostas, useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const Propostas = () => {
  const { toast } = useToast();
  const [showNovaPropostaModal, setShowNovaPropostaModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: propostas = [], isLoading } = usePropostas();
  const { data: obrasData = [] } = useObras();

  const filteredPropostas = useMemo(() => {
    let result = propostas;
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (searchTerm) {
      result = result.filter(p =>
        (p.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientes?.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [propostas, searchTerm, statusFilter]);

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = { aprovada: 'Aprovada', pendente: 'Pendente', em_analise: 'Em Análise', rejeitada: 'Rejeitada', rascunho: 'Rascunho', cancelada: 'Cancelada' };
    return map[s] || s;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-title text-foreground">Propostas</h1>
            <p className="text-muted-foreground mt-1">Gerenciar propostas e contratos</p>
          </div>
          <Button onClick={() => setShowNovaPropostaModal(true)}><Plus className="w-4 h-4 mr-2" />Nova Proposta</Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar propostas..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-border rounded-md text-sm">
              <option value="all">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="em_analise">Em Análise</option>
              <option value="rejeitada">Rejeitada</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">{filteredPropostas.length} de {propostas.length} propostas</div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filteredPropostas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma proposta encontrada</p>
          </div>
        ) : (
          <div className="grid gap-4">
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
                      <Badge variant={proposta.status === 'aprovada' ? 'default' : proposta.status === 'pendente' ? 'secondary' : proposta.status === 'rejeitada' ? 'destructive' : 'outline'}>
                        {getStatusLabel(proposta.status)}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedProposta(proposta); setShowDetailModal(true); }}><Eye className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedProposta(proposta); setShowEditModal(true); }}><Edit className="w-4 h-4" /></Button>
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
                </div>
                {selectedProposta.descricao && <div><label className="text-sm font-medium">Descrição</label><p className="text-sm text-muted-foreground">{selectedProposta.descricao}</p></div>}
                <div className="flex justify-end"><Button variant="outline" onClick={() => setShowDetailModal(false)}>Fechar</Button></div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <EditPropostaModal open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedProposta(null); }} proposta={selectedProposta} onSave={() => { toast({ title: 'Proposta atualizada' }); }} />
      </div>
    </MainLayout>
  );
};

export default Propostas;
