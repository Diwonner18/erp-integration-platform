import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateColaborador } from '@/hooks/useColaboradoresData';
import { useCepLookup } from '@/hooks/useCepLookup';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NovoColaboradorModal = ({ open, onClose }: Props) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [funcao, setFuncao] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const createColaborador = useCreateColaborador();
  const { fetchCep, loading: loadingCep } = useCepLookup();

  const handleCepChange = async (value: string) => {
    setCep(value);
    const clean = value.replace(/\D/g, '');
    if (clean.length === 8) {
      const result = await fetchCep(clean);
      if (result) {
        setLogradouro(result.logradouro);
        setBairro(result.bairro);
        setCidade(result.cidade);
        setUf(result.uf);
        toast.success('Endereço preenchido via CEP');
      }
    }
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await createColaborador.mutateAsync({
        nome: nome.trim(),
        cpf: cpf.trim() || null,
        cargo: cargo.trim() || null,
        funcao: funcao.trim() || null,
        cep: cep.trim() || null,
        logradouro: logradouro.trim() || null,
        bairro: bairro.trim() || null,
        cidade: cidade.trim() || null,
        uf: uf.trim() || null,
      } as any);
      toast.success('Colaborador criado com sucesso');
      onClose();
    } catch {
      toast.error('Erro ao criar colaborador');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <Label>CPF</Label>
            <Input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cargo</Label>
              <Input value={cargo} onChange={e => setCargo(e.target.value)} />
            </div>
            <div>
              <Label>Função</Label>
              <Input value={funcao} onChange={e => setFuncao(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>CEP</Label>
              <div className="relative">
                <Input value={cep} onChange={e => handleCepChange(e.target.value)} placeholder="00000-000" />
                {loadingCep && <Loader2 className="absolute right-2 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
            <div className="col-span-2">
              <Label>Logradouro</Label>
              <Input value={logradouro} onChange={e => setLogradouro(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Bairro</Label>
              <Input value={bairro} onChange={e => setBairro(e.target.value)} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={cidade} onChange={e => setCidade(e.target.value)} />
            </div>
            <div>
              <Label>UF</Label>
              <Input value={uf} onChange={e => setUf(e.target.value)} maxLength={2} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createColaborador.isPending}>
              {createColaborador.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovoColaboradorModal;
