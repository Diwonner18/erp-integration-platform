import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Check, X, Clock } from 'lucide-react';
import { usePropostas } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const MinhasPropostas = () => {
  const { data: propostas = [], isLoading } = usePropostas();

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';
  const getStatusLabel = (s: string) => ({ aprovada: 'Aprovada', pendente: 'Pendente', em_analise: 'Em Análise', rejeitada: 'Rejeitada', rascunho: 'Rascunho', cancelada: 'Cancelada' }[s] || s);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-foreground">Minhas Propostas</h1><p className="text-muted-foreground mt-1">Revisar e acompanhar propostas</p></div>

        {isLoading ? (
          <div className="grid gap-6">{[1,2].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div>
        ) : propostas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhuma proposta encontrada</p></div>
        ) : (
          <div className="grid gap-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MinhasPropostas;
