
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, User, Clock } from 'lucide-react';

interface AgendamentoDetailModalProps {
  open: boolean;
  onClose: () => void;
  agendamento: {
    id: number;
    cliente: string;
    metragem: string;
    endereco: string;
    escopo: string;
    dataInicio: string;
    dataFim: string;
    status: string;
    prioridade: string;
  };
}

const AgendamentoDetailModal = ({ open, onClose, agendamento }: AgendamentoDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento #{agendamento.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cliente</label>
              <div className="flex items-center text-slate-900">
                <User className="w-4 h-4 mr-2" />
                {agendamento.cliente}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Metragem</label>
              <div className="text-slate-900">{agendamento.metragem}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Endereço</label>
            <div className="flex items-center text-slate-900">
              <MapPin className="w-4 h-4 mr-2" />
              {agendamento.endereco}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Escopo da Obra</label>
            <div className="text-slate-900 bg-slate-50 p-3 rounded-md">{agendamento.escopo}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Início</label>
              <div className="flex items-center text-slate-900">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(agendamento.dataInicio).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Fim</label>
              <div className="flex items-center text-slate-900">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(agendamento.dataFim).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <div className="text-slate-900">{agendamento.status}</div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Prioridade</label>
              <div className="text-slate-900">{agendamento.prioridade}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendamentoDetailModal;
