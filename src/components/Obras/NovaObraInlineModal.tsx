import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MapPin, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCepLookup } from '@/hooks/useCepLookup';
import { useCreateObra } from '@/hooks/useSupabaseData';

interface NovaObraInlineModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (obra: { id: string; nome: string }) => void;
}

const NovaObraInlineModal = ({ open, onClose, onCreated }: NovaObraInlineModalProps) => {
  const { toast } = useToast();
  const { fetchCep, loading: cepLoading } = useCepLookup();
  const createObra = useCreateObra();

  const [form, setForm] = useState({
    nome: '',
    metragem: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    complemento: '',
    responsavelNome: '',
    responsavelTelefone: '',
    responsavelEmail: '',
    escopo: '',
  });

  const setField = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleCepBlur = useCallback(async () => {
    if (form.cep.replace(/\D/g, '').length !== 8) return;
    const data = await fetchCep(form.cep);
    if (data) {
      setForm((p) => ({
        ...p,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
      }));
    } else {
      toast({ title: 'CEP não encontrado', variant: 'destructive' });
    }
  }, [form.cep, fetchCep, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast({ title: 'Nome da obra é obrigatório', variant: 'destructive' });
      return;
    }
    if (!form.cep || !form.logradouro || !form.cidade || !form.uf) {
      toast({ title: 'Endereço incompleto', description: 'CEP, logradouro, cidade e UF são obrigatórios', variant: 'destructive' });
      return;
    }

    const enderecoCompleto = [
      form.logradouro,
      form.numero ? `nº ${form.numero}` : '',
      form.complemento || '',
      form.bairro,
      `${form.cidade}/${form.uf}`,
      `CEP: ${form.cep}`,
    ].filter(Boolean).join(', ');

    try {
      const created: any = await createObra.mutateAsync({
        nome: form.nome.trim(),
        endereco: enderecoCompleto,
        metragem: form.metragem ? parseFloat(form.metragem) : null,
        escopo: form.escopo.trim() || null,
        status: 'agendada' as any,
        responsavel_telefone: form.responsavelTelefone || null,
        responsavel_email: form.responsavelEmail || null,
      });
      toast({ title: 'Obra criada', description: 'Pronta para ser programada.' });
      onCreated({ id: created.id, nome: created.nome });
      // reset
      setForm({
        nome: '', metragem: '', cep: '', logradouro: '', numero: '',
        bairro: '', cidade: '', uf: '', complemento: '',
        responsavelNome: '', responsavelTelefone: '', responsavelEmail: '', escopo: '',
      });
      onClose();
    } catch (err: any) {
      toast({ title: 'Erro ao criar obra', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" /> Cadastrar Nova Obra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome da Obra *</Label>
              <Input value={form.nome} onChange={(e) => setField('nome', e.target.value)} placeholder="Ex: Pintura Edifício Central" required />
            </div>
            <div className="space-y-2">
              <Label>Metragem (m²)</Label>
              <Input type="number" step="0.01" value={form.metragem} onChange={(e) => setField('metragem', e.target.value)} placeholder="Ex: 250" />
            </div>
            <div className="space-y-2">
              <Label>Escopo (resumo)</Label>
              <Input value={form.escopo} onChange={(e) => setField('escopo', e.target.value)} placeholder="Ex: Pintura interna 3 demãos" />
            </div>
          </div>

          {/* Endereço com ViaCEP */}
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Endereço da Obra
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>CEP *</Label>
                <div className="relative">
                  <Input value={form.cep} onChange={(e) => setField('cep', e.target.value)} onBlur={handleCepBlur} placeholder="00000-000" />
                  {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
              <div className="space-y-1">
                <Label>UF *</Label>
                <Input value={form.uf} onChange={(e) => setField('uf', e.target.value)} maxLength={2} placeholder="SP" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Logradouro *</Label>
              <Input value={form.logradouro} onChange={(e) => setField('logradouro', e.target.value)} placeholder="Rua / Avenida" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Número</Label>
                <Input value={form.numero} onChange={(e) => setField('numero', e.target.value)} placeholder="123" />
              </div>
              <div className="space-y-1">
                <Label>Complemento</Label>
                <Input value={form.complemento} onChange={(e) => setField('complemento', e.target.value)} placeholder="Apto, Sala..." />
              </div>
              <div className="space-y-1">
                <Label>Bairro</Label>
                <Input value={form.bairro} onChange={(e) => setField('bairro', e.target.value)} placeholder="Bairro" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Cidade *</Label>
              <Input value={form.cidade} onChange={(e) => setField('cidade', e.target.value)} placeholder="Cidade" />
            </div>
          </div>

          {/* Contato responsável */}
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <h4 className="text-sm font-semibold text-foreground">Contato no local (opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={form.responsavelNome} onChange={(e) => setField('responsavelNome', e.target.value)} placeholder="Responsável" />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={form.responsavelTelefone} onChange={(e) => setField('responsavelTelefone', e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input type="email" value={form.responsavelEmail} onChange={(e) => setField('responsavelEmail', e.target.value)} placeholder="contato@email.com" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createObra.isPending}>
              {createObra.isPending ? 'Salvando...' : 'Criar Obra'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaObraInlineModal;
