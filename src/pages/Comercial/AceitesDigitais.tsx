import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Eye } from 'lucide-react';
import { useAceitesDigitais } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const AceitesDigitais = () => {
  const { data: aceites = [], isLoading } = useAceitesDigitais();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold text-foreground">Aceites Digitais</h1>
          <p className="text-muted-foreground mt-1">Controlar aprovações de propostas pelos clientes</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : aceites.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum aceite digital registrado</p>
          </div>
        ) : (
          <div className="grid gap-4" data-tour="page-list">
            {aceites.map((aceite) => (
              <Card key={aceite.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{aceite.clientes?.razao_social || 'Cliente'}</h3>
                        <p className="text-sm text-muted-foreground">{aceite.propostas?.titulo || 'Proposta'}</p>
                        <p className="text-xs text-muted-foreground">Aceito em: {new Date(aceite.aceito_em).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <Badge variant="default">Aceito</Badge>
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

export default AceitesDigitais;
