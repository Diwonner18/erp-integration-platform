import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle } from 'lucide-react';
import { usePropostas, useCreateAceiteDigital, useClientes } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MinhasPropostas = () => {
  const { data: propostas = [], isLoading } = usePropostas();
  const { data: clientes = [] } = useClientes();
  const createAceite = useCreateAceiteDigital();
  const { toast } = useToast();
  const { user } = useAuth();

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<any>(null);

  const clienteDoUsuario = clientes.find(c => c.user_id === user?.id);

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';
  const getStatusLabel = (s: string) => ({ aprovada: 'Aprovada', pendente: 'Pendente', em_analise: 'Em Análise', rejeitada: 'Rejeitada', rascunho: 'Rascunho', cancelada: 'Cancelada' }[s] || s);

  const handleAceitar = async () => {
    if (!selectedProposta || !clienteDoUsuario) return;
    try {
      await createAceite.mutateAsync({
        proposta_id: selectedProposta.id,
        cliente_id: clienteDoUsuario.id,
      });
      toast({ title: 'Proposta aceita!', description: 'Seu aceite digital foi registrado com sucesso.' });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao registrar o aceite.', variant: 'destructive' });
    } finally {
      setShowConfirm(false);
      setSelectedProposta(null);
    }
  };

  const canAccept = (status: string) => ['pendente', 'em_analise'].includes(status);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header"><h1 className="text-3xl font-bold text-foreground">Minhas Propostas</h1><p className="text-muted-foreground mt-1">Revisar e aceitar propostas</p></div>

        {isLoading ? (
          <div className="grid gap-6">{[1,2].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div>
        ) : propostas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhuma proposta encontrada</p></div>
        ) : (
          <div className="grid gap-6" data-tour="page-list">
            {propostas.map((proposta) => (
              <Card key={proposta.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div><CardTitle className="text-lg flex items-center"><FileText className="w-5 h-5 mr-2" />{proposta.titulo}</CardTitle></div>
                    <Badge variant={proposta.status === 'aprovada' ? 'default' : proposta.status === 'pendente' ? 'secondary' : 'destructive'}>
                      {getStatusLabel(proposta.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {proposta.descricao && <p className="text-sm text-muted-foreground">{proposta.descricao}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div><span className="text-xs text-muted-foreground">Valor</span><p className="font-semibold text-lg text-primary">{formatCurrency(proposta.valor)}</p></div>
                    <div><span className="text-xs text-muted-foreground">Data</span><p className="font-medium">{new Date(proposta.created_at).toLocaleDateString('pt-BR')}</p></div>
                    <div><span className="text-xs text-muted-foreground">Validade</span><p className="font-medium">{proposta.data_validade ? new Date(proposta.data_validade).toLocaleDateString('pt-BR') : '-'}</p></div>
                  </div>
                  {canAccept(proposta.status) && clienteDoUsuario && (
                    <div className="flex justify-end">
                      <Button onClick={() => { setSelectedProposta(proposta); setShowConfirm(true); }}>
                        <CheckCircle className="w-4 h-4 mr-2" />Aceitar Proposta
                      </Button>
                    </div>
                  )}
                  {proposta.status === 'aprovada' && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span>Proposta aceita</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ConfirmationModal
          open={showConfirm}
          onClose={() => { setShowConfirm(false); setSelectedProposta(null); }}
          onConfirm={handleAceitar}
          title="Aceitar Proposta"
          description={selectedProposta ? `Ao aceitar, você confirma digitalmente a proposta "${selectedProposta.titulo}" no valor de ${formatCurrency(selectedProposta.valor)}. Esta ação não pode ser desfeita.` : ''}
          confirmText="Confirmar Aceite"
          cancelText="Cancelar"
          type="success"
          loading={createAceite.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default MinhasPropostas;
