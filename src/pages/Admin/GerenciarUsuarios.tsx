import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Search, Edit, Filter } from 'lucide-react';
import GerenciarUsuarioModal from '@/components/Admin/GerenciarUsuarioModal';
import { useProfiles, useUserRoles } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const GerenciarUsuarios = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { data: profiles = [], isLoading: loadingP } = useProfiles();
  const { data: roles = [], isLoading: loadingR } = useUserRoles();

  const usuarios = profiles.map(p => {
    const role = roles.find(r => r.user_id === p.id);
    return { ...p, type: role?.role || 'sem_role', status: 'Ativo' };
  });

  const filteredUsers = useMemo(() => {
    return usuarios.filter(u => {
      const matchSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = selectedFilter === 'all' || u.type === selectedFilter;
      return matchSearch && matchFilter;
    });
  }, [usuarios, searchTerm, selectedFilter]);

  const roleLabels: Record<string, string> = { admin: 'Administrador', gerenciador_tecnico: 'Gerenciador Técnico', obras: 'Obras', financeira: 'Financeiro', comercial: 'Comercial', cliente: 'Cliente', sem_role: 'Sem Role' };
  const isLoading = loadingP || loadingR;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold font-title text-foreground">Gerenciar Usuários</h1><p className="text-muted-foreground mt-1">Controle total sobre usuários</p></div>
          <Button onClick={() => { setModalMode('create'); setSelectedUser(null); setShowModal(true); }}><UserPlus className="w-4 h-4 mr-2" />Novo Usuário</Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Buscar..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="px-3 py-2 border border-border rounded-md text-sm">
            <option value="all">Todos</option><option value="admin">Admin</option><option value="obras">Obras</option><option value="financeira">Financeiro</option><option value="comercial">Comercial</option><option value="cliente">Cliente</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">{filteredUsers.length} de {usuarios.length} usuários</div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhum usuário encontrado</p></div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}><CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="font-semibold text-foreground">{user.full_name}</h3><p className="text-sm text-muted-foreground">{user.email}</p></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{roleLabels[user.type] || user.type}</Badge>
                    <Button variant="outline" size="sm" onClick={() => { setModalMode('edit'); setSelectedUser(user); setShowModal(true); }}><Edit className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        <GerenciarUsuarioModal isOpen={showModal} onClose={() => setShowModal(false)} user={selectedUser} mode={modalMode} />
      </div>
    </MainLayout>
  );
};

export default GerenciarUsuarios;
