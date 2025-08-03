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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { CalendarIcon, Plus, Search, Download, FileText, TableIcon, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Colaborador {
  id: string;
  nome: string;
  tipoPagamento: 'diaria' | 'hora' | 'producao';
  valor: number;
  horas?: number;
  observacoes?: string;
}

interface RelatorioData {
  id: string;
  obra: string;
  data: Date;
  responsavel: string;
  refeicoes: string[];
  colaboradores: Colaborador[];
  temperatura: string;
  condicaoClimatica: string;
  lancamentoInicio: string;
  lancamentoFim: string;
  acabamentoInicio: string;
  acabamentoFim: string;
  obraInterrompida: boolean;
  motivoInterrupcao?: string;
  tempoInterrupcao?: string;
  observacoes: string;
}

const RelatorioDiarioObra = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('registro');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddColaborador, setShowAddColaborador] = useState(false);
  const [editingRelatorio, setEditingRelatorio] = useState<RelatorioData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    obra: '',
    responsavel: '',
    refeicoes: [] as string[],
    temperatura: '',
    condicaoClimatica: '',
    lancamentoInicio: '',
    lancamentoFim: '',
    acabamentoInicio: '',
    acabamentoFim: '',
    obraInterrompida: false,
    motivoInterrupcao: '',
    tempoInterrupcao: '',
    observacoes: ''
  });

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: '',
    tipoPagamento: 'diaria' as 'diaria' | 'hora' | 'producao',
    valor: 0,
    horas: 0,
    observacoes: ''
  });

  // Dados mockados
  const obras = [
    'Obra Residencial - Rua A, 123',
    'Edifício Comercial - Av. B, 456',
    'Casa Térrea - Rua C, 789'
  ];

  const refeicoesList = [
    { id: 'cafe', label: 'Café da Manhã' },
    { id: 'almoco', label: 'Almoço' },
    { id: 'lanche', label: 'Lanche da Tarde' },
    { id: 'jantar', label: 'Jantar' }
  ];

  const condicoesClimaticas = [
    'Ensolarado',
    'Parcialmente Nublado',
    'Nublado',
    'Chuvoso',
    'Tempestade',
    'Neblina'
  ];

  const [relatorios] = useState<RelatorioData[]>([
    {
      id: '1',
      obra: 'Obra Residencial - Rua A, 123',
      data: new Date('2024-01-15'),
      responsavel: 'João Silva',
      refeicoes: ['cafe', 'almoco'],
      colaboradores: [
        { id: '1', nome: 'Pedro Santos', tipoPagamento: 'diaria', valor: 120 },
        { id: '2', nome: 'Maria Costa', tipoPagamento: 'hora', valor: 15, horas: 8 }
      ],
      temperatura: '28°C',
      condicaoClimatica: 'Ensolarado',
      lancamentoInicio: '07:00',
      lancamentoFim: '12:00',
      acabamentoInicio: '13:00',
      acabamentoFim: '17:00',
      obraInterrompida: false,
      observacoes: 'Dia produtivo, sem intercorrências.'
    }
  ]);

  const handleRefeicaoChange = (refeicaoId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      refeicoes: checked 
        ? [...prev.refeicoes, refeicaoId]
        : prev.refeicoes.filter(r => r !== refeicaoId)
    }));
  };

  const adicionarColaborador = () => {
    if (!novoColaborador.nome || !novoColaborador.valor) {
      toast({
        title: "Erro",
        description: "Nome e valor são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const colaborador: Colaborador = {
      id: Date.now().toString(),
      ...novoColaborador
    };

    setColaboradores(prev => [...prev, colaborador]);
    setNovoColaborador({
      nome: '',
      tipoPagamento: 'diaria',
      valor: 0,
      horas: 0,
      observacoes: ''
    });
    setShowAddColaborador(false);
    
    toast({
      title: "Colaborador adicionado",
      description: `${colaborador.nome} foi adicionado ao relatório`
    });
  };

  const removerColaborador = (id: string) => {
    setColaboradores(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Colaborador removido",
      description: "Colaborador foi removido do relatório"
    });
  };

  const salvarRelatorio = () => {
    if (!formData.obra || !formData.responsavel) {
      toast({
        title: "Erro",
        description: "Obra e responsável são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Relatório salvo",
      description: "Relatório diário foi registrado com sucesso"
    });

    // Reset form
    setFormData({
      obra: '',
      responsavel: '',
      refeicoes: [],
      temperatura: '',
      condicaoClimatica: '',
      lancamentoInicio: '',
      lancamentoFim: '',
      acabamentoInicio: '',
      acabamentoFim: '',
      obraInterrompida: false,
      motivoInterrupcao: '',
      tempoInterrupcao: '',
      observacoes: ''
    });
    setColaboradores([]);
    setSelectedDate(new Date());
  };

  const exportarPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Relatório será baixado em instantes"
    });
  };

  const exportarExcel = () => {
    toast({
      title: "Exportando Excel",
      description: "Planilha será baixada em instantes"
    });
  };

  const handleEditRelatorio = (relatorio: RelatorioData) => {
    setEditingRelatorio(relatorio);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRelatorio) return;

    // Aqui seria implementada a lógica de salvamento no backend
    toast({
      title: "Relatório atualizado",
      description: "As alterações foram salvas com sucesso"
    });
    
    setIsEditModalOpen(false);
    setEditingRelatorio(null);
  };

  const handleDownloadRelatorio = (relatorio: RelatorioData) => {
    // Simular processo de download
    toast({
      title: "Download iniciado",
      description: `Download do relatório de ${format(relatorio.data, "dd/MM/yyyy")} iniciado`
    });
    
    // Aqui seria implementada a lógica real de download do PDF
    setTimeout(() => {
      toast({
        title: "Download concluído",
        description: "O arquivo foi baixado com sucesso"
      });
    }, 2000);
  };

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
            <TabsTrigger value="visualizar">Visualizar Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="registro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Obra</Label>
                    <Select value={formData.obra} onValueChange={(value) => setFormData(prev => ({ ...prev, obra: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a obra" />
                      </SelectTrigger>
                      <SelectContent>
                        {obras.map(obra => (
                          <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data do Registro</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Responsável</Label>
                    <Input
                      value={formData.responsavel}
                      onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                      placeholder="Nome do responsável pelo registro"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refeições Fornecidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {refeicoesList.map(refeicao => (
                    <div key={refeicao.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={refeicao.id}
                        checked={formData.refeicoes.includes(refeicao.id)}
                        onCheckedChange={(checked) => handleRefeicaoChange(refeicao.id, !!checked)}
                      />
                      <Label htmlFor={refeicao.id}>{refeicao.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Colaboradores e Pagamentos</CardTitle>
                  <Button onClick={() => setShowAddColaborador(!showAddColaborador)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Colaborador
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddColaborador && (
                  <Card className="border border-dashed">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome do Colaborador</Label>
                          <Input
                            value={novoColaborador.nome}
                            onChange={(e) => setNovoColaborador(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Nome completo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tipo de Pagamento</Label>
                          <Select 
                            value={novoColaborador.tipoPagamento} 
                            onValueChange={(value: 'diaria' | 'hora' | 'producao') => 
                              setNovoColaborador(prev => ({ ...prev, tipoPagamento: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diaria">Diária</SelectItem>
                              <SelectItem value="hora">Por Hora</SelectItem>
                              <SelectItem value="producao">Por Produção</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Valor (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={novoColaborador.valor}
                            onChange={(e) => setNovoColaborador(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                          />
                        </div>

                        {novoColaborador.tipoPagamento === 'hora' && (
                          <div className="space-y-2">
                            <Label>Horas Trabalhadas</Label>
                            <Input
                              type="number"
                              value={novoColaborador.horas}
                              onChange={(e) => setNovoColaborador(prev => ({ ...prev, horas: parseInt(e.target.value) || 0 }))}
                              placeholder="8"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Observações</Label>
                        <Input
                          value={novoColaborador.observacoes}
                          onChange={(e) => setNovoColaborador(prev => ({ ...prev, observacoes: e.target.value }))}
                          placeholder="Observações adicionais (opcional)"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={adicionarColaborador}>Adicionar</Button>
                        <Button variant="outline" onClick={() => setShowAddColaborador(false)}>Cancelar</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {colaboradores.length > 0 && (
                  <div className="space-y-2">
                    {colaboradores.map(colaborador => (
                      <div key={colaborador.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{colaborador.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {colaborador.tipoPagamento === 'diaria' && `Diária: R$ ${colaborador.valor.toFixed(2)}`}
                            {colaborador.tipoPagamento === 'hora' && `R$ ${colaborador.valor.toFixed(2)}/h × ${colaborador.horas}h = R$ ${(colaborador.valor * (colaborador.horas || 0)).toFixed(2)}`}
                            {colaborador.tipoPagamento === 'producao' && `Produção: R$ ${colaborador.valor.toFixed(2)}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            colaborador.tipoPagamento === 'diaria' ? 'default' :
                            colaborador.tipoPagamento === 'hora' ? 'secondary' : 'outline'
                          }>
                            {colaborador.tipoPagamento === 'diaria' ? 'Diária' :
                             colaborador.tipoPagamento === 'hora' ? 'Por Hora' : 'Produção'}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => removerColaborador(colaborador.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Condições Climáticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperatura</Label>
                    <Input
                      value={formData.temperatura}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperatura: e.target.value }))}
                      placeholder="Ex: 25°C"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Condição Climática</Label>
                    <Select 
                      value={formData.condicaoClimatica} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, condicaoClimatica: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a condição" />
                      </SelectTrigger>
                      <SelectContent>
                        {condicoesClimaticas.map(condicao => (
                          <SelectItem key={condicao} value={condicao}>{condicao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execução de Etapas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Lançamento</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={formData.lancamentoInicio}
                          onChange={(e) => setFormData(prev => ({ ...prev, lancamentoInicio: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={formData.lancamentoFim}
                          onChange={(e) => setFormData(prev => ({ ...prev, lancamentoFim: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Acabamento</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={formData.acabamentoInicio}
                          onChange={(e) => setFormData(prev => ({ ...prev, acabamentoInicio: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={formData.acabamentoFim}
                          onChange={(e) => setFormData(prev => ({ ...prev, acabamentoFim: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interrupção da Obra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="obra-interrompida"
                    checked={formData.obraInterrompida}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, obraInterrompida: !!checked }))}
                  />
                  <Label htmlFor="obra-interrompida">Obra foi interrompida hoje</Label>
                </div>

                {formData.obraInterrompida && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Motivo da Interrupção</Label>
                      <Textarea
                        value={formData.motivoInterrupcao}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivoInterrupcao: e.target.value }))}
                        placeholder="Descreva o motivo da interrupção"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tempo de Interrupção</Label>
                      <Input
                        value={formData.tempoInterrupcao}
                        onChange={(e) => setFormData(prev => ({ ...prev, tempoInterrupcao: e.target.value }))}
                        placeholder="Ex: 2 horas, meio período, dia todo"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre o dia de trabalho..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setFormData({
                  obra: '',
                  responsavel: '',
                  refeicoes: [],
                  temperatura: '',
                  condicaoClimatica: '',
                  lancamentoInicio: '',
                  lancamentoFim: '',
                  acabamentoInicio: '',
                  acabamentoFim: '',
                  obraInterrompida: false,
                  motivoInterrupcao: '',
                  tempoInterrupcao: '',
                  observacoes: ''
                });
                setColaboradores([]);
              }}>
                Limpar Formulário
              </Button>
              <Button onClick={salvarRelatorio}>
                Salvar Relatório
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="visualizar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filtros</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportarPDF}>
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" onClick={exportarExcel}>
                      <TableIcon className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Obra</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as obras" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as obras</SelectItem>
                        {obras.map(obra => (
                          <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input type="date" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {relatorios.map(relatorio => (
                <Card key={relatorio.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold text-lg">{relatorio.obra}</h3>
                          <Badge variant="outline">{format(relatorio.data, "dd/MM/yyyy")}</Badge>
                        </div>
                        <p className="text-muted-foreground">Responsável: {relatorio.responsavel}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Colaboradores: {relatorio.colaboradores.length}</span>
                          <span>Clima: {relatorio.condicaoClimatica} ({relatorio.temperatura})</span>
                          {relatorio.obraInterrompida && (
                            <Badge variant="destructive">Obra Interrompida</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditRelatorio(relatorio)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadRelatorio(relatorio)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Horários de Trabalho</h4>
                        {relatorio.lancamentoInicio && (
                          <p>Lançamento: {relatorio.lancamentoInicio} às {relatorio.lancamentoFim}</p>
                        )}
                        {relatorio.acabamentoInicio && (
                          <p>Acabamento: {relatorio.acabamentoInicio} às {relatorio.acabamentoFim}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Refeições</h4>
                        <div className="flex flex-wrap gap-1">
                          {relatorio.refeicoes.map(refeicao => {
                            const refeicaoLabel = refeicoesList.find(r => r.id === refeicao)?.label;
                            return (
                              <Badge key={refeicao} variant="secondary" className="text-xs">
                                {refeicaoLabel}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {relatorio.observacoes && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="font-medium mb-2">Observações</h4>
                          <p className="text-sm text-muted-foreground">{relatorio.observacoes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Relatório Diário</DialogTitle>
            </DialogHeader>
            
            {editingRelatorio && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Obra</Label>
                    <Select value={editingRelatorio.obra} onValueChange={(value) => setEditingRelatorio(prev => prev ? { ...prev, obra: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {obras.map(obra => (
                          <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Input
                      value={editingRelatorio.responsavel}
                      onChange={(e) => setEditingRelatorio(prev => prev ? { ...prev, responsavel: e.target.value } : null)}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Colaboradores</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {editingRelatorio.colaboradores.map((colaborador, index) => (
                      <div key={colaborador.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{colaborador.nome}</span>
                        <Badge variant="outline">
                          {colaborador.tipoPagamento === 'diaria' ? 'Diária' :
                           colaborador.tipoPagamento === 'hora' ? 'Por Hora' : 'Produção'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperatura</Label>
                    <Input
                      value={editingRelatorio.temperatura}
                      onChange={(e) => setEditingRelatorio(prev => prev ? { ...prev, temperatura: e.target.value } : null)}
                      placeholder="Ex: 25°C"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Condição Climática</Label>
                    <Select value={editingRelatorio.condicaoClimatica} onValueChange={(value) => setEditingRelatorio(prev => prev ? { ...prev, condicaoClimatica: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {condicoesClimaticas.map(condicao => (
                          <SelectItem key={condicao} value={condicao}>{condicao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Lançamento - Início</Label>
                    <Input
                      type="time"
                      value={editingRelatorio.lancamentoInicio}
                      onChange={(e) => setEditingRelatorio(prev => prev ? { ...prev, lancamentoInicio: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lançamento - Fim</Label>
                    <Input
                      type="time"
                      value={editingRelatorio.lancamentoFim}
                      onChange={(e) => setEditingRelatorio(prev => prev ? { ...prev, lancamentoFim: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acabamento - Início</Label>
                    <Input
                      type="time"
                      value={editingRelatorio.acabamentoInicio}
                      onChange={(e) => setEditingRelatorio(prev => prev ? { ...prev, acabamentoInicio: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acabamento - Fim</Label>
                    <Input
                      type="time"
                      value={editingRelatorio.acabamentoFim}
                      onChange={(e) => setEditingRelatorio(prev => prev ? { ...prev, acabamentoFim: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Refeições</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {refeicoesList.map(refeicao => (
                      <div key={refeicao.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${refeicao.id}`}
                          checked={editingRelatorio.refeicoes.includes(refeicao.id)}
                          onCheckedChange={(checked) => {
                            if (!editingRelatorio) return;
                            const newRefeicoes = checked 
                              ? [...editingRelatorio.refeicoes, refeicao.id]
                              : editingRelatorio.refeicoes.filter(r => r !== refeicao.id);
                            setEditingRelatorio({ ...editingRelatorio, refeicoes: newRefeicoes });
                          }}
                        />
                        <Label htmlFor={`edit-${refeicao.id}`}>{refeicao.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={editingRelatorio.observacoes}
                    onChange={(e) => setEditingRelatorio(prev => prev ? { ...prev, observacoes: e.target.value } : null)}
                    placeholder="Observações sobre o dia de trabalho"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default RelatorioDiarioObra;