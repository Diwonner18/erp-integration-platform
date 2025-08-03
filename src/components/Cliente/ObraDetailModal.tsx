
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Clock, Check, Circle, CheckSquare, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Aceite {
  id: string;
  etapaId: number;
  nomeCliente: string;
  dataAceite: string;
  observacao?: string;
}

interface ObraDetailModalProps {
  open: boolean;
  onClose: () => void;
  obra: {
    titulo: string;
    endereco: string;
    progresso: number;
    valor: string;
    status: string;
    inicio: string;
    previsao: string;
    etapas: Array<{
      nome: string;
      concluida: boolean;
    }>;
  };
}

const ObraDetailModal = ({ open, onClose, obra }: ObraDetailModalProps) => {
  const { toast } = useToast();
  const [aceites, setAceites] = useState<Aceite[]>([
    // Mock data - em produção viria do banco
    {
      id: '1',
      etapaId: 0,
      nomeCliente: 'João Cliente',
      dataAceite: '2024-01-15 10:30',
      observacao: 'Etapa concluída conforme especificado'
    }
  ]);

  const getCurrentStepIndex = () => {
    const completedSteps = obra.etapas.filter(etapa => etapa.concluida).length;
    return completedSteps < obra.etapas.length ? completedSteps : obra.etapas.length - 1;
  };

  const currentStepIndex = getCurrentStepIndex();

  const handleAceiteEtapa = (etapaIndex: number, etapaNome: string) => {
    const novoAceite: Aceite = {
      id: Date.now().toString(),
      etapaId: etapaIndex,
      nomeCliente: 'Cliente Atual', // Em produção, pegar do contexto de auth
      dataAceite: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      observacao: 'Etapa aceita digitalmente pelo cliente'
    };

    setAceites(prev => [...prev, novoAceite]);

    toast({
      title: "Etapa aceita com sucesso!",
      description: `A etapa "${etapaNome}" foi aceita digitalmente.`,
      duration: 3000,
    });
  };

  const isEtapaAceita = (etapaIndex: number) => {
    return aceites.some(aceite => aceite.etapaId === etapaIndex);
  };

  const getAceiteEtapa = (etapaIndex: number) => {
    return aceites.find(aceite => aceite.etapaId === etapaIndex);
  };

  const getStepIcon = (index: number, etapa: { concluida: boolean }) => {
    if (etapa.concluida) {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
      );
    } else if (index === currentStepIndex) {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Circle className="w-4 h-4 text-white fill-current" />
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
          <Circle className="w-4 h-4 text-slate-500" />
        </div>
      );
    }
  };

  const getStepTextColor = (index: number, etapa: { concluida: boolean }) => {
    if (etapa.concluida) {
      return 'text-slate-900 font-semibold';
    } else if (index === currentStepIndex) {
      return 'text-blue-600 font-medium';
    } else {
      return 'text-slate-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{obra.titulo}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-slate-600" />
              <div>
                <span className="text-sm text-slate-600">Endereço</span>
                <p className="font-medium">{obra.endereco}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-3 text-green-600" />
              <div>
                <span className="text-sm text-slate-600">Valor</span>
                <p className="font-medium">{obra.valor}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <span className="text-sm text-slate-600">Data de Início</span>
                <p className="font-medium">{obra.inicio}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-3 text-orange-600" />
              <div>
                <span className="text-sm text-slate-600">Previsão</span>
                <p className="font-medium">{obra.previsao}</p>
              </div>
            </div>
          </div>

          {/* Status e Progresso */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Status da Obra</span>
              <Badge variant={
                obra.status === 'concluida' ? 'default' :
                obra.status === 'em_andamento' ? 'secondary' : 'outline'
              }>
                {obra.status === 'concluida' ? 'Concluída' :
                 obra.status === 'em_andamento' ? 'Em Andamento' : 'Agendada'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progresso Geral</span>
              <span className="text-lg font-bold text-slate-900">{obra.progresso}%</span>
            </div>
            <Progress value={obra.progresso} className="h-3" />
          </div>

          {/* Etapas da Obra */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Etapas da Obra</h3>
            <div className="space-y-4">
              {obra.etapas.map((etapa, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {getStepIcon(index, etapa)}
                  
                  <div className="flex-1">
                    <div className={`text-sm ${getStepTextColor(index, etapa)}`}>
                      {etapa.nome}
                    </div>
                    
                    {index === currentStepIndex && !etapa.concluida && (
                      <div className="text-xs text-blue-600 mt-1">
                        🔄 Etapa atual em andamento
                      </div>
                    )}
                    
                    {etapa.concluida && !isEtapaAceita(index) && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-green-600">
                          ✅ Concluída - Aguardando aceite
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAceiteEtapa(index, etapa.nome)}
                          className="h-7 text-xs"
                        >
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Aceitar
                        </Button>
                      </div>
                    )}

                    {etapa.concluida && isEtapaAceita(index) && (
                      <div className="text-xs text-blue-600 mt-1">
                        ✅ Concluída e aceita digitalmente
                        <div className="text-xs text-slate-500 mt-1">
                          Aceita por {getAceiteEtapa(index)?.nomeCliente} em {getAceiteEtapa(index)?.dataAceite}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Linha conectora */}
                  {index < obra.etapas.length - 1 && (
                    <div className="absolute left-8 mt-8 w-0.5 h-6 bg-slate-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Aceites */}
          {aceites.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                <History className="w-4 h-4 mr-2" />
                Histórico de Aceites Digitais
              </h4>
              <div className="space-y-2">
                {aceites.map((aceite) => (
                  <div key={aceite.id} className="bg-white p-3 rounded border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {obra.etapas[aceite.etapaId]?.nome}
                        </div>
                        <div className="text-xs text-slate-600">
                          Aceito por: {aceite.nomeCliente}
                        </div>
                        <div className="text-xs text-slate-500">
                          {aceite.dataAceite}
                        </div>
                      </div>
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    </div>
                    {aceite.observacao && (
                      <div className="text-xs text-slate-600 mt-2 italic">
                        "{aceite.observacao}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Visual */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Progresso Visual</h4>
            <div className="flex items-center justify-between">
              {obra.etapas.map((etapa, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isEtapaAceita(index) ? 'bg-blue-600' :
                    etapa.concluida ? 'bg-green-500' :
                    index === currentStepIndex ? 'bg-blue-500' : 'bg-slate-300'
                  }`}></div>
                  <span className="text-xs text-center max-w-16 text-slate-600">
                    {etapa.nome.split(' ')[0]}
                  </span>
                  {isEtapaAceita(index) && (
                    <CheckSquare className="w-3 h-3 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObraDetailModal;
