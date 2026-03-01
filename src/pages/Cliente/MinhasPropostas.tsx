
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Check, X, Clock, AlertTriangle } from 'lucide-react';

const MinhasPropostas = () => {
  const { toast } = useToast();
  const [propostas, setPropostas] = useState<any[]>([]);

  const [showRecusaModal, setShowRecusaModal] = useState(false);
  const [propostaSelecionada, setPropostaSelecionada] = useState<any>(null);
  const [justificativaRecusa, setJustificativaRecusa] = useState('');

  const calcularDiasRestantes = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAceitarProposta = (proposta: any) => {
    const dataAtual = new Date().toISOString().split('T')[0];
    
    setPropostas(prev => 
      prev.map(p => 
        p.id === proposta.id 
          ? { ...p, status: 'aceita', dataAceitacao: dataAtual }
          : p
      )
    );

    toast({
      title: "Proposta aceita com sucesso",
      description: `A proposta ${proposta.numero} foi aceita em ${dataAtual}`,
    });
  };

  const handleRecusarProposta = (proposta: any) => {
    setPropostaSelecionada(proposta);
    setShowRecusaModal(true);
  };

  const confirmarRecusa = () => {
    if (propostaSelecionada) {
      setPropostas(prev => 
        prev.map(p => 
          p.id === propostaSelecionada.id 
            ? { ...p, status: 'recusada', justificativaRecusa }
            : p
        )
      );

      toast({
        title: "Proposta recusada",
        description: `A proposta ${propostaSelecionada.numero} foi recusada`,
      });

      setShowRecusaModal(false);
      setPropostaSelecionada(null);
      setJustificativaRecusa('');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Minhas Propostas</h1>
          <p className="text-slate-600 mt-1">Revisar e aceitar propostas enviadas</p>
        </div>

        <div className="grid gap-6">
          {propostas.map((proposta) => {
            const diasRestantes = calcularDiasRestantes(proposta.vencimento);
            const isVencida = diasRestantes < 0;
            const isPendente = proposta.status === 'pendente';
            
            return (
              <Card key={proposta.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        {proposta.numero}
                      </CardTitle>
                      <p className="text-slate-600 mt-1">{proposta.servico}</p>
                    </div>
                    <Badge variant={
                      proposta.status === 'aceita' ? 'default' :
                      proposta.status === 'pendente' ? 'secondary' :
                      proposta.status === 'vencida' ? 'destructive' :
                      proposta.status === 'recusada' ? 'destructive' : 'outline'
                    }>
                      {proposta.status === 'aceita' ? 'Aceita' :
                       proposta.status === 'pendente' ? 'Pendente' :
                       proposta.status === 'vencida' ? 'Vencida' :
                       proposta.status === 'recusada' ? 'Recusada' : proposta.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">{proposta.descricao}</p>
                  
                  {/* Alerta de validade para propostas pendentes */}
                  {isPendente && !isVencida && (
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">
                          {diasRestantes === 1 
                            ? `Último dia para aceitar esta proposta!` 
                            : `${diasRestantes} dias restantes para aceitar esta proposta`
                          }
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Válida até {new Date(proposta.vencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-xs text-slate-500">Valor Total</span>
                      <p className="font-semibold text-lg text-green-600">{proposta.valor}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Data da Proposta</span>
                      <p className="font-medium">{new Date(proposta.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Válida até</span>
                      <p className={`font-medium ${
                        isVencida ? 'text-red-600' : ''
                      }`}>
                        {new Date(proposta.vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                    
                    {isPendente && !isVencida && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRecusarProposta(proposta)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Recusar
                        </Button>
                        <Button onClick={() => handleAceitarProposta(proposta)}>
                          <Check className="w-4 h-4 mr-2" />
                          Aceitar Proposta
                        </Button>
                      </div>
                    )}
                    
                    {proposta.status === 'aceita' && (
                      <div className="flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          Proposta aceita em {proposta.dataAceitacao ? new Date(proposta.dataAceitacao).toLocaleDateString('pt-BR') : proposta.data}
                        </span>
                      </div>
                    )}
                    
                    {proposta.status === 'recusada' && (
                      <div className="flex items-center text-red-600">
                        <X className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Proposta recusada</span>
                      </div>
                    )}
                    
                    {(proposta.status === 'vencida' || (isPendente && isVencida)) && (
                      <div className="flex items-center text-red-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Proposta vencida</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal de Recusa */}
        <Dialog open={showRecusaModal} onOpenChange={setShowRecusaModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Recusar Proposta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Tem certeza que deseja recusar a proposta {propostaSelecionada?.numero}?
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="justificativa">Justificativa (opcional)</Label>
                <Textarea
                  id="justificativa"
                  placeholder="Digite o motivo da recusa..."
                  value={justificativaRecusa}
                  onChange={(e) => setJustificativaRecusa(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRecusaModal(false);
                    setJustificativaRecusa('');
                    setPropostaSelecionada(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmarRecusa}
                >
                  Confirmar Recusa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default MinhasPropostas;
