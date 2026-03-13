
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BarChart3, Download, Users, DollarSign, Calendar, TrendingUp, Filter, CalendarIcon } from 'lucide-react';
import { useObras } from '@/hooks/useSupabaseData';
import { useDespesas } from '@/hooks/useSupabaseData';
import { exportToPDF, formatCurrencyExport } from '@/lib/exportUtils';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
  programacao_pendente: 'Prog. Pendente',
  programada: 'Programada',
  em_andamento: 'Em Andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const CATEGORIA_LABELS: Record<string, string> = {
  material: 'Material',
  mao_de_obra: 'Mão de Obra',
  equipamento: 'Equipamento',
  transporte: 'Transporte',
  alimentacao: 'Alimentação',
  outro: 'Outro',
};

const Relatorios = () => {
  const [selectedObra, setSelectedObra] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const { data: obrasRaw, isLoading: loadingObras } = useObras();
  const { data: despesasRaw, isLoading: loadingDespesas } = useDespesas();

  const obras = useMemo(() => (obrasRaw || []).map((o: any) => ({
    id: o.id,
    nome: o.nome,
    cliente: o.clientes?.razao_social || 'Sem cliente',
    status: o.status,
    data: o.data_inicio ? new Date(o.data_inicio) : null,
    valor: Number(o.valor_contrato) || 0,
  })), [obrasRaw]);

  const filteredObras = useMemo(() => {
    let filtered = obras;
    if (selectedObra !== 'todas') {
      filtered = filtered.filter(o => o.nome === selectedObra);
    }
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(o => o.status === selectedStatus);
    }
    if (dateRange.from) {
      filtered = filtered.filter(o => o.data && o.data >= dateRange.from!);
    }
    if (dateRange.to) {
      filtered = filtered.filter(o => o.data && o.data <= dateRange.to!);
    }
    return filtered;
  }, [obras, selectedObra, selectedStatus, dateRange]);

  const stats = useMemo(() => {
    const totalReceita = filteredObras.reduce((acc, o) => acc + o.valor, 0);
    const obrasAtivas = filteredObras.filter(o => o.status === 'em_andamento').length;
    const clientesUnicos = new Set(filteredObras.map(o => o.cliente)).size;

    // Growth: compare total obras in filtered vs all
    const totalAll = obras.length;
    const totalFiltered = filteredObras.length;
    const growthPct = totalAll > 0 ? Math.round((totalFiltered / totalAll) * 100) : 0;

    return { receita: totalReceita, obras: obrasAtivas, clientes: clientesUnicos, crescimento: `${growthPct}%` };
  }, [filteredObras, obras]);

  const setoresDespesas = useMemo(() => {
    if (!despesasRaw) return [];
    const grouped: Record<string, number> = {};
    despesasRaw.forEach((d: any) => {
      const cat = d.categoria || 'outro';
      grouped[cat] = (grouped[cat] || 0) + (Number(d.valor) || 0);
    });
    return Object.entries(grouped)
      .map(([cat, valor]) => ({ setor: CATEGORIA_LABELS[cat] || cat, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [despesasRaw]);

  const obrasList = useMemo(() => [...new Set(obras.map(o => o.nome))], [obras]);

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Relatório Geral - Dashboard',
      filename: `relatorio-geral-${format(new Date(), 'yyyy-MM-dd')}`,
      columns: [
        { header: 'Obra', key: 'nome' },
        { header: 'Cliente', key: 'cliente' },
        { header: 'Status', key: 'statusLabel' },
        { header: 'Início', key: 'dataLabel' },
        { header: 'Valor Contrato', key: 'valor', format: formatCurrencyExport },
      ],
      data: filteredObras.map(o => ({
        nome: o.nome,
        cliente: o.cliente,
        statusLabel: STATUS_LABELS[o.status] || o.status,
        dataLabel: o.data ? format(o.data, 'dd/MM/yyyy') : '-',
        valor: o.valor,
      })),
    });
    toast.success('PDF exportado com sucesso!');
  };

  const isLoading = loadingObras || loadingDespesas;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios Gerais</h1>
            <p className="text-muted-foreground mt-1">Visão completa de todos os indicadores</p>
          </div>
          <Button onClick={handleExportPDF} disabled={filteredObras.length === 0} data-tour="page-export">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dashboard
          </Button>
        </div>

        <Card data-tour="page-filters">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="obra-filter">Obra</Label>
                <Select value={selectedObra} onValueChange={setSelectedObra}>
                  <SelectTrigger id="obra-filter">
                    <SelectValue placeholder="Selecionar obra" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="todas">Todas as obras</SelectItem>
                    {obrasList.map((obra) => (
                      <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Período</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", { locale: ptBR }) : "De"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                      <CalendarComponent mode="single" selected={dateRange.from} onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR }) : "Até"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                      <CalendarComponent mode="single" selected={dateRange.to} onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => { setSelectedObra('todas'); setSelectedStatus('todos'); setDateRange({ from: undefined, to: undefined }); }}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(stats.receita)}
                </div>
                <p className="text-xs text-muted-foreground">{filteredObras.length} {filteredObras.length === 1 ? 'obra filtrada' : 'obras filtradas'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Obras Ativas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.obras}</div>
                <p className="text-xs text-muted-foreground">{filteredObras.length} total filtradas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.clientes}</div>
                <p className="text-xs text-muted-foreground">Na seleção atual</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cobertura do Filtro</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.crescimento}</div>
                <p className="text-xs text-muted-foreground">Das obras totais</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDespesas ? (
                <Skeleton className="h-40 w-full" />
              ) : setoresDespesas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem despesas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {setoresDespesas.map((item, index) => {
                    const maxVal = setoresDespesas[0]?.valor || 1;
                    const pct = Math.round((item.valor / maxVal) * 100);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{item.setor}</span>
                          <span className="font-semibold text-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(item.valor)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes na Seleção Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingObras ? (
                <Skeleton className="h-40 w-full" />
              ) : filteredObras.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum resultado encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    filteredObras.reduce((acc, obra) => {
                      if (!acc[obra.cliente]) acc[obra.cliente] = { obras: 0, valor: 0 };
                      acc[obra.cliente].obras += 1;
                      acc[obra.cliente].valor += obra.valor;
                      return acc;
                    }, {} as Record<string, { obras: number; valor: number }>)
                  ).sort((a, b) => b[1].valor - a[1].valor).map(([cliente, data], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{cliente}</p>
                        <p className="text-xs text-muted-foreground">{data.obras} {data.obras === 1 ? 'obra' : 'obras'}</p>
                      </div>
                      <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(data.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
