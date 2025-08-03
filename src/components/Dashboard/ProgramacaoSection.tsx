
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProgramacaoItem {
  id: string;
  obra: string;
  cliente: string;
  etapa: string;
  dataAgendamento: string;
  horario: string;
  local: string;
  status: 'agendado' | 'confirmado' | 'em-andamento';
  responsavel: string;
}

const ProgramacaoSection = () => {
  // Mock data para demonstração
  const programacao: ProgramacaoItem[] = [
    {
      id: '1',
      obra: 'Residencial Silva',
      cliente: 'João Silva',
      etapa: 'Alvenaria - 2º Pavimento',
      dataAgendamento: '2024-01-22',
      horario: '08:00',
      local: 'Rua das Flores, 123',
      status: 'confirmado',
      responsavel: 'Carlos Santos'
    },
    {
      id: '2',
      obra: 'Comercial ABC',
      cliente: 'ABC Ltda',
      etapa: 'Instalações Elétricas',
      dataAgendamento: '2024-01-22',
      horario: '14:00',
      local: 'Av. Principal, 456',
      status: 'agendado',
      responsavel: 'Maria Costa'
    },
    {
      id: '3',
      obra: 'Reforma Escritório',
      cliente: 'Tech Solutions',
      etapa: 'Pintura Final',
      dataAgendamento: '2024-01-23',
      horario: '09:00',
      local: 'Centro Empresarial, Sala 203',
      status: 'em-andamento',
      responsavel: 'Pedro Lima'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em-andamento': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'agendado': return 'Agendado';
      case 'em-andamento': return 'Em Andamento';
      default: return status;
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center font-title text-primary">
          <Calendar className="w-5 h-5 mr-2" />
          PROGRAMAÇÃO - Esta Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {programacao.map((item) => (
            <div key={item.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-title font-semibold text-primary text-lg">{item.obra}</h4>
                  <p className="font-body text-muted-foreground">{item.cliente}</p>
                </div>
                <Badge className={`${getStatusColor(item.status)} font-body`}>
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm font-body">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(item.dataAgendamento).toLocaleDateString('pt-BR')} às {item.horario}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {item.local}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <User className="w-4 h-4 mr-2" />
                  {item.responsavel}
                </div>
                <div className="text-primary font-medium">
                  {item.etapa}
                </div>
              </div>
            </div>
          ))}
          
          {programacao.length === 0 && (
            <div className="text-center py-8 text-muted-foreground font-body">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma atividade programada para esta semana</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramacaoSection;
