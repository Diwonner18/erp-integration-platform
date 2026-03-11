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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, FileText, Filter } from 'lucide-react';
import { useEPIs, useObras, useCreateEPI } from '@/hooks/useSupabaseData';

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
    quantidade: '1',
    certificadoAprovacao: '',
    validade: '',
  });

  const { data: epis = [], isLoading: loadingEPIs } = useEPIs();
  const { data: obrasData = [], isLoading: loadingObras } = useObras();
  const createEPI = useCreateEPI();

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

  const handleNovoRegistro = () => {
    setFormData({
      tipoEPI: '',
      colaborador: '',
      obra: '',
      dataEntrega: '',
      quantidade: '1',
      certificadoAprovacao: '',
      validade: '',
    });
    setShowRegistroModal(true);
  };

  const handleSaveRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipoEPI || !formData.colaborador || !formData.obra || !formData.dataEntrega) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEPI.mutateAsync({
        tipo: formData.tipoEPI,
        funcionario: formData.colaborador,
        obra_id: formData.obra,
        data_entrega: formData.dataEntrega,
        quantidade: parseInt(formData.quantidade) || 1,
        certificado_aprovacao: formData.certificadoAprovacao || null,
        validade: formData.validade || null,
      });
      toast({
        title: "EPI registrado",
        description: "Registro de EPI criado com sucesso.",
      });
      setShowRegistroModal(false);
    } catch (error: any) {
      toast({
        title: "Erro ao registrar EPI",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredRegistros = epis.filter(registro => {
    const matchesSearch = !searchTerm || 
      registro.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.funcionario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (registro as any).obras?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObra = !filtroObra || filtroObra === 'all' || registro.obra_id === filtroObra;
    return matchesSearch && matchesObra;
  });

  const getRelatorioEstatisticas = () => {
    const total = epis.length;
    return { total };
  };

  const estatisticas = getRelatorioEstatisticas();

  if (loadingEPIs || loadingObras) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de EPIs</h1>
            <p className="text-muted-foreground mt-1">Registro e acompanhamento de Equipamentos de Proteção Individual</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        {obrasData.map((obra) => (
                          <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm text-muted-foreground">
                      {filteredRegistros.length} registros encontrados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Validade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistros.map((registro) => (
                      <TableRow key={registro.id}>
                        <TableCell className="font-medium">{registro.tipo}</TableCell>
                        <TableCell>{registro.funcionario || '—'}</TableCell>
                        <TableCell>{(registro as any).obras?.nome || '—'}</TableCell>
                        <TableCell>{registro.data_entrega ? new Date(registro.data_entrega).toLocaleDateString('pt-BR') : '—'}</TableCell>
                        <TableCell>{registro.quantidade}</TableCell>
                        <TableCell>{registro.validade ? new Date(registro.validade).toLocaleDateString('pt-BR') : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{estatisticas.total}</div>
                    <div className="text-sm text-muted-foreground">Total de EPIs Registrados</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{obrasData.length}</div>
                    <div className="text-sm text-muted-foreground">Obras com EPIs</div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obrasData.map((obra) => {
                      const registrosObra = epis.filter(r => r.obra_id === obra.id);
                      return (
                        <TableRow key={obra.id}>
                          <TableCell className="font-medium">{obra.nome}</TableCell>
                          <TableCell>{registrosObra.length}</TableCell>
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
                  <Label>Tipo de EPI *</Label>
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
                  <Label>Colaborador *</Label>
                  <Input
                    value={formData.colaborador}
                    onChange={(e) => setFormData({...formData, colaborador: e.target.value})}
                    placeholder="Nome do colaborador"
                  />
                </div>

                <div>
                  <Label>Obra *</Label>
                  <Select 
                    value={formData.obra} 
                    onValueChange={(value) => setFormData({...formData, obra: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {obrasData.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data de Entrega *</Label>
                  <Input
                    type="date"
                    value={formData.dataEntrega}
                    onChange={(e) => setFormData({...formData, dataEntrega: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                    min="1"
                  />
                </div>

                <div>
                  <Label>Validade</Label>
                  <Input
                    type="date"
                    value={formData.validade}
                    onChange={(e) => setFormData({...formData, validade: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Certificado de Aprovação (CA)</Label>
                  <Input
                    value={formData.certificadoAprovacao}
                    onChange={(e) => setFormData({...formData, certificadoAprovacao: e.target.value})}
                    placeholder="Número do CA"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowRegistroModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEPI.isPending}>
                  {createEPI.isPending ? 'Salvando...' : 'Registrar EPI'}
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
