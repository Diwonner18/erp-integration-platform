import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Users, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';

const EquipeAtiva = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });
  const [showAlocacaoModal, setShowAlocacaoModal] = useState(false);
  const [alocacaoData, setAlocacaoData] = useState({
    funcionario: '',
    obra: '',
    data: '',
    funcao: ''
  });

  const funcionarios = [
    {
      id: 1,
      obraId: '1',
      nome: 'João Silva',
      funcao: 'Eletricista Senior',
      obraVinculada: 'Instalação Comercial - Loja XYZ',
      dataEntrada: '2024-01-15',
      status: 'ativo',
      horasSemana: 40
    },
    {
      id: 2,
      obraId: '2',
      nome: 'Maria Santos',
      funcao: 'Técnica Elétrica',
      obraVinculada: 'Reforma Residencial - Pedro Costa',
      dataEntrada: '2024-01-20',
      status: 'ativo',
      horasSemana: 44
    },
    {
      id: 3,
      obraId: '3',
      nome: 'Carlos Pereira',
      funcao: 'Supervisor de Obras',
      obraVinculada: 'Instalação Industrial - Fábrica Beta',
      dataEntrada: '2024-01-10',
      status: 'ativo',
      horasSemana: 45
    },
    {
      id: 4,
      obraId: '3',
      nome: 'Ana Costa',
      funcao: 'Eletricista',
      obraVinculada: 'Instalação Industrial - Fábrica Beta',
      dataEntrada: '2024-01-25',
      status: 'ativo',
      horasSemana: 40
    },
    {
      id: 5,
      obraId: '3',
      nome: 'Roberto Lima',
      funcao: 'Auxiliar Técnico',
      obraVinculada: 'Instalação Industrial - Fábrica Beta',
      dataEntrada: '2024-02-01',
      status: 'inativo',
      horasSemana: 0
    }
  ];

  const obras = [
    { id: '1', nome: 'Instalação Comercial - Loja XYZ' },
    { id: '2', nome: 'Reforma Residencial - Pedro Costa' },
    { id: '3', nome: 'Instalação Industrial - Fábrica Beta' }
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ];

  const [alocacoesDiarias, setAlocacoesDiarias] = useState([
    {
      id: 1,
      funcionario: 'João Silva',
      obra: 'Instalação Comercial - Loja XYZ',
      data: '2024-01-15',
      funcao: 'Eletricista Senior'
    },
    {
      id: 2,
      funcionario: 'Maria Santos',
      obra: 'Reforma Residencial - Pedro Costa',
      data: '2024-01-15',
      funcao: 'Técnica Elétrica'
    }
  ]);

  const getStatusBadge = (status: string) => {
    return status === 'ativo' ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  const getHorasColor = (horas: number) => {
    if (horas > 44) return 'text-red-600 font-semibold';
    if (horas > 40) return 'text-orange-600';
    return 'text-slate-900';
  };

  const filteredFuncionarios = useMemo(() => {
    let result = funcionarios;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(funcionario => funcionario.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(funcionario => {
        const funcionarioDate = new Date(funcionario.dataEntrada);
        return funcionarioDate >= filters.dataInicial! && funcionarioDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(funcionario => funcionario.status === filters.status);
    }

    // Aplicar busca textual
    if (searchTerm) {
      result = result.filter(funcionario => 
        funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funcionario.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funcionario.obraVinculada.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [funcionarios, filters, searchTerm]);

  const obrasAlocacao = [
    'Instalação Comercial - Loja XYZ',
    'Reforma Residencial - Pedro Costa',
    'Instalação Industrial - Fábrica Beta',
    'Instalação Residencial - Casa Silva',
    'Reforma Comercial - Escritório ABC'
  ];

  const funcoes = [
    'Eletricista Senior',
    'Técnica Elétrica',
    'Supervisor de Obras',
    'Eletricista',
    'Auxiliar Técnico'
  ];

  const funcionariosList = funcionarios.map(f => f.nome);

  const handleAlocacaoDiaria = () => {
    setAlocacaoData({ funcionario: '', obra: '', data: '', funcao: '' });
    setShowAlocacaoModal(true);
  };

  const handleSaveAlocacao = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!alocacaoData.funcionario || !alocacaoData.obra || !alocacaoData.data || !alocacaoData.funcao) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    const novaAlocacao = {
      id: Date.now(),
      funcionario: alocacaoData.funcionario,
      obra: alocacaoData.obra,
      data: alocacaoData.data,
      funcao: alocacaoData.funcao
    };

    setAlocacoesDiarias(prev => [...prev, novaAlocacao]);
    toast({
      title: "Alocação registrada",
      description: "Funcionário alocado com sucesso para a obra.",
    });
    setShowAlocacaoModal(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Equipe Ativa</h1>
            <p className="text-slate-600 mt-1">Funcionários envolvidos nas obras atuais</p>
          </div>
          <Button onClick={handleAlocacaoDiaria}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Alocação
          </Button>
        </div>

        <AdvancedFilters
          onFiltersChange={setFilters}
          obras={obras}
          statusOptions={statusOptions}
        />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar por nome, função ou obra..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-600">
            Exibindo {filteredFuncionarios.length} de {funcionarios.length} funcionários
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Funcionários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Obra Vinculada</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Horas/Semana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFuncionarios.map((funcionario, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{funcionario.nome}</TableCell>
                    <TableCell>{funcionario.funcao}</TableCell>
                    <TableCell>{funcionario.obraVinculada}</TableCell>
                    <TableCell>{funcionario.dataEntrada}</TableCell>
                    <TableCell>{getStatusBadge(funcionario.status)}</TableCell>
                    <TableCell className={getHorasColor(funcionario.horasSemana)}>
                      {funcionario.horasSemana}h
                      {funcionario.horasSemana > 44 && (
                        <span className="text-xs block text-red-600">Sobrecarga</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alocações Diárias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Alocações Diárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Função</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alocacoesDiarias.map((alocacao) => (
                  <TableRow key={alocacao.id}>
                    <TableCell className="font-medium">{alocacao.funcionario}</TableCell>
                    <TableCell>{alocacao.obra}</TableCell>
                    <TableCell>{new Date(alocacao.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{alocacao.funcao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Nova Alocação */}
        <Dialog open={showAlocacaoModal} onOpenChange={setShowAlocacaoModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Alocação Diária</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveAlocacao} className="space-y-4">
              <div>
                <Label className="text-slate-700">
                  Funcionário *
                </Label>
                <Select 
                  value={alocacaoData.funcionario} 
                  onValueChange={(value) => setAlocacaoData({...alocacaoData, funcionario: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionariosList.map((funcionario) => (
                      <SelectItem key={funcionario} value={funcionario}>
                        {funcionario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700">
                  Obra *
                </Label>
                <Select 
                  value={alocacaoData.obra} 
                  onValueChange={(value) => setAlocacaoData({...alocacaoData, obra: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {obrasAlocacao.map((obra) => (
                      <SelectItem key={obra} value={obra}>
                        {obra}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700">
                  Data *
                </Label>
                <Input
                  type="date"
                  value={alocacaoData.data}
                  onChange={(e) => setAlocacaoData({...alocacaoData, data: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label className="text-slate-700">
                  Função *
                </Label>
                <Select 
                  value={alocacaoData.funcao} 
                  onValueChange={(value) => setAlocacaoData({...alocacaoData, funcao: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcoes.map((funcao) => (
                      <SelectItem key={funcao} value={funcao}>
                        {funcao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAlocacaoModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Alocar Funcionário
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default EquipeAtiva;
