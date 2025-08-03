
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Users, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EquipeAtiva = () => {
  const { toast } = useToast();
  const [filtroObra, setFiltroObra] = useState('');
  const [filtroFuncao, setFiltroFuncao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlocacaoModal, setShowAlocacaoModal] = useState(false);
  const [alocacaoData, setAlocacaoData] = useState({
    funcionario: '',
    obra: '',
    data: '',
    funcao: ''
  });

  const funcionarios = [
    {
      nome: 'João Silva',
      funcao: 'Eletricista Senior',
      obraVinculada: 'Instalação Comercial - Loja XYZ',
      dataEntrada: '2024-01-15',
      status: 'ativo',
      horasSemana: 40
    },
    {
      nome: 'Maria Santos',
      funcao: 'Técnica Elétrica',
      obraVinculada: 'Reforma Residencial - Pedro Costa',
      dataEntrada: '2024-01-20',
      status: 'ativo',
      horasSemana: 44
    },
    {
      nome: 'Carlos Pereira',
      funcao: 'Supervisor de Obras',
      obraVinculada: 'Instalação Industrial - Fábrica Beta',
      dataEntrada: '2024-01-10',
      status: 'ativo',
      horasSemana: 45
    },
    {
      nome: 'Ana Costa',
      funcao: 'Eletricista',
      obraVinculada: 'Instalação Industrial - Fábrica Beta',
      dataEntrada: '2024-01-25',
      status: 'ativo',
      horasSemana: 40
    },
    {
      nome: 'Roberto Lima',
      funcao: 'Auxiliar Técnico',
      obraVinculada: 'Instalação Industrial - Fábrica Beta',
      dataEntrada: '2024-02-01',
      status: 'inativo',
      horasSemana: 0
    }
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

  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesNome = !filtroNome || funcionario.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const matchesObra = !filtroObra || funcionario.obraVinculada.toLowerCase().includes(filtroObra.toLowerCase());
    const matchesFuncao = !filtroFuncao || funcionario.funcao.toLowerCase().includes(filtroFuncao.toLowerCase());
    const matchesStatus = !filtroStatus || funcionario.status === filtroStatus;
    const matchesSearch = !searchTerm || 
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.obraVinculada.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesNome && matchesObra && matchesFuncao && matchesStatus && matchesSearch;
  });

  const obras = [
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  placeholder="Nome do funcionário"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="obra">Obra</Label>
                <Select value={filtroObra} onValueChange={setFiltroObra}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar obra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comercial">Instalação Comercial</SelectItem>
                    <SelectItem value="residencial">Reforma Residencial</SelectItem>
                    <SelectItem value="industrial">Instalação Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="funcao">Função</Label>
                <Select value={filtroFuncao} onValueChange={setFiltroFuncao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eletricista">Eletricista</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="auxiliar">Auxiliar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="busca">Busca Geral</Label>
                <Input 
                  placeholder="Nome, função ou obra"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-slate-600">
                  Exibindo {filteredFuncionarios.length} de {funcionarios.length} funcionários
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    {obras.map((obra) => (
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
