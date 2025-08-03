import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Ruler, Calendar, DollarSign, Building, TrendingUp, Check, X } from 'lucide-react';

interface MedicaoDetailModalProps {
  medicao: any;
  isOpen: boolean;
  onClose: () => void;
  onAprovar?: (medicao: any) => void;
  onRejeitar?: (medicao: any) => void;
}

const MedicaoDetailModal = ({ 
  medicao, 
  isOpen, 
  onClose, 
  onAprovar, 
  onRejeitar 
}: MedicaoDetailModalProps) => {
  if (!medicao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Ruler className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>Detalhes da Medição</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Obra</p>
                <p className="font-medium">{medicao.obra}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Período</p>
                <p className="font-medium">{medicao.periodo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Percentual Executado</p>
                <p className="font-medium">{medicao.percentual}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Valor</p>
                <p className="font-medium">{medicao.valor}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Data da Medição</p>
                <p className="font-medium">{medicao.data}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4" />
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge variant={
                  medicao.status === 'aprovada' ? 'default' :
                  medicao.status === 'pendente' ? 'secondary' : 'destructive'
                }>
                  {medicao.status === 'aprovada' ? 'Aprovada' :
                   medicao.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                </Badge>
              </div>
            </div>
          </div>

          {medicao.status === 'pendente' && (onAprovar || onRejeitar) && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                {onRejeitar && (
                  <Button 
                    variant="outline" 
                    onClick={() => onRejeitar(medicao)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                )}
                {onAprovar && (
                  <Button onClick={() => onAprovar(medicao)}>
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                )}
              </div>
            </>
          )}

          {medicao.status !== 'pendente' && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicaoDetailModal;