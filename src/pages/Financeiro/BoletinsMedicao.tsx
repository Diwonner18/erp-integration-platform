import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye } from 'lucide-react';
import NovoBoletimModal from '@/components/Financeiro/NovoBoletimModal';
import { useBoletins } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const BoletinsMedicao = () => {
  const [showNovoBoletimModal, setShowNovoBoletimModal] = useState(false);
  const { data: boletins = [], isLoading } = useBoletins();

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold font-title text-foreground">Boletins de Medição</h1><p className="text-muted-foreground mt-1">Emitir boletins para faturamento</p></div>
          <Button onClick={() => setShowNovoBoletimModal(true)}><Plus className="w-4 h-4 mr-2" />Novo Boletim</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : boletins.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhum boletim emitido</p></div>
        ) : (
          <div className="grid gap-4">
            {boletins.map((boletim) => (
              <Card key={boletim.id}><CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{boletim.obras?.nome || 'Obra'}</h3>
                      <p className="text-sm text-muted-foreground">{boletim.numero || 'S/N'}</p>
                      <p className="text-xs text-muted-foreground">Valor: {formatCurrency(boletim.valor)}</p>
                    </div>
                  </div>
                  <Badge variant={boletim.status === 'pago' ? 'default' : boletim.status === 'aprovado' ? 'secondary' : 'outline'}>
                    {boletim.status === 'pago' ? 'Pago' : boletim.status === 'aprovado' ? 'Aprovado' : boletim.status === 'emitido' ? 'Emitido' : 'Rascunho'}
                  </Badge>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        <NovoBoletimModal open={showNovoBoletimModal} onClose={() => setShowNovoBoletimModal(false)} />
      </div>
    </MainLayout>
  );
};

export default BoletinsMedicao;
