import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Users, Eye, FileText } from 'lucide-react';
import ObservacoesFaseModal from '@/components/Obras/ObservacoesFaseModal';
import { useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const ObrasEmAndamento = () => {
  const [showObservacoesFase, setShowObservacoesFase] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState<{ id: string; nome: string } | null>(null);

  const { data: todasObras = [], isLoading } = useObras();
  const obrasEmAndamento = todasObras.filter(o => o.status === 'em_andamento');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold font-title text-foreground">Obras em Andamento</h1>
          <p className="text-muted-foreground mt-1">Acompanhamento de obras ativas</p>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Exibindo {obrasEmAndamento.length} obras em andamento
        </div>

        {isLoading ? (
          <div className="grid gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div>
        ) : obrasEmAndamento.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma obra em andamento</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {obrasEmAndamento.map((obra) => (
              <Card key={obra.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{obra.nome}</CardTitle>
                      <p className="text-muted-foreground mt-1">{obra.clientes?.razao_social || '-'} - {obra.endereco || '-'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-2">Escopo</h4>
                      <p className="text-foreground">{obra.escopo || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-2">Data Prevista</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{obra.data_previsao ? new Date(obra.data_previsao).toLocaleDateString('pt-BR') : '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm text-foreground">Progresso</h4>
                      <span className="text-sm font-medium">{obra.progresso || 0}%</span>
                    </div>
                    <Progress value={obra.progresso || 0} className="h-2" />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => { setObraSelecionada({ id: obra.id, nome: obra.nome }); setShowObservacoesFase(true); }}>
                      <FileText className="w-4 h-4 mr-2" />Observações por Fase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {obraSelecionada && (
          <ObservacoesFaseModal open={showObservacoesFase} onClose={() => { setShowObservacoesFase(false); setObraSelecionada(null); }} obraId={obraSelecionada.id} obraNome={obraSelecionada.nome} />
        )}
      </div>
    </MainLayout>
  );
};

export default ObrasEmAndamento;
