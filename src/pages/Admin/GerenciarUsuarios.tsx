
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

  const [usuarios, setUsuarios] = useState([
    { id: 1, name: 'João Silva', email: 'joao@ctguedes.com', type: 'admin', status: 'ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@ctguedes.com', type: 'obras', status: 'ativo' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@ctguedes.com', type: 'financeira', status: 'ativo' },
    { id: 4, name: 'Ana Lima', email: 'ana@ctguedes.com', type: 'comercial', status: 'ativo' },
    { id: 5, name: 'Cliente ABC', email: 'contato@abc.com', type: 'cliente', status: 'ativo' }
  ]);

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

    // Simula chamada API em background
    setTimeout(() => {
      console.log('Exclusão sincronizada com backend');
    }, 100);
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
            <h1 className="text-3xl font-bold text-slate-900">Gerenciar Usuários</h1>
            <p className="text-slate-600 mt-1">Controle total sobre usuários do sistema</p>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar usuários..." 
              className="pl-10 transition-all duration-150 focus:ring-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-slate-600 mb-4">
          Exibindo {filteredUsers.length} de {usuarios.length} usuários
        </div>

        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="transition-all duration-150 hover:shadow-md hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-150">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{user.name}</h3>
                      <p className="text-sm text-slate-600">{user.email}</p>
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
