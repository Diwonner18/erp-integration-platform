import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAprovacoes, useUpdateAprovacao } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const Aprovacoes = () => {
  const { toast } = useToast();
  const { data: aprovacoes = [], isLoading } = useAprovacoes();
  const updateAprovacao = useUpdateAprovacao();

  const pendentes = aprovacoes.filter(a => a.status === 'pendente');

  const handleApprove = async (item: any) => {
    try {
      await updateAprovacao.mutateAsync({ id: item.id, status: 'aprovada' as any, data_resposta: new Date().toISOString() });
      toast({ title: 'Item aprovado' });
    } catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  const handleReject = async (item: any) => {
    try {
      await updateAprovacao.mutateAsync({ id: item.id, status: 'rejeitada' as any, data_resposta: new Date().toISOString() });
      toast({ title: 'Item rejeitado', variant: 'destructive' });
    } catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold font-title text-foreground">Aprovações Pendentes</h1><p className="text-muted-foreground mt-1">Itens aguardando aprovação</p></div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : pendentes.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <CheckSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma aprovação pendente</h3>
            <p className="text-muted-foreground">Todas as solicitações foram processadas</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {pendentes.map((item) => (
              <Card key={item.id}><CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.tipo}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Ref: {item.referencia_tabela || '-'}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2"><Clock className="w-3 h-3 mr-1" />{new Date(item.created_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleReject(item)}>Rejeitar</Button>
                    <Button size="sm" onClick={() => handleApprove(item)}>Aprovar</Button>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Aprovacoes;
