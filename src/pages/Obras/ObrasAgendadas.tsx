import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User } from 'lucide-react';
import { useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const ObrasAgendadas = () => {
  const { data: todasObras = [], isLoading } = useObras();
  const obrasAgendadas = todasObras.filter(o => o.status === 'programada' || o.status === 'programacao_pendente');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold text-foreground">Obras Agendadas</h1>
          <p className="text-muted-foreground mt-1">Próximas obras programadas para execução</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">{[1,2].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div>
        ) : obrasAgendadas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma obra agendada</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {obrasAgendadas.map((obra) => (
              <Card key={obra.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{obra.nome}</CardTitle>
                      <p className="text-muted-foreground mt-1">{obra.clientes?.razao_social || '-'}</p>
                    </div>
                    <Badge variant="secondary">
                      <Calendar className="w-3 h-3 mr-1" />
                      {obra.data_inicio ? new Date(obra.data_inicio).toLocaleDateString('pt-BR') : 'Sem data'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Local</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{obra.endereco || '-'}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Escopo</h4>
                      <p>{obra.escopo || '-'}</p>
                    </div>
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

export default ObrasAgendadas;
