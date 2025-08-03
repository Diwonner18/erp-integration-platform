
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Clock, Eye } from 'lucide-react';
import ObraDetailModal from '@/components/Cliente/ObraDetailModal';

const MinhasObras = () => {
  const [selectedObra, setSelectedObra] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const obras = [
    {
      titulo: 'Instalação Elétrica Residencial',
      endereco: 'Rua das Flores, 123 - Vila Nova',
      progresso: 85,
      valor: 'R$ 12.500',
      status: 'em_andamento',
      inicio: '2024-01-10',
      previsao: '2024-01-25',
      etapas: [
        { nome: 'Planejamento', concluida: true },
        { nome: 'Instalação de quadros', concluida: true },
        { nome: 'Passagem de cabos', concluida: true },
        { nome: 'Instalação de pontos', concluida: false },
        { nome: 'Testes finais', concluida: false }
      ]
    },
    {
      titulo: 'Sistema de Automação',
      endereco: 'Av. Principal, 456 - Centro',
      progresso: 45,
      valor: 'R$ 8.900',
      status: 'em_andamento',
      inicio: '2024-01-20',
      previsao: '2024-02-05',
      etapas: [
        { nome: 'Análise técnica', concluida: true },
        { nome: 'Aquisição de materiais', concluida: true },
        { nome: 'Instalação básica', concluida: false },
        { nome: 'Configuração sistema', concluida: false },
        { nome: 'Treinamento', concluida: false }
      ]
    },
    {
      titulo: 'Manutenção Preventiva',
      endereco: 'Rua do Comércio, 789 - Jardim',
      progresso: 100,
      valor: 'R$ 1.200',
      status: 'concluida',
      inicio: '2024-01-05',
      previsao: '2024-01-05',
      etapas: [
        { nome: 'Inspeção geral', concluida: true },
        { nome: 'Limpeza de componentes', concluida: true },
        { nome: 'Testes de funcionamento', concluida: true },
        { nome: 'Relatório técnico', concluida: true }
      ]
    }
  ];

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

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Etapas da Obra</h4>
                  <div className="space-y-2">
                    {obra.etapas.map((etapa, etapaIndex) => (
                      <div key={etapaIndex} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          etapa.concluida 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-slate-300'
                        }`}>
                          {etapa.concluida && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className={`text-sm ${
                          etapa.concluida 
                            ? 'text-slate-900 font-medium' 
                            : 'text-slate-500'
                        }`}>
                          {etapa.nome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão Ver mais detalhes */}
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

        {/* Modal de Detalhes */}
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
