import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, DollarSign, Clock, Building } from 'lucide-react';

interface ObraDetailModalProps {
  open: boolean;
  onClose: () => void;
  obra: any;
}

const formatCurrency = (v: number | null | undefined) =>
  v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v)) : 'R$ 0,00';

const formatDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '-';

const ObraDetailModal = ({ open, onClose, obra }: ObraDetailModalProps) => {
  if (!obra) return null;

  const progresso = Number(obra.progresso) || 0;
  const statusLabel =
    obra.status === 'concluida' ? 'Concluída'
    : obra.status === 'em_andamento' ? 'Em Andamento'
    : obra.status === 'agendada' ? 'Agendada'
    : obra.status || '-';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Building className="w-5 h-5" />
            {obra.nome || 'Obra'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Endereço completo (com CEP) */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-0.5 text-primary shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Endereço Completo</span>
                <p className="font-medium text-foreground mt-1">{obra.endereco || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-muted-foreground text-xs mb-1">
                <DollarSign className="w-4 h-4 mr-1" />Valor do Contrato
              </div>
              <p className="text-lg font-bold text-primary">{formatCurrency(obra.valor_contrato)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-muted-foreground text-xs mb-1">
                <Calendar className="w-4 h-4 mr-1" />Início
              </div>
              <p className="text-lg font-semibold">{formatDate(obra.data_inicio)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center text-muted-foreground text-xs mb-1">
                <Clock className="w-4 h-4 mr-1" />Previsão
              </div>
              <p className="text-lg font-semibold">{formatDate(obra.data_previsao)}</p>
            </div>
          </div>

          {/* Status e progresso */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Status</span>
              <Badge variant={obra.status === 'concluida' ? 'default' : 'secondary'}>{statusLabel}</Badge>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progresso</span>
                <span className="text-lg font-bold text-foreground">{progresso}%</span>
              </div>
              <Progress value={progresso} className="h-3" />
            </div>
          </div>

          {/* Descrição / observações */}
          {(obra.descricao || obra.observacoes) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {obra.descricao || obra.observacoes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObraDetailModal;
