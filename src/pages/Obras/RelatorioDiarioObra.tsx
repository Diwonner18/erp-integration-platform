import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Plus, FileText, TableIcon, Trash2, Download, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useObras, useRelatoriosDiarios, useCreateRelatorioDiario } from '@/hooks/useSupabaseData';

interface Colaborador {
  id: string;
  nome: string;
  tipoPagamento: 'diaria' | 'hora' | 'producao';
  valor: number;
  horas?: number;
  observacoes?: string;
}

const RelatorioDiarioObra = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('registro');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddColaborador, setShowAddColaborador] = useState(false);
  
  const { data: obrasData = [], isLoading: loadingObras } = useObras();
  const { data: relatorios = [], isLoading: loadingRelatorios } = useRelatoriosDiarios();
  const createRelatorio = useCreateRelatorioDiario();

  const [formData, setFormData] = useState({
    obra: '',
    responsavel: '',
    temperatura: '',
    condicaoClimatica: '',
    observacoes: '',
    atividades: '',
  });

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: '',
    tipoPagamento: 'diaria' as 'diaria' | 'hora' | 'producao',
    valor: 0,
    horas: 0,
    observacoes: ''
  });

  const condicoesClimaticas = ['Ensolarado', 'Parcialmente Nublado', 'Nublado', 'Chuvoso', 'Tempestade', 'Neblina'];

  const adicionarColaborador = () => {
    if (!novoColaborador.nome || !novoColaborador.valor) {
      toast({ title: "Erro", description: "Nome e valor são obrigatórios", variant: "destructive" });
      return;
    }
    const colaborador: Colaborador = { id: Date.now().toString(), ...novoColaborador };
    setColaboradores(prev => [...prev, colaborador]);
    setNovoColaborador({ nome: '', tipoPagamento: 'diaria', valor: 0, horas: 0, observacoes: '' });
    setShowAddColaborador(false);
    toast({ title: "Colaborador adicionado", description: `${colaborador.nome} foi adicionado ao relatório` });
  };

  const removerColaborador = (id: string) => {
    setColaboradores(prev => prev.filter(c => c.id !== id));
  };

  const salvarRelatorio = async () => {
    if (!formData.obra || !formData.responsavel) {
      toast({ title: "Erro", description: "Obra e responsável são obrigatórios", variant: "destructive" });
      return;
    }

    const tempNum = parseFloat(formData.temperatura) || null;

    try {
      await createRelatorio.mutateAsync({
        obra_id: formData.obra,
        data: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        clima: formData.condicaoClimatica || null,
        temperatura_max: tempNum,
        temperatura_min: tempNum,
        atividades: formData.atividades || null,
        ocorrencias: formData.observacoes || null,
        mao_de_obra_presente: colaboradores.length,
      });

      toast({ title: "Relatório salvo", description: "Relatório diário foi registrado com sucesso" });

      setFormData({ obra: '', responsavel: '', temperatura: '', condicaoClimatica: '', observacoes: '', atividades: '' });
      setColaboradores([]);
      setSelectedDate(new Date());
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  if (loadingObras || loadingRelatorios) {
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
            <h1 className="text-3xl font-bold text-primary">Relatório Diário de Obra</h1>
            <p className="text-muted-foreground mt-1">Registro operacional e circunstancial das obras</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="registro">Novo Registro</TabsTrigger>
            <TabsTrigger value="visualizar">Visualizar Relatórios ({relatorios.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="registro" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Obra *</Label>
                    <Select value={formData.obra} onValueChange={(value) => setFormData(prev => ({ ...prev, obra: value }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                      <SelectContent>
                        {obrasData.map(obra => (
                          <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data do Registro</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Responsável *</Label>
                    <Input value={formData.responsavel} onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))} placeholder="Nome do responsável" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Colaboradores ({colaboradores.length})</CardTitle>
                  <Button onClick={() => setShowAddColaborador(!showAddColaborador)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddColaborador && (
                  <Card className="border border-dashed">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input value={novoColaborador.nome} onChange={(e) => setNovoColaborador(prev => ({ ...prev, nome: e.target.value }))} placeholder="Nome completo" />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Pagamento</Label>
                          <Select value={novoColaborador.tipoPagamento} onValueChange={(value: any) => setNovoColaborador(prev => ({ ...prev, tipoPagamento: value }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diaria">Diária</SelectItem>
                              <SelectItem value="hora">Por Hora</SelectItem>
                              <SelectItem value="producao">Por Produção</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Valor (R$)</Label>
                          <Input type="number" step="0.01" value={novoColaborador.valor} onChange={(e) => setNovoColaborador(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        {novoColaborador.tipoPagamento === 'hora' && (
                          <div className="space-y-2">
                            <Label>Horas</Label>
                            <Input type="number" value={novoColaborador.horas} onChange={(e) => setNovoColaborador(prev => ({ ...prev, horas: parseInt(e.target.value) || 0 }))} />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={adicionarColaborador}>Adicionar</Button>
                        <Button variant="outline" onClick={() => setShowAddColaborador(false)}>Cancelar</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {colaboradores.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{c.nome}</div>
                      <div className="text-sm text-muted-foreground">R$ {c.valor.toFixed(2)}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removerColaborador(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Condições Climáticas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperatura</Label>
                    <Input value={formData.temperatura} onChange={(e) => setFormData(prev => ({ ...prev, temperatura: e.target.value }))} placeholder="Ex: 25" />
                  </div>
                  <div className="space-y-2">
                    <Label>Condição Climática</Label>
                    <Select value={formData.condicaoClimatica} onValueChange={(value) => setFormData(prev => ({ ...prev, condicaoClimatica: value }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {condicoesClimaticas.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Atividades Realizadas</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={formData.atividades} onChange={(e) => setFormData(prev => ({ ...prev, atividades: e.target.value }))} placeholder="Descreva as atividades realizadas..." className="min-h-[100px]" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Observações / Ocorrências</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={formData.observacoes} onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))} placeholder="Observações adicionais..." className="min-h-[100px]" />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setFormData({ obra: '', responsavel: '', temperatura: '', condicaoClimatica: '', observacoes: '', atividades: '' });
                setColaboradores([]);
              }}>Limpar</Button>
              <Button onClick={salvarRelatorio} disabled={createRelatorio.isPending}>
                {createRelatorio.isPending ? 'Salvando...' : 'Salvar Relatório'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="visualizar" className="space-y-6">
            <div className="space-y-4">
              {relatorios.map(relatorio => (
                <Card key={relatorio.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold text-lg">{(relatorio as any).obras?.nome || 'Obra'}</h3>
                          <Badge variant="outline">{new Date(relatorio.data).toLocaleDateString('pt-BR')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Mão de obra: {relatorio.mao_de_obra_presente}</span>
                          <span>Clima: {relatorio.clima || '—'}</span>
                        </div>
                        {relatorio.atividades && (
                          <p className="text-sm text-muted-foreground">{relatorio.atividades}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RelatorioDiarioObra;
