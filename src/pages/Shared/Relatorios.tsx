
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BarChart3, Download, Users, DollarSign, Calendar, TrendingUp, Filter, CalendarIcon } from 'lucide-react';

const Relatorios = () => {
  // Estados dos filtros
  const [selectedObra, setSelectedObra] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  // Dados mock com estrutura mais completa
  const allData = useMemo(() => ({
    obras: [
      { id: 1, nome: 'Reforma Escritório ABC', cliente: 'ABC Construções', status: 'em-andamento', data: new Date('2024-01-15'), valor: 85200 },
      { id: 2, nome: 'Instalação Elétrica Silva', cliente: 'Silva Engenharia', status: 'concluida', data: new Date('2024-01-20'), valor: 62800 },
      { id: 3, nome: 'Projeto Costa Residencial', cliente: 'Costa & Filhos', status: 'em-andamento', data: new Date('2024-02-01'), valor: 48600 },
      { id: 4, nome: 'Manutenção Mendes', cliente: 'Mendes Construtora', status: 'cancelada', data: new Date('2024-02-10'), valor: 32400 },
      { id: 5, nome: 'Ampliação ABC Loja', cliente: 'ABC Construções', status: 'planejamento', data: new Date('2024-02-15'), valor: 95000 },
    ],
    clientes: [
      { nome: 'ABC Construções', obras: 8, valor: 85200 },
      { nome: 'Silva Engenharia', obras: 6, valor: 62800 },
      { nome: 'Costa & Filhos', obras: 5, valor: 48600 },
      { nome: 'Mendes Construtora', obras: 4, valor: 32400 }
    ],
    setores: [
      { setor: 'Comercial', valor: 120400, crescimento: '+25%' },
      { setor: 'Obras', valor: 98200, crescimento: '+18%' },
      { setor: 'Financeiro', valor: 66800, crescimento: '+15%' }
    ]
  }), []);

  // Lógica de filtros
  const filteredData = useMemo(() => {
    let filtered = allData.obras;

    // Filtro por obra
    if (selectedObra !== 'todas') {
      filtered = filtered.filter(obra => obra.nome === selectedObra);
    }

    // Filtro por status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(obra => obra.status === selectedStatus);
    }

    // Filtro por período
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(obra => 
        obra.data >= dateRange.from! && obra.data <= dateRange.to!
      );
    }

    return filtered;
  }, [selectedObra, selectedStatus, dateRange, allData.obras]);

  // Cálculos baseados nos dados filtrados
  const stats = useMemo(() => {
    const totalReceita = filteredData.reduce((acc, obra) => acc + obra.valor, 0);
    const obrasAtivas = filteredData.filter(obra => obra.status === 'em-andamento').length;
    const clientesUnicos = new Set(filteredData.map(obra => obra.cliente)).size;
    
    return {
      receita: totalReceita,
      obras: obrasAtivas,
      clientes: clientesUnicos,
      crescimento: '+18%' // Este seria calculado com dados históricos
    };
  }, [filteredData]);

  const obrasList = useMemo(() => 
    [...new Set(allData.obras.map(obra => obra.nome))], 
    [allData.obras]
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Relatórios Gerais</h1>
            <p className="text-slate-600 mt-1">Visão completa de todos os indicadores</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar Dashboard
          </Button>
        </div>

        {/* Seção de Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por Obra */}
              <div className="space-y-2">
                <Label htmlFor="obra-filter">Obra</Label>
                <Select value={selectedObra} onValueChange={setSelectedObra}>
                  <SelectTrigger id="obra-filter">
                    <SelectValue placeholder="Selecionar obra" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="todas">Todas as obras</SelectItem>
                    {obrasList.map((obra) => (
                      <SelectItem key={obra} value={obra}>
                        {obra}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Período */}
              <div className="space-y-2">
                <Label>Período</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "De"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? (
                          format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Até"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {dateRange.from && dateRange.to && dateRange.from > dateRange.to && (
                  <p className="text-sm text-red-600">A data inicial deve ser anterior à data final</p>
                )}
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botão para limpar filtros */}
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedObra('todas');
                  setSelectedStatus('todos');
                  setDateRange({ from: undefined, to: undefined });
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL',
                  minimumFractionDigits: 0 
                }).format(stats.receita)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredData.length} {filteredData.length === 1 ? 'obra filtrada' : 'obras filtradas'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras Ativas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.obras}</div>
              <p className="text-xs text-muted-foreground">
                {filteredData.length} total filtradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clientes}</div>
              <p className="text-xs text-muted-foreground">
                Na seleção atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.crescimento}</div>
              <p className="text-xs text-muted-foreground">Baseado nos filtros</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance por Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { setor: 'Comercial', valor: 'R$ 120.400', crescimento: '+25%' },
                  { setor: 'Obras', valor: 'R$ 98.200', crescimento: '+18%' },
                  { setor: 'Financeiro', valor: 'R$ 66.800', crescimento: '+15%' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.setor}</span>
                    <div className="text-right">
                      <span className="font-semibold">{item.valor}</span>
                      <span className="text-xs text-green-600 ml-2">{item.crescimento}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes na Seleção Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.length === 0 ? (
                  <p className="text-center text-slate-500">
                    Nenhum resultado encontrado com os filtros aplicados
                  </p>
                ) : (
                  Object.entries(
                    filteredData.reduce((acc, obra) => {
                      if (!acc[obra.cliente]) {
                        acc[obra.cliente] = { obras: 0, valor: 0 };
                      }
                      acc[obra.cliente].obras += 1;
                      acc[obra.cliente].valor += obra.valor;
                      return acc;
                    }, {} as Record<string, { obras: number; valor: number }>)
                  )
                  .sort((a, b) => b[1].valor - a[1].valor)
                  .map(([cliente, data], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{cliente}</p>
                        <p className="text-xs text-slate-500">{data.obras} {data.obras === 1 ? 'obra' : 'obras'}</p>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL',
                          minimumFractionDigits: 0 
                        }).format(data.valor)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              Gráfico de evolução mensal será implementado aqui
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
