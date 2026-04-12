import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Settings, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '@/components/ui/confirmation-modal';

interface LookupItem {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

const useLookupCRUD = (tableName: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data = [], isLoading } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('nome');
      if (error) throw error;
      return (data as unknown) as LookupItem[];
    },
  });

  const create = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from(tableName as any).insert({ nome } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({ title: 'Item adicionado' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from(tableName as any).update({ ativo } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({ title: 'Status atualizado' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tableName as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({ title: 'Item removido' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  return { data, isLoading, create, toggleAtivo, remove };
};

const LookupTable = ({ title, tableName }: { title: string; tableName: string }) => {
  const [newItem, setNewItem] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LookupItem | null>(null);
  const { data, isLoading, create, toggleAtivo, remove } = useLookupCRUD(tableName);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    create.mutate(newItem.trim());
    setNewItem('');
    setShowAddDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">Nenhum item cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.ativo ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleAtivo.mutate({ id: item.id, ativo: !item.ativo })}
                    >
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar {title}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome do item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
                <Button onClick={handleAdd} disabled={create.isPending}>
                  {create.isPending ? 'Salvando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmationModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { if (deleteTarget) { remove.mutate(deleteTarget.id); setDeleteTarget(null); } }}
          title="Excluir Item"
          description={`Deseja excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          type="danger"
          loading={remove.isPending}
        />
      </CardContent>
    </Card>
  );
};

const TabelasApoio = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8" /> Tabelas de Apoio
          </h1>
          <p className="text-muted-foreground mt-1">Gerenciar listas auxiliares do sistema</p>
        </div>

        <Tabs defaultValue="epis">
          <TabsList>
            <TabsTrigger value="epis"><Shield className="w-4 h-4 mr-1" />Tipos de EPI</TabsTrigger>
            <TabsTrigger value="cat_he"><Clock className="w-4 h-4 mr-1" />Categorias HE</TabsTrigger>
            <TabsTrigger value="tipo_he"><Clock className="w-4 h-4 mr-1" />Tipos HE</TabsTrigger>
          </TabsList>

          <TabsContent value="epis" className="mt-4">
            <LookupTable title="Tipo de EPI" tableName="tipos_epi" />
          </TabsContent>
          <TabsContent value="cat_he" className="mt-4">
            <LookupTable title="Categoria de Hora Extra" tableName="categorias_hora_extra" />
          </TabsContent>
          <TabsContent value="tipo_he" className="mt-4">
            <LookupTable title="Tipo de Hora Extra" tableName="tipos_hora_extra" />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TabelasApoio;
