
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileEdit, Plus, Search, Eye, Check, X } from 'lucide-react';
import SugestaoEscopoModal from '@/components/Obras/SugestaoEscopoModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';

const AlteracoesEscopo = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAlteracao, setSelectedAlteracao] = useState(null);
  const [confirmationType, setConfirmationType] = useState<'aprovar' | 'rejeitar'>('aprovar');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [alteracoes, setAlteracoes] = useState<any[]>([]);

  const filteredAlteracoes = alteracoes.filter(alteracao => 
    alteracao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alteracao.obra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAprovarAlteracao = (alteracao: any) => {
    setSelectedAlteracao(alteracao);
    setConfirmationType('aprovar');
    setShowConfirmModal(true);
  };

  const handleRejeitarAlteracao = (alteracao: any) => {
    setSelectedAlteracao(alteracao);
    setConfirmationType('rejeitar');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAlteracao) return;

    setLoading(true);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const newStatus = confirmationType === 'aprovar' ? 'aprovada' : 'rejeitada';
    
    setAlteracoes(prev => 
      prev.map(alt => 
        alt.id === selectedAlteracao.id 
          ? { ...alt, status: newStatus }
          : alt
      )
    );

    toast({
      title: confirmationType === 'aprovar' ? 'Alteração aprovada' : 'Alteração rejeitada',
      description: `"${selectedAlteracao.titulo}" foi ${newStatus} e seu status foi atualizado no sistema.`,
      variant: confirmationType === 'rejeitar' ? 'destructive' : undefined,
    });

    setLoading(false);
    setShowConfirmModal(false);
    setSelectedAlteracao(null);
  };

  const handleVisualizarAlteracao = (alteracao: any) => {
    const detailsHtml = `
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">${alteracao.titulo}</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Obra:</strong> ${alteracao.obra}</div>
          <div><strong>Tipo:</strong> ${alteracao.tipo === 'adicao' ? 'Adição' : alteracao.tipo === 'modificacao' ? 'Modificação' : 'Remoção'}</div>
          <div><strong>Status:</strong> ${alteracao.status === 'aprovada' ? 'Aprovada' : alteracao.status === 'pendente' ? 'Pendente' : 'Rejeitada'}</div>
          <div><strong>Prioridade:</strong> ${alteracao.prioridade}</div>
          <div><strong>Data:</strong> ${alteracao.data}</div>
          <div><strong>Impacto Valor:</strong> ${alteracao.impactoValor}</div>
        </div>
      </div>
    `;
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        ${detailsHtml}
        <div class="mt-6 flex justify-end">
          <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Fechar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    toast({
      title: 'Detalhes da alteração',
      description: `Exibindo informações completas de "${alteracao.titulo}"`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Alterações de Escopo</h1>
            <p className="text-slate-600 mt-1">Sugestões e aprovações de mudanças</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Sugestão
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar alterações..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredAlteracoes.map((alteracao) => (
            <Card key={alteracao.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileEdit className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{alteracao.titulo}</h3>
                      <p className="text-sm text-slate-600 mt-1">{alteracao.obra}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span>Data: {alteracao.data}</span>
                        <span>Impacto: {alteracao.impactoValor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col space-y-2">
                      <Badge variant={
                        alteracao.tipo === 'adicao' ? 'default' :
                        alteracao.tipo === 'modificacao' ? 'secondary' : 'outline'
                      }>
                        {alteracao.tipo === 'adicao' ? 'Adição' :
                         alteracao.tipo === 'modificacao' ? 'Modificação' : 'Remoção'}
                      </Badge>
                      <Badge variant={
                        alteracao.status === 'aprovada' ? 'default' :
                        alteracao.status === 'pendente' ? 'secondary' : 'destructive'
                      }>
                        {alteracao.status === 'aprovada' ? 'Aprovada' :
                         alteracao.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVisualizarAlteracao(alteracao)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {alteracao.status === 'pendente' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRejeitarAlteracao(alteracao)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAprovarAlteracao(alteracao)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <SugestaoEscopoModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedAlteracao(null);
          }}
          onConfirm={handleConfirmAction}
          title={confirmationType === 'aprovar' ? 'Aprovar Alteração' : 'Rejeitar Alteração'}
          description={
            confirmationType === 'aprovar' 
              ? `Tem certeza que deseja aprovar "${selectedAlteracao?.titulo}"? Esta alteração será implementada.`
              : `Tem certeza que deseja rejeitar "${selectedAlteracao?.titulo}"? Esta ação não pode ser desfeita.`
          }
          confirmText={confirmationType === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
          type={confirmationType === 'aprovar' ? 'success' : 'danger'}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
};

export default AlteracoesEscopo;
