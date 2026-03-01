
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Clock, Eye, ClipboardList } from 'lucide-react';
import ObraDetailModal from '@/components/Cliente/ObraDetailModal';

const MinhasObras = () => {
  const [selectedObra, setSelectedObra] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const obras: any[] = [];

  const handleVerDetalhes = (obra: any) => {
    setSelectedObra(obra);
    setShowDetailModal(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Minhas Obras</h1>
          <p className="text-slate-600 mt-1">Acompanhe o status e progresso das suas obras</p>
        </div>

        {obras.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma obra encontrada</p>
            <p className="text-sm">Suas obras aparecerão aqui quando forem criadas</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {obras.map((obra, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{obra.titulo}</CardTitle>
                      <div className="flex items-center text-sm text-slate-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {obra.endereco}
                      </div>
                    </div>
                    <Badge variant={
                      obra.status === 'concluida' ? 'default' :
                      obra.status === 'em_andamento' ? 'secondary' : 'outline'
                    }>
                      {obra.status === 'concluida' ? 'Concluída' :
                       obra.status === 'em_andamento' ? 'Em Andamento' : 'Agendada'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm">
                        <span className="text-slate-600">Valor: </span>
                        <span className="font-semibold">{obra.valor}</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm">
                        <span className="text-slate-600">Início: </span>
                        <span className="font-semibold">{obra.inicio}</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-orange-600" />
                      <span className="text-sm">
                        <span className="text-slate-600">Previsão: </span>
                        <span className="font-semibold">{obra.previsao}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progresso Geral</span>
                      <span className="text-sm font-semibold text-slate-900">{obra.progresso}%</span>
                    </div>
                    <Progress value={obra.progresso} className="h-2" />
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleVerDetalhes(obra)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver mais detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedObra && (
          <ObraDetailModal
            open={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedObra(null);
            }}
            obra={selectedObra}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default MinhasObras;
