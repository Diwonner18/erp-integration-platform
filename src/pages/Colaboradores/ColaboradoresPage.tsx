import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { useColaboradores, useCreateColaborador, useDeleteColaborador } from '@/hooks/useColaboradoresData';
import ColaboradorDetailModal from './ColaboradorDetailModal';
import NovoColaboradorModal from './NovoColaboradorModal';
import { toast } from 'sonner';
import { useUserModulePermissions } from '@/hooks/usePermissoesPerfil';
import { useAuth } from '@/contexts/AuthContext';

const ColaboradoresPage = () => {
  const { effectiveType } = useAuth();
  const canSeeSensitive = ['admin', 'gerenciador_tecnico', 'financeira'].includes(effectiveType || '');
  const perms = useUserModulePermissions('colaboradores');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const { data: colaboradores, isLoading } = useColaboradores();
  const deleteColaborador = useDeleteColaborador();

  const filtered = (colaboradores || []).filter(c => {
    const matchSearch = !search || 
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.cpf && c.cpf.includes(search));
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      ativo: { label: 'Ativo', variant: 'default' },
      afastado: { label: 'Afastado', variant: 'secondary' },
      desligado: { label: 'Desligado', variant: 'destructive' },
    };
    const s = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return;
    try {
      await deleteColaborador.mutateAsync(id);
      toast.success('Colaborador excluído');
    } catch {
      toast.error('Erro ao excluir colaborador');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
            <p className="text-muted-foreground">Cadastro e gestão de colaboradores</p>
          </div>
          {perms.incluir_editar && (
            <Button onClick={() => setShowNew(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="afastado">Afastados</SelectItem>
              <SelectItem value="desligado">Desligados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum colaborador encontrado</TableCell></TableRow>
              ) : (
                filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.cpf || '—'}</TableCell>
                    <TableCell>{c.cargo || '—'}</TableCell>
                    <TableCell>{c.funcao || '—'}</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedId(c.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {perms.excluir && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedId && (
        <ColaboradorDetailModal
          colaboradorId={selectedId}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {showNew && (
        <NovoColaboradorModal
          open={showNew}
          onClose={() => setShowNew(false)}
        />
      )}
    </MainLayout>
  );
};

export default ColaboradoresPage;
