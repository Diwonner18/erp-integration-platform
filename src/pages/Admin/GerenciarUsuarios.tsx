import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Search, Edit, Trash2, Filter } from 'lucide-react';
import GerenciarUsuarioModal from '@/components/Admin/GerenciarUsuarioModal';
import { useToast } from '@/hooks/use-toast';

const GerenciarUsuarios = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Filtros em tempo real
  const filteredUsers = useMemo(() => {
    return usuarios.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || user.type === selectedFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [usuarios, searchTerm, selectedFilter]);

  const handleNewUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: any) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (user: any) => {
    // Update otimista
    setUsuarios(prev => prev.filter(u => u.id !== user.id));
    
    toast({
      title: 'Usuário excluído',
      description: `${user.name} foi removido do sistema`,
    });

  };

  const userTypeLabels = {
    admin: 'Administrador',
    obras: 'Obras',
    financeira: 'Financeiro',
    comercial: 'Comercial',
    cliente: 'Cliente'
  };

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'admin', label: 'Administrador' },
    { value: 'obras', label: 'Obras' },
    { value: 'financeira', label: 'Financeiro' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'cliente', label: 'Cliente' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-title text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground mt-1">Controle total sobre usuários do sistema</p>
          </div>
          <Button 
            onClick={handleNewUser} 
            className="flex items-center transition-all duration-150 hover:scale-105"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar usuários..." 
              className="pl-10 transition-all duration-150 focus:ring-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Exibindo {filteredUsers.length} de {usuarios.length} usuários
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum usuário encontrado</p>
            <p className="text-sm">Use o botão acima para criar o primeiro usuário</p>
          </div>
        ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="transition-all duration-150 hover:shadow-md hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-150">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="transition-colors duration-150">
                      {userTypeLabels[user.type as keyof typeof userTypeLabels]}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-600 transition-colors duration-150">
                      {user.status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="transition-all duration-150 hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 transition-all duration-150 hover:scale-105"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        <GerenciarUsuarioModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          user={selectedUser}
          mode={modalMode}
        />
      </div>
    </MainLayout>
  );
};

export default GerenciarUsuarios;
