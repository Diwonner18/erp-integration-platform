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
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useObras, useProfiles } from '@/hooks/useSupabaseData';

const EquipeAtiva = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlocacaoModal, setShowAlocacaoModal] = useState(false);
  const [alocacaoData, setAlocacaoData] = useState({
    funcionario: '',
    obra: '',
    data: '',
    funcao: ''
  });

  const { data: obrasData = [], isLoading: loadingObras } = useObras();
  const { data: profiles = [], isLoading: loadingProfiles } = useProfiles();

  const [alocacoesDiarias, setAlocacoesDiarias] = useState<any[]>([]);

  const obrasOptions = obrasData.map(o => ({ id: o.id, nome: o.nome }));

  const filteredProfiles = useMemo(() => {
    if (!searchTerm) return profiles;
    return profiles.filter(p => 
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [profiles, searchTerm]);

  const funcoes = ['Encarregado', 'Pedreiro', 'Servente', 'Eletricista', 'Pintor', 'Mestre de Obras'];

  const handleAlocacaoDiaria = () => {
    setAlocacaoData({ funcionario: '', obra: '', data: '', funcao: '' });
    setShowAlocacaoModal(true);
  };

  const handleSaveAlocacao = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alocacaoData.funcionario || !alocacaoData.obra || !alocacaoData.data || !alocacaoData.funcao) {
      toast({ title: "Erro de validação", description: "Todos os campos devem ser preenchidos.", variant: "destructive" });
      return;
    }

    const obraNome = obrasData.find(o => o.id === alocacaoData.obra)?.nome || '';
    const novaAlocacao = {
      id: Date.now(),
      funcionario: alocacaoData.funcionario,
      obra: obraNome,
      data: alocacaoData.data,
      funcao: alocacaoData.funcao
    };

    setAlocacoesDiarias(prev => [...prev, novaAlocacao]);
    toast({ title: "Alocação registrada", description: "Funcionário alocado com sucesso para a obra." });
    setShowAlocacaoModal(false);
  };

  if (loadingObras || loadingProfiles) {
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
            <h1 className="text-3xl font-bold text-foreground">Equipe Ativa</h1>
            <p className="text-muted-foreground mt-1">Funcionários envolvidos nas obras atuais</p>
          </div>
          <Button onClick={handleAlocacaoDiaria}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Alocação
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar por nome ou email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredProfiles.length} de {profiles.length} membros
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Membros da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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

        <Dialog open={showAlocacaoModal} onOpenChange={setShowAlocacaoModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Alocação Diária</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveAlocacao} className="space-y-4">
              <div>
                <Label>Funcionário *</Label>
                <Select value={alocacaoData.funcionario} onValueChange={(value) => setAlocacaoData({...alocacaoData, funcionario: value})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o funcionário" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.full_name}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Obra *</Label>
                <Select value={alocacaoData.obra} onValueChange={(value) => setAlocacaoData({...alocacaoData, obra: value})}>
                  <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                  <SelectContent>
                    {obrasOptions.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data *</Label>
                <Input type="date" value={alocacaoData.data} onChange={(e) => setAlocacaoData({...alocacaoData, data: e.target.value})} required />
              </div>
              <div>
                <Label>Função *</Label>
                <Select value={alocacaoData.funcao} onValueChange={(value) => setAlocacaoData({...alocacaoData, funcao: value})}>
                  <SelectTrigger><SelectValue placeholder="Selecione a função" /></SelectTrigger>
                  <SelectContent>
                    {funcoes.map((funcao) => (
                      <SelectItem key={funcao} value={funcao}>{funcao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAlocacaoModal(false)}>Cancelar</Button>
                <Button type="submit">Alocar Funcionário</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default EquipeAtiva;
