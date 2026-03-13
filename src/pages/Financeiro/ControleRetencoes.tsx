import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Clock } from 'lucide-react';
import { useRetencoes } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const ControleRetencoes = () => {
  const navigate = useNavigate();
  const { data: retencoes = [], isLoading } = useRetencoes();

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const totalRetido = retencoes.filter(r => r.status === 'pendente').reduce((acc, r) => acc + (r.valor || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header"><h1 className="text-3xl font-bold text-primary">Controle de Retenções</h1><p className="text-muted-foreground mt-1">Acompanhar valores retidos</p></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="page-stats">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Retido</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalRetido)}</div><p className="text-xs text-muted-foreground">Aguardando liberação</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Retenções</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{retencoes.length}</div></CardContent></Card>
        </div>

        {isLoading ? <Skeleton className="h-48 w-full" /> : retencoes.length === 0 ? (
          <Card><CardContent className="text-center py-8 text-muted-foreground"><Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhuma retenção registrada</p></CardContent></Card>
        ) : (
          <Card><CardHeader><CardTitle>Retenções</CardTitle></CardHeader><CardContent>
            <div className="space-y-4">
              {retencoes.map((retencao) => (
                <div
                  key={retencao.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/retencoes/${retencao.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Wallet className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h4 className="font-semibold text-foreground">{retencao.obras?.nome || 'Obra'}</h4>
                      <p className="text-sm text-muted-foreground">{retencao.tipo} - {retencao.percentual}% - {formatCurrency(retencao.valor || 0)}</p>
                    </div>
                  </div>
                  <Badge variant={retencao.status === 'liberado' ? 'default' : 'secondary'}>{retencao.status === 'liberado' ? 'Liberado' : 'Pendente'}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ControleRetencoes;
