import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Plus, Calendar, Building } from 'lucide-react';
import FileImportButton from '@/components/shared/FileImportButton';
import { useToast } from '@/hooks/use-toast';
import { useDespesas, useCreateDespesa, useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const LancamentoDespesas = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ descricao: '', valor: '', categoria: '', obra_id: '', data: '' });

  const { data: despesas = [], isLoading } = useDespesas();
  const { data: obrasData = [] } = useObras();
  const createDespesa = useCreateDespesa();

  const handleSave = async () => {
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      toast({ title: 'Campos obrigatórios', variant: 'destructive' }); return;
    }
    try {
      await createDespesa.mutateAsync({
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria as any,
        obra_id: formData.obra_id || null,
        data: formData.data || new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Despesa lançada' });
      setShowModal(false);
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-primary">Lançamento de Despesas</h1><p className="text-muted-foreground mt-1">Registrar despesas operacionais</p></div>
          <Button onClick={() => { setFormData({ descricao: '', valor: '', categoria: '', obra_id: '', data: '' }); setShowModal(true); }}><Plus className="w-4 h-4 mr-2" />Nova Despesa</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : despesas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhuma despesa registrada</p></div>
        ) : (
          <div className="grid gap-4">
            {despesas.map((despesa) => (
              <Card key={despesa.id}><CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{despesa.descricao}</h3>
                      <p className="text-sm text-muted-foreground">{despesa.categoria} - {formatCurrency(despesa.valor)}</p>
                      <p className="text-xs text-muted-foreground">{despesa.obras?.nome || '-'} | {new Date(despesa.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Nova Despesa</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Descrição *</Label><Input value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valor *</Label><Input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} /></div>
                <div><Label>Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(v) => setFormData({...formData, categoria: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem><SelectItem value="mao_de_obra">Mão de Obra</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem><SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem><SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Obra</Label>
                <Select value={formData.obra_id} onValueChange={(v) => setFormData({...formData, obra_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                  <SelectContent>{obrasData.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Data</Label><Input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button><Button onClick={handleSave} disabled={createDespesa.isPending}>{createDespesa.isPending ? 'Salvando...' : 'Salvar'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default LancamentoDespesas;
