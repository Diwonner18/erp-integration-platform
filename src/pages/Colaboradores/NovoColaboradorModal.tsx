import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateColaborador } from '@/hooks/useColaboradoresData';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NovoColaboradorModal = ({ open, onClose }: Props) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [funcao, setFuncao] = useState('');
  const createColaborador = useCreateColaborador();

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
      } as any);
      toast.success('Colaborador criado com sucesso');
      onClose();
    } catch {
      toast.error('Erro ao criar colaborador');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
