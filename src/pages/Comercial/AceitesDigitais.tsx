
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckSquare, Clock, FileCheck, Eye, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfirmationModal from '@/components/ui/confirmation-modal';

const AceitesDigitais = () => {
  const { toast } = useToast();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAceite, setSelectedAceite] = useState(null);
  const [actionType, setActionType] = useState('');

  const [aceites, setAceites] = useState<any[]>([]);

  const handleVisualizarAceite = (aceite: any) => {
    setSelectedAceite(aceite);
    setShowDetailModal(true);
  };

  const handleEnviarLembrete = (aceite: any) => {
    setSelectedAceite(aceite);
    setActionType('lembrete');
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (actionType === 'lembrete' && selectedAceite) {
      toast({
        title: "Lembrete enviado",
        description: `Lembrete enviado para ${selectedAceite.client} sobre a proposta pendente.`,
      });
    }
    setShowConfirmModal(false);
    setSelectedAceite(null);
    setActionType('');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aceites Digitais</h1>
          <p className="text-slate-600 mt-1">Controlar aprovações de propostas pelos clientes</p>
        </div>

        <div className="grid gap-4">
          {aceites.map((aceite) => (
            <Card key={aceite.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      aceite.status === 'aceito' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {aceite.status === 'aceito' ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{aceite.client}</h3>
                      <p className="text-sm text-slate-600">{aceite.proposal}</p>
                      <p className="text-xs text-slate-500">Data: {aceite.date} | Valor: {aceite.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={aceite.status === 'aceito' ? 'default' : 'secondary'}>
                      {aceite.status === 'aceito' ? 'Aceito' : 'Pendente'}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVisualizarAceite(aceite)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    {aceite.status === 'pendente' && (
                      <Button 
                        size="sm"
                        onClick={() => handleEnviarLembrete(aceite)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Lembrete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Aceite Digital</DialogTitle>
            </DialogHeader>
            {selectedAceite && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Cliente</label>
                    <p className="text-slate-900">{selectedAceite.client}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Proposta</label>
                    <p className="text-slate-900">{selectedAceite.proposal}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <p className="text-slate-900">{selectedAceite.status === 'aceito' ? 'Aceito' : 'Pendente'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Valor</label>
                    <p className="text-slate-900">{selectedAceite.value}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Data</label>
                  <p className="text-slate-900">{selectedAceite.date}</p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirmation Modal */}
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmAction}
          title="Enviar Lembrete"
          description={`Tem certeza que deseja enviar um lembrete para ${selectedAceite?.client} sobre a proposta pendente?`}
          confirmText="Enviar"
          type="info"
        />
      </div>
    </MainLayout>
  );
};

export default AceitesDigitais;
