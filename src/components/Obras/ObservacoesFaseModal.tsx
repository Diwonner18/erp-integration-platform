import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Clock, User, MessageSquare, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Observacao {
  id: string;
  comentario: string;
  responsavel: string;
  dataHora: string;
}

interface Fase {
  id: string;
  nome: string;
  status: 'nao_iniciada' | 'em_andamento' | 'concluida';
  observacoes: Observacao[];
}

interface ObservacoesFaseModalProps {
  open: boolean;
  onClose: () => void;
  obraId: string;
  obraNome: string;
}

const ObservacoesFaseModal: React.FC<ObservacoesFaseModalProps> = ({
  open,
  onClose,
  obraId,
  obraNome
}) => {
  const { toast } = useToast();
  const [fases, setFases] = useState<Fase[]>([
    {
      id: '1',
      nome: 'Estuque',
      status: 'concluida',
      observacoes: [
        {
          id: '1',
          comentario: 'Início dos trabalhos de estuque nas paredes externas',
          responsavel: 'João Silva',
          dataHora: '2024-01-15 08:30'
        }
      ]
    },
    {
      id: '2',
      nome: 'Lixamento',
      status: 'em_andamento',
      observacoes: [
        {
          id: '2',
          comentario: 'Lixamento das superfícies preparadas iniciado',
          responsavel: 'Maria Santos',
          dataHora: '2024-01-20 09:15'
        }
      ]
    },
    {
      id: '3',
      nome: 'Pintura',
      status: 'nao_iniciada',
      observacoes: []
    },
    {
      id: '4',
      nome: 'Acabamento',
      status: 'nao_iniciada',
      observacoes: []
    }
  ]);

  const [faseAtiva, setFaseAtiva] = useState<string>('1');
  const [novaObservacao, setNovaObservacao] = useState({
    comentario: '',
    responsavel: ''
  });

  const handleAdicionarObservacao = () => {
    if (!novaObservacao.comentario.trim() || !novaObservacao.responsavel.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o comentário e o responsável",
        variant: "destructive"
      });
      return;
    }

    const novaObs: Observacao = {
      id: Date.now().toString(),
      comentario: novaObservacao.comentario,
      responsavel: novaObservacao.responsavel,
      dataHora: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setFases(prev => prev.map(fase => 
      fase.id === faseAtiva 
        ? { ...fase, observacoes: [...fase.observacoes, novaObs] }
        : fase
    ));

    setNovaObservacao({ comentario: '', responsavel: '' });

    toast({
      title: "Observação adicionada",
      description: "A observação foi registrada com sucesso"
    });
  };

  const getStatusColor = (status: Fase['status']) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nao_iniciada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: Fase['status']) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'em_andamento':
        return 'Em Andamento';
      case 'nao_iniciada':
        return 'Não Iniciada';
      default:
        return 'Não Iniciada';
    }
  };

  const faseAtualData = fases.find(f => f.id === faseAtiva);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Observações por Fase - {obraNome}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Lista de Fases */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-700 mb-3">Fases da Obra</h3>
            {fases.map((fase) => (
              <Card 
                key={fase.id}
                className={`cursor-pointer transition-all ${
                  faseAtiva === fase.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                }`}
                onClick={() => setFaseAtiva(fase.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{fase.nome}</h4>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(fase.status)}
                    >
                      {getStatusText(fase.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {fase.observacoes.length} observações
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detalhes da Fase Ativa */}
          <div className="md:col-span-2 space-y-4">
            {faseAtualData && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{faseAtualData.nome}</h3>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(faseAtualData.status)}
                  >
                    {getStatusText(faseAtualData.status)}
                  </Badge>
                </div>

                <Separator />

                {/* Formulário para Nova Observação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Adicionar Observação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Responsável
                      </label>
                      <Input
                        placeholder="Nome do responsável"
                        value={novaObservacao.responsavel}
                        onChange={(e) => setNovaObservacao(prev => ({
                          ...prev,
                          responsavel: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Comentário
                      </label>
                      <Textarea
                        placeholder="Descreva as observações sobre esta fase..."
                        value={novaObservacao.comentario}
                        onChange={(e) => setNovaObservacao(prev => ({
                          ...prev,
                          comentario: e.target.value
                        }))}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleAdicionarObservacao}
                      className="w-full"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Observação
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de Observações Existentes */}
                <div>
                  <h4 className="font-medium text-sm text-slate-700 mb-3">
                    Histórico de Observações ({faseAtualData.observacoes.length})
                  </h4>
                  <ScrollArea className="h-60">
                    <div className="space-y-3">
                      {faseAtualData.observacoes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma observação registrada</p>
                        </div>
                      ) : (
                        faseAtualData.observacoes.map((obs) => (
                          <Card key={obs.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-3">
                              <p className="text-sm text-slate-900 mb-2">{obs.comentario}</p>
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {obs.responsavel}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {obs.dataHora}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObservacoesFaseModal;