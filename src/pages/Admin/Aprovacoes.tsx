import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, Eye, Pencil, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAprovacoes, useUpdateAprovacao, useInsertAcessoCompartilhado } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const nivelLabels: Record<string, { label: string; desc: string; icon: React.ReactNode }> = {
  view: { label: 'Visualizar', desc: 'Apenas leitura dos dados', icon: <Eye className="w-4 h-4" /> },
  edit: { label: 'Editar', desc: 'Leitura + edição dos dados', icon: <Pencil className="w-4 h-4" /> },
  all: { label: 'Completo', desc: 'Leitura + edição + exclusão', icon: <Shield className="w-4 h-4" /> },
};

const Aprovacoes = () => {
  const { toast } = useToast();
  const { data: aprovacoes = [], isLoading } = useAprovacoes();
  const updateAprovacao = useUpdateAprovacao();
  const insertAcesso = useInsertAcessoCompartilhado();

  const [accessDialog, setAccessDialog] = useState<any>(null);

  const pendentes = aprovacoes.filter(a => a.status === 'pendente');

  const handleApprove = async (item: any) => {
    if (item.tipo === 'acesso_registro') {
      setAccessDialog(item);
      return;
    }
    try {
      await updateAprovacao.mutateAsync({ id: item.id, status: 'aprovada' as any, data_resposta: new Date().toISOString() });
      toast({ title: 'Item aprovado' });
    } catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  const handleGrantAccess = async (nivel: 'view' | 'edit' | 'all') => {
    if (!accessDialog) return;
    try {
      await insertAcesso.mutateAsync({
        user_id: accessDialog.solicitante_id,
        tabela: accessDialog.referencia_tabela,
        registro_id: accessDialog.referencia_id,
        nivel_acesso: nivel,
        aprovacao_id: accessDialog.id,
      });
      await updateAprovacao.mutateAsync({
        id: accessDialog.id,
        status: 'aprovada' as any,
        data_resposta: new Date().toISOString(),
        comentario: `Acesso concedido: ${nivelLabels[nivel].label}`,
      });
      toast({ title: `Acesso "${nivelLabels[nivel].label}" concedido` });
      setAccessDialog(null);
    } catch {
      toast({ title: 'Erro ao conceder acesso', variant: 'destructive' });
    }
  };

  const handleReject = async (item: any) => {
    try {
      await updateAprovacao.mutateAsync({ id: item.id, status: 'rejeitada' as any, data_resposta: new Date().toISOString() });
      toast({ title: 'Item rejeitado', variant: 'destructive' });
    } catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header"><h1 className="text-3xl font-bold font-title text-foreground">Aprovações Pendentes</h1><p className="text-muted-foreground mt-1">Itens aguardando aprovação</p></div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : pendentes.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <CheckSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma aprovação pendente</h3>
            <p className="text-muted-foreground">Todas as solicitações foram processadas</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4" data-tour="page-list">
            {pendentes.map((item) => (
              <Card key={item.id}><CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.tipo}</h3>
                      {item.tipo === 'acesso_registro' && (
                        <Badge variant="outline" className="text-xs">Solicitação de Acesso</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.tipo === 'acesso_registro'
                        ? `Tabela: ${item.referencia_tabela || '-'} | Registro: ${item.referencia_id?.slice(0, 8)}...`
                        : `Ref: ${item.referencia_tabela || '-'}`}
                    </p>
                    {item.comentario && (
                      <p className="text-sm text-muted-foreground mt-1 italic">"{item.comentario}"</p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground mt-2"><Clock className="w-3 h-3 mr-1" />{new Date(item.created_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleReject(item)}>Rejeitar</Button>
                    <Button size="sm" onClick={() => handleApprove(item)}>
                      {item.tipo === 'acesso_registro' ? 'Conceder Acesso' : 'Aprovar'}
                    </Button>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para escolher nível de acesso */}
      <Dialog open={!!accessDialog} onOpenChange={() => setAccessDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conceder Acesso</DialogTitle>
            <DialogDescription>
              Escolha o nível de acesso para o funcionário neste registro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {(['view', 'edit', 'all'] as const).map((nivel) => {
              const info = nivelLabels[nivel];
              return (
                <button
                  key={nivel}
                  onClick={() => handleGrantAccess(nivel)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{info.label}</p>
                    <p className="text-sm text-muted-foreground">{info.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Aprovacoes;
