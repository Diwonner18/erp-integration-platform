import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, FileText, Search, Filter } from 'lucide-react';

const EPIs = () => {
  const { toast } = useToast();
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroObra, setFiltroObra] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [formData, setFormData] = useState({
    tipoEPI: '',
    colaborador: '',
    obra: '',
    dataEntrega: '',
    responsavel: '',
    status: 'entregue',
    observacoes: ''
  });

  const [registrosEPI, setRegistrosEPI] = useState([
    {
      id: 1,
      tipoEPI: 'Capacete de Segurança',
      colaborador: 'João Silva',
      obra: 'Instalação Comercial - Loja XYZ',
      dataEntrega: '2024-01-15',
      responsavel: 'Carlos Supervisor',
      status: 'entregue',
      observacoes: 'Capacete novo, cor branca'
    },
    {
      id: 2,
      tipoEPI: 'Luvas de Proteção',
      colaborador: 'Maria Santos',
      obra: 'Reforma Residencial - Pedro Costa',
      dataEntrega: '2024-01-14',
      responsavel: 'Ana Coordenadora',
      status: 'devolvido',
      observacoes: 'Devolvido após conclusão da tarefa'
    },
    {
      id: 3,
      tipoEPI: 'Óculos de Proteção',
      colaborador: 'Carlos Pereira',
      obra: 'Instalação Industrial - Fábrica Beta',
      dataEntrega: '2024-01-12',
      responsavel: 'Roberto Líder',
      status: 'perdido',
      observacoes: 'Relatado perda durante atividade externa'
    }
  ]);

  const tiposEPI = [
    'Capacete de Segurança',
    'Luvas de Proteção',
    'Óculos de Proteção',
    'Botas de Segurança',
    'Máscara/Respirador',
    'Cinto de Segurança',
    'Colete Refletivo',
    'Protetor Auricular'
  ];

  const obras = [
    'Instalação Comercial - Loja XYZ',
    'Reforma Residencial - Pedro Costa',
    'Instalação Industrial - Fábrica Beta',
    'Instalação Residencial - Casa Silva',
    'Reforma Comercial - Escritório ABC'
  ];

  const colaboradores = [
    'João Silva',
    'Maria Santos',
    'Carlos Pereira',
    'Ana Costa',
    'Roberto Lima',
    'Pedro Oliveira'
  ];

  const responsaveis = [
    'Carlos Supervisor',
    'Ana Coordenadora',
    'Roberto Líder',
    'Fernando Gerente'
  ];

  const handleNovoRegistro = () => {
    setFormData({
      tipoEPI: '',
      colaborador: '',
      obra: '',
      dataEntrega: '',
      responsavel: '',
      status: 'entregue',
      observacoes: ''
    });
    setShowRegistroModal(true);
  };

  const handleSaveRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipoEPI || !formData.colaborador || !formData.obra || 
        !formData.dataEntrega || !formData.responsavel) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    const novoRegistro = {
      id: Date.now(),
      ...formData
    };

    setRegistrosEPI(prev => [...prev, novoRegistro]);
    toast({
      title: "EPI registrado",
      description: "Registro de EPI criado com sucesso.",
    });
    setShowRegistroModal(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      entregue: { variant: 'default', label: 'Entregue' },
      devolvido: { variant: 'secondary', label: 'Devolvido' },
      perdido: { variant: 'destructive', label: 'Perdido' }
    };
    
    const config = variants[status] || variants.entregue;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredRegistros = registrosEPI.filter(registro => {
    const matchesSearch = !searchTerm || 
      registro.tipoEPI.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.colaborador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.obra.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObra = !filtroObra || filtroObra === 'all' || registro.obra === filtroObra;
    const matchesStatus = !filtroStatus || filtroStatus === 'all' || registro.status === filtroStatus;
    
    return matchesSearch && matchesObra && matchesStatus;
  });

  const getRelatorioEstatisticas = () => {
    const total = registrosEPI.length;
    const entregues = registrosEPI.filter(r => r.status === 'entregue').length;
    const devolvidos = registrosEPI.filter(r => r.status === 'devolvido').length;
    const perdidos = registrosEPI.filter(r => r.status === 'perdido').length;
    
    return { total, entregues, devolvidos, perdidos };
  };

  const estatisticas = getRelatorioEstatisticas();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Controle de EPIs</h1>
            <p className="text-slate-600 mt-1">Registro e acompanhamento de Equipamentos de Proteção Individual</p>
          </div>
          <Button onClick={handleNovoRegistro}>
            <Plus className="w-4 h-4 mr-2" />
            Registrar EPI
          </Button>
        </div>

        <Tabs defaultValue="registros" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registros">Registros</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="space-y-4">
            {/* Filtros */}
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
                    <Label htmlFor="busca">Busca Geral</Label>
                    <Input 
                      placeholder="EPI, colaborador ou obra"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="obra">Obra</Label>
                    <Select value={filtroObra} onValueChange={setFiltroObra}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as obras" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as obras</SelectItem>
                        {obras.map((obra) => (
                          <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="devolvido">Devolvido</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm text-slate-600">
                      {filteredRegistros.length} registros encontrados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Registros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Registros de EPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de EPI</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Obra</TableHead>
                      <TableHead>Data Entrega</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistros.map((registro) => (
                      <TableRow key={registro.id}>
                        <TableCell className="font-medium">{registro.tipoEPI}</TableCell>
                        <TableCell>{registro.colaborador}</TableCell>
                        <TableCell>{registro.obra}</TableCell>
                        <TableCell>{new Date(registro.dataEntrega).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{registro.responsavel}</TableCell>
                        <TableCell>{getStatusBadge(registro.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{estatisticas.total}</div>
                    <div className="text-sm text-slate-600">Total de EPIs</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{estatisticas.entregues}</div>
                    <div className="text-sm text-slate-600">EPIs Entregues</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{estatisticas.devolvidos}</div>
                    <div className="text-sm text-slate-600">EPIs Devolvidos</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{estatisticas.perdidos}</div>
                    <div className="text-sm text-slate-600">EPIs Perdidos</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Relatório Detalhado por Obra */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Relatório por Obra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Obra</TableHead>
                      <TableHead>Total EPIs</TableHead>
                      <TableHead>Entregues</TableHead>
                      <TableHead>Devolvidos</TableHead>
                      <TableHead>Perdidos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obras.map((obra) => {
                      const registrosObra = registrosEPI.filter(r => r.obra === obra);
                      const total = registrosObra.length;
                      const entregues = registrosObra.filter(r => r.status === 'entregue').length;
                      const devolvidos = registrosObra.filter(r => r.status === 'devolvido').length;
                      const perdidos = registrosObra.filter(r => r.status === 'perdido').length;
                      
                      return (
                        <TableRow key={obra}>
                          <TableCell className="font-medium">{obra}</TableCell>
                          <TableCell>{total}</TableCell>
                          <TableCell className="text-green-600">{entregues}</TableCell>
                          <TableCell className="text-blue-600">{devolvidos}</TableCell>
                          <TableCell className="text-red-600">{perdidos}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Registro */}
        <Dialog open={showRegistroModal} onOpenChange={setShowRegistroModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar EPI</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveRegistro} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">
                    Tipo de EPI *
                  </Label>
                  <Select 
                    value={formData.tipoEPI} 
                    onValueChange={(value) => setFormData({...formData, tipoEPI: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de EPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEPI.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-700">
                    Colaborador *
                  </Label>
                  <Select 
                    value={formData.colaborador} 
                    onValueChange={(value) => setFormData({...formData, colaborador: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map((colaborador) => (
                        <SelectItem key={colaborador} value={colaborador}>{colaborador}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-700">
                    Obra *
                  </Label>
                  <Select 
                    value={formData.obra} 
                    onValueChange={(value) => setFormData({...formData, obra: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {obras.map((obra) => (
                        <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-700">
                    Data de Entrega *
                  </Label>
                  <Input
                    type="date"
                    value={formData.dataEntrega}
                    onChange={(e) => setFormData({...formData, dataEntrega: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label className="text-slate-700">
                    Responsável pela Entrega *
                  </Label>
                  <Select 
                    value={formData.responsavel} 
                    onValueChange={(value) => setFormData({...formData, responsavel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((responsavel) => (
                        <SelectItem key={responsavel} value={responsavel}>{responsavel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-700">
                    Status *
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entregue">Entregue</SelectItem>
                      <SelectItem value="devolvido">Devolvido</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-700">
                  Observações
                </Label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações sobre o EPI..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowRegistroModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar EPI
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default EPIs;