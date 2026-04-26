import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Clock, Eye, ClipboardList } from 'lucide-react';
import ObraDetailModal from '@/components/Cliente/ObraDetailModal';
import { useObrasCliente } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const MinhasObras = () => {
  const [selectedObra, setSelectedObra] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { data: obras = [], isLoading } = useObrasCliente();

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header"><h1 className="text-3xl font-bold text-foreground">Minhas Obras</h1><p className="text-muted-foreground mt-1">Acompanhe o status das suas obras</p></div>

        {isLoading ? (
          <div className="grid gap-6">{[1,2].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div>
        ) : obras.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="font-medium">Nenhuma obra encontrada</p></div>
        ) : (
          <div className="grid gap-6" data-tour="page-list">
            {obras.map((obra) => (
              <Card key={obra.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div><CardTitle className="text-lg">{obra.nome}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1"><MapPin className="w-4 h-4 mr-1" />{obra.endereco || '-'}</div>
                    </div>
                    <Badge variant={obra.status === 'concluida' ? 'default' : obra.status === 'em_andamento' ? 'secondary' : 'outline'}>
                      {obra.status === 'concluida' ? 'Concluída' : obra.status === 'em_andamento' ? 'Em Andamento' : obra.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-600" /><span className="text-sm"><span className="text-muted-foreground">Valor: </span><span className="font-semibold">{formatCurrency(obra.valor_contrato)}</span></span></div>
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-blue-600" /><span className="text-sm"><span className="text-muted-foreground">Início: </span><span className="font-semibold">{obra.data_inicio ? new Date(obra.data_inicio).toLocaleDateString('pt-BR') : '-'}</span></span></div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-orange-600" /><span className="text-sm"><span className="text-muted-foreground">Previsão: </span><span className="font-semibold">{obra.data_previsao ? new Date(obra.data_previsao).toLocaleDateString('pt-BR') : '-'}</span></span></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Progresso</span><span className="text-sm font-semibold">{obra.progresso || 0}%</span></div>
                    <Progress value={obra.progresso || 0} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => { setSelectedObra(obra as any); setShowDetailModal(true); }}><Eye className="w-4 h-4 mr-2" />Ver mais detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedObra && <ObraDetailModal open={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedObra(null); }} obra={selectedObra} />}
      </div>
    </MainLayout>
  );
};

export default MinhasObras;
