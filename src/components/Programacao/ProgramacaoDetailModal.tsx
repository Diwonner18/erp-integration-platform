
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, User, Clock } from 'lucide-react';

interface ProgramacaoDetailModalProps {
  open: boolean;
  onClose: () => void;
  programacao: {
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

const ProgramacaoDetailModal = ({ open, onClose, programacao }: ProgramacaoDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Programação #{programacao.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cliente</label>
              <div className="flex items-center text-slate-900">
                <User className="w-4 h-4 mr-2" />
                {programacao.cliente}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Metragem</label>
              <div className="text-slate-900">{programacao.metragem}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Endereço</label>
            <div className="flex items-center text-slate-900">
              <MapPin className="w-4 h-4 mr-2" />
              {programacao.endereco}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Escopo da Obra</label>
            <div className="text-slate-900 bg-slate-50 p-3 rounded-md">{programacao.escopo}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Início</label>
              <div className="flex items-center text-slate-900">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(programacao.dataInicio).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Fim</label>
              <div className="flex items-center text-slate-900">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(programacao.dataFim).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <div className="text-slate-900">{programacao.status}</div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Prioridade</label>
              <div className="text-slate-900">{programacao.prioridade}</div>
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

export default ProgramacaoDetailModal;
