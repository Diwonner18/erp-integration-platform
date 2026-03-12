import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Ruler, Plus, Search, Eye, Check, X, Loader2, Download, FileSpreadsheet } from 'lucide-react';
import FileImportButton from '@/components/shared/FileImportButton';
import NovaMedicaoModal from '@/components/Obras/NovaMedicaoModal';
import MedicaoDetailModal from '@/components/Obras/MedicaoDetailModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useToast } from '@/hooks/use-toast';
import { useMedicoes, useUpdateMedicao, useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { exportToPDF, exportToExcel, formatCurrencyExport, formatDateExport, formatPercentExport } from '@/lib/exportUtils';

const Medicoes = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const { data: medicoes = [], isLoading } = useMedicoes();
  const { data: obrasData = [] } = useObras();
  const updateMedicao = useUpdateMedicao();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMedicao, setSelectedMedicao] = useState<any>(null);
  const [actionType, setActionType] = useState<'aprovar' | 'rejeitar' | ''>('');

  const obras = obrasData.map(o => ({ id: o.id, nome: o.nome }));

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'rejeitada', label: 'Rejeitada' }
  ];

  const filteredMedicoes = useMemo(() => {
    let result = medicoes;
    if (filters.obra) result = result.filter(m => m.obra_id === filters.obra);
    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(m => {
        if (!m.data_medicao) return false;
        const d = new Date(m.data_medicao);
        return d >= filters.dataInicial! && d <= filters.dataFinal!;
      });
    }
    if (filters.status) result = result.filter(m => m.status === filters.status);
    if (searchTerm) {
      result = result.filter(m =>
        (m.obras?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.numero || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [medicoes, filters, searchTerm]);

  const handleConfirmarMedicao = (medicao: any) => {
    if (medicao.status !== 'pendente') {
      toast({ title: 'Erro', description: 'Esta medição não pode ser aprovada', variant: 'destructive' });
      return;
    }
    setSelectedMedicao(medicao);
    setActionType('aprovar');
    setShowConfirmModal(true);
  };

  const handleRejeitarMedicao = (medicao: any) => {
    if (medicao.status !== 'pendente') {
      toast({ title: 'Erro', description: 'Esta medição não pode ser rejeitada', variant: 'destructive' });
      return;
    }
    setSelectedMedicao(medicao);
    setActionType('rejeitar');
    setShowConfirmModal(true);
  };

  const handleVisualizarMedicao = (medicao: any) => {
    setSelectedMedicao(medicao);
    setShowDetailModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedMedicao) return;
    const newStatus = actionType === 'aprovar' ? 'aprovada' : 'rejeitada';
    try {
      await updateMedicao.mutateAsync({ id: selectedMedicao.id, status: newStatus as any });
      toast({
        title: actionType === 'aprovar' ? 'Medição aprovada' : 'Medição rejeitada',
        description: `Medição ${selectedMedicao.numero || ''} foi ${newStatus}`,
        variant: actionType === 'rejeitar' ? 'destructive' : undefined,
      });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao processar a medição.', variant: 'destructive' });
    } finally {
      setShowConfirmModal(false);
      setSelectedMedicao(null);
      setActionType('');
    }
  };

  const handleDetailModalAction = (medicao: any, action: 'aprovar' | 'rejeitar') => {
    setShowDetailModal(false);
    setSelectedMedicao(medicao);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-title text-foreground">Medições</h1>
            <p className="text-muted-foreground mt-1">Controle de medições das obras</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <FileImportButton targetType="medicoes" />
            <Button variant="outline" size="sm" onClick={() => {
              exportToPDF({
                title: 'Relatório de Medições',
                columns: [
                  { header: 'Obra', key: 'obra_nome' },
                  { header: 'Número', key: 'numero' },
                  { header: 'Data', key: 'data_medicao', format: formatDateExport },
                  { header: 'Valor', key: 'valor', format: formatCurrencyExport },
                  { header: '% Exec.', key: 'percentual', format: formatPercentExport },
                  { header: 'Status', key: 'status' },
                ],
                data: filteredMedicoes.map(m => ({ ...m, obra_nome: m.obras?.nome || '-' })),
                filename: `medicoes_${new Date().toISOString().split('T')[0]}`,
              });
              toast({ title: 'PDF exportado' });
            }}><Download className="w-4 h-4 mr-2" />PDF</Button>
            <Button variant="outline" size="sm" onClick={() => {
              exportToExcel({
                title: 'Medições',
                columns: [
                  { header: 'Obra', key: 'obra_nome' },
                  { header: 'Número', key: 'numero' },
                  { header: 'Data', key: 'data_medicao', format: formatDateExport },
                  { header: 'Valor', key: 'valor', format: formatCurrencyExport },
                  { header: '% Exec.', key: 'percentual', format: formatPercentExport },
                  { header: 'Status', key: 'status' },
                ],
                data: filteredMedicoes.map(m => ({ ...m, obra_nome: m.obras?.nome || '-' })),
                filename: `medicoes_${new Date().toISOString().split('T')[0]}`,
              });
              toast({ title: 'Excel exportado' });
            }}><FileSpreadsheet className="w-4 h-4 mr-2" />Excel</Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Medição
            </Button>
          </div>
        </div>

        <AdvancedFilters onFiltersChange={setFilters} obras={obras} statusOptions={statusOptions} />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar medições..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">
            Exibindo {filteredMedicoes.length} de {medicoes.length} medições
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : filteredMedicoes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Ruler className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma medição encontrada</p>
            <p className="text-sm">Crie uma nova medição para começar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMedicoes.map((medicao) => (
              <Card key={medicao.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Ruler className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{medicao.obras?.nome || 'Obra'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {medicao.numero || 'S/N'} - {medicao.percentual || 0}% executado
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Valor: {formatCurrency(medicao.valor)} | Data: {medicao.data_medicao ? new Date(medicao.data_medicao).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        medicao.status === 'aprovada' ? 'default' :
                        medicao.status === 'pendente' ? 'secondary' : 'destructive'
                      }>
                        {medicao.status === 'aprovada' ? 'Aprovada' :
                         medicao.status === 'pendente' ? 'Pendente' :
                         medicao.status === 'em_elaboracao' ? 'Em Elaboração' : 'Rejeitada'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleVisualizarMedicao(medicao)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {medicao.status === 'pendente' && (
                          <>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRejeitarMedicao(medicao)}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleConfirmarMedicao(medicao)}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <NovaMedicaoModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <MedicaoDetailModal medicao={selectedMedicao} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} onAprovar={(m) => handleDetailModalAction(m, 'aprovar')} onRejeitar={(m) => handleDetailModalAction(m, 'rejeitar')} />
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => { setShowConfirmModal(false); setSelectedMedicao(null); setActionType(''); }}
          onConfirm={handleConfirmAction}
          title={actionType === 'aprovar' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
          description={selectedMedicao ? `Tem certeza que deseja ${actionType === 'aprovar' ? 'aprovar' : 'rejeitar'} a medição ${selectedMedicao.numero || ''} da obra "${selectedMedicao.obras?.nome || ''}"?` : ''}
          confirmText={actionType === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
          cancelText="Cancelar"
          type={actionType === 'aprovar' ? 'success' : 'danger'}
          loading={updateMedicao.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default Medicoes;
