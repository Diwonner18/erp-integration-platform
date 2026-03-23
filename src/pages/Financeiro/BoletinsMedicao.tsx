import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search } from 'lucide-react';
import NovoBoletimModal from '@/components/Financeiro/NovoBoletimModal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useBoletins, useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserModulePermissions } from '@/hooks/usePermissoesPerfil';

const BoletinsMedicao = () => {
  const { incluir_editar } = useUserModulePermissions('boletins');
  const [showNovoBoletimModal, setShowNovoBoletimModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const { data: boletins = [], isLoading } = useBoletins();
  const { data: obrasData = [] } = useObras();

  const obras = obrasData.map(o => ({ id: o.id, nome: o.nome }));
  const statusOptions = [
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'emitido', label: 'Emitido' },
    { value: 'aprovado', label: 'Aprovado' },
    { value: 'pago', label: 'Pago' },
  ];

  const filteredBoletins = useMemo(() => {
    let result = boletins;
    if (filters.obra) result = result.filter(b => b.obra_id === filters.obra);
    if (filters.status) result = result.filter(b => b.status === filters.status);
    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(b => {
        if (!b.data_emissao) return false;
        const d = new Date(b.data_emissao);
        return d >= filters.dataInicial! && d <= filters.dataFinal!;
      });
    }
    if (searchTerm) {
      result = result.filter(b =>
        (b.obras?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.numero || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [boletins, filters, searchTerm]);

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = { rascunho: 'Rascunho', emitido: 'Emitido', aprovado: 'Aprovado', pago: 'Pago' };
    return map[s] || s;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold font-title text-foreground">Boletins de Medição</h1>
            <p className="text-muted-foreground mt-1">Emitir boletins para faturamento</p>
          </div>
          <Button onClick={() => setShowNovoBoletimModal(true)} data-tour="page-new-btn"><Plus className="w-4 h-4 mr-2" />Novo Boletim</Button>
        </div>

        <div data-tour="page-filters"><AdvancedFilters onFiltersChange={setFilters} obras={obras} statusOptions={statusOptions} /></div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar boletins..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">{filteredBoletins.length} de {boletins.length} boletins</div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filteredBoletins.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhum boletim encontrado</p></div>
        ) : (
          <div className="grid gap-4" data-tour="page-list">
            {filteredBoletins.map((boletim) => (
              <Card key={boletim.id}><CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{boletim.obras?.nome || 'Obra'}</h3>
                      <p className="text-sm text-muted-foreground">{boletim.numero || 'S/N'}</p>
                      <p className="text-xs text-muted-foreground">Valor: {formatCurrency(boletim.valor)} | Emissão: {boletim.data_emissao ? new Date(boletim.data_emissao).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                  </div>
                  <Badge variant={boletim.status === 'pago' ? 'default' : boletim.status === 'aprovado' ? 'secondary' : 'outline'}>
                    {getStatusLabel(boletim.status)}
                  </Badge>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        <NovoBoletimModal open={showNovoBoletimModal} onClose={() => setShowNovoBoletimModal(false)} />
      </div>
    </MainLayout>
  );
};

export default BoletinsMedicao;
