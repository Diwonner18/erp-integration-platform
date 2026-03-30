import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  useColaborador, useUpdateColaborador,
  useColaboradorBeneficios, useCreateBeneficio, useDeleteBeneficio,
  useColaboradorAlocacoes, useCreateAlocacao,
  useBancoHoras, useCreateBancoHoras,
  useFaltasLicencas, useCreateFaltaLicenca,
} from '@/hooks/useColaboradoresData';
import { useEPIs } from '@/hooks/useSupabaseData';
import { useObras } from '@/hooks/useSupabaseData';

interface Props {
  colaboradorId: string;
  open: boolean;
  onClose: () => void;
}

const ColaboradorDetailModal = ({ colaboradorId, open, onClose }: Props) => {
  const { effectiveType } = useAuth();
  const canSeeSensitive = ['admin', 'gerenciador_tecnico', 'financeira'].includes(effectiveType || '');
  const { data: colab, isLoading } = useColaborador(colaboradorId);
  const updateColaborador = useUpdateColaborador();
  const { data: beneficios } = useColaboradorBeneficios(colaboradorId);
  const createBeneficio = useCreateBeneficio();
  const deleteBeneficio = useDeleteBeneficio();
  const { data: alocacoes } = useColaboradorAlocacoes(colaboradorId);
  const createAlocacao = useCreateAlocacao();
  const { data: bancoHoras } = useBancoHoras(colaboradorId);
  const createBancoHoras = useCreateBancoHoras();
  const { data: faltasLicencas } = useFaltasLicencas(colaboradorId);
  const createFaltaLicenca = useCreateFaltaLicenca();
  const { data: allEpis } = useEPIs();
  const { data: obras } = useObras();

  const [editData, setEditData] = useState<Record<string, any>>({});
  const [newBeneficio, setNewBeneficio] = useState({ tipo: 'vr', valor: '' });
  const [newAlocacao, setNewAlocacao] = useState({ obra_id: '', data_inicio: '', funcao: '' });
  const [newBancoHoras, setNewBancoHoras] = useState({ tipo: 'credito', horas: '', data: '', motivo: '' });
  const [newFalta, setNewFalta] = useState({ tipo: 'falta_justificada', data_inicio: '', data_fim: '', remunerada: true, observacoes: '' });

  if (isLoading || !colab) return null;

  const val = (field: string) => editData[field] ?? (colab as any)[field] ?? '';
  const set = (field: string, value: any) => setEditData(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (Object.keys(editData).length === 0) return;
    try {
      await updateColaborador.mutateAsync({ id: colaboradorId, ...editData });
      toast.success('Colaborador atualizado');
      setEditData({});
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const colaboradorEpis = (allEpis || []).filter(e => e.funcionario?.toLowerCase() === colab.nome?.toLowerCase());

  const saldoBancoHoras = (bancoHoras || []).reduce((acc, bh) => {
    return bh.tipo === 'credito' ? acc + Number(bh.horas) : acc - Number(bh.horas);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {colab.nome}
            <Badge variant={colab.status === 'ativo' ? 'default' : colab.status === 'afastado' ? 'secondary' : 'destructive'}>
              {colab.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="contratacao">Contratação</TabsTrigger>
            {canSeeSensitive && <TabsTrigger value="beneficios">Benefícios</TabsTrigger>}
            <TabsTrigger value="epi">EPI</TabsTrigger>
            <TabsTrigger value="historico">Histórico Alocação</TabsTrigger>
            {canSeeSensitive && <TabsTrigger value="banco-horas">Banco de Horas / Faltas</TabsTrigger>}
          </TabsList>

          {/* ===== DADOS ===== */}
          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['nome', 'Nome'],
                ...(canSeeSensitive ? [['cpf', 'CPF'], ['rg', 'RG'], ['data_nascimento', 'Data de Nascimento']] : []),
                ...(canSeeSensitive ? [['telefone', 'Telefone'], ['celular', 'Celular'], ['email', 'E-mail']] : []),
              ].map(([field, label]) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <Input
                    type={field === 'data_nascimento' ? 'date' : 'text'}
                    value={val(field)}
                    onChange={e => set(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
            {canSeeSensitive && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase mt-4">Endereço</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ['cep', 'CEP'], ['logradouro', 'Logradouro'], ['numero', 'Número'],
                    ['bairro', 'Bairro'], ['complemento', 'Complemento'], ['cidade', 'Cidade'], ['uf', 'UF'],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <Label>{label}</Label>
                      <Input value={val(field)} onChange={e => set(field, e.target.value)} />
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={Object.keys(editData).length === 0}>Salvar Alterações</Button>
            </div>
          </TabsContent>

          {/* ===== CONTRATAÇÃO ===== */}
          <TabsContent value="contratacao" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['data_admissao', 'Data de Admissão', 'date'],
                ['cargo', 'Cargo', 'text'],
                ['funcao', 'Função', 'text'],
                ['tipo_contrato', 'Tipo de Contrato', 'text'],
                ['salario_base', 'Salário Base', 'number'],
                ['pis_pasep', 'PIS/PASEP', 'text'],
              ].map(([field, label, type]) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <Input
                    type={type}
                    step={type === 'number' ? '0.01' : undefined}
                    value={val(field)}
                    onChange={e => set(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                  />
                </div>
              ))}
              <div>
                <Label>Status</Label>
                <Select value={val('status')} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={Object.keys(editData).length === 0}>Salvar Alterações</Button>
            </div>
          </TabsContent>

          {/* ===== BENEFÍCIOS ===== */}
          <TabsContent value="beneficios" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end">
              <div>
                <Label>Tipo</Label>
                <Select value={newBeneficio.tipo} onValueChange={v => setNewBeneficio(p => ({ ...p, tipo: v }))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vr">VR</SelectItem>
                    <SelectItem value="vt">VT</SelectItem>
                    <SelectItem value="mobilidade">Mobilidade</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={newBeneficio.valor} onChange={e => setNewBeneficio(p => ({ ...p, valor: e.target.value }))} className="w-32" />
              </div>
              <Button size="sm" onClick={async () => {
                if (!newBeneficio.valor) return;
                await createBeneficio.mutateAsync({ colaborador_id: colaboradorId, tipo: newBeneficio.tipo, valor: Number(newBeneficio.valor) });
                setNewBeneficio({ tipo: 'vr', valor: '' });
                toast.success('Benefício adicionado');
              }}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(beneficios || []).map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="uppercase font-medium">{b.tipo}</TableCell>
                    <TableCell>R$ {Number(b.valor).toFixed(2)}</TableCell>
                    <TableCell><Badge variant={b.ativo ? 'default' : 'secondary'}>{b.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        await deleteBeneficio.mutateAsync(b.id);
                        toast.success('Benefício removido');
                      }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(beneficios || []).length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum benefício cadastrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ===== EPI ===== */}
          <TabsContent value="epi" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">EPIs vinculados ao nome deste colaborador na tabela de EPIs.</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>CA</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradorEpis.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum EPI encontrado</TableCell></TableRow>
                ) : colaboradorEpis.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.tipo}</TableCell>
                    <TableCell>{e.certificado_aprovacao || '—'}</TableCell>
                    <TableCell>{e.quantidade}</TableCell>
                    <TableCell>{e.data_entrega || '—'}</TableCell>
                    <TableCell>{e.validade || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ===== HISTÓRICO ALOCAÇÃO ===== */}
          <TabsContent value="historico" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end flex-wrap">
              <div>
                <Label>Obra</Label>
                <Select value={newAlocacao.obra_id} onValueChange={v => setNewAlocacao(p => ({ ...p, obra_id: v }))}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(obras || []).map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Início</Label>
                <Input type="date" value={newAlocacao.data_inicio} onChange={e => setNewAlocacao(p => ({ ...p, data_inicio: e.target.value }))} className="w-36" />
              </div>
              <div>
                <Label>Função</Label>
                <Input value={newAlocacao.funcao} onChange={e => setNewAlocacao(p => ({ ...p, funcao: e.target.value }))} className="w-36" />
              </div>
              <Button size="sm" onClick={async () => {
                if (!newAlocacao.obra_id) return;
                await createAlocacao.mutateAsync({
                  colaborador_id: colaboradorId,
                  obra_id: newAlocacao.obra_id,
                  data_inicio: newAlocacao.data_inicio || null,
                  funcao: newAlocacao.funcao || null,
                } as any);
                setNewAlocacao({ obra_id: '', data_inicio: '', funcao: '' });
                toast.success('Alocação registrada');
              }}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obra</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Função</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(alocacoes || []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhuma alocação</TableCell></TableRow>
                ) : (alocacoes || []).map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.obras?.nome || '—'}</TableCell>
                    <TableCell>{a.data_inicio || '—'}</TableCell>
                    <TableCell>{a.data_fim || 'Em andamento'}</TableCell>
                    <TableCell>{a.funcao || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ===== BANCO DE HORAS / FALTAS ===== */}
          <TabsContent value="banco-horas" className="space-y-6 mt-4">
            {/* Alerta 3ª falta injustificada */}
            {(() => {
              const faltasInjustificadas = (faltasLicencas || []).filter(f => f.tipo === 'falta_injustificada').length;
              if (faltasInjustificadas >= 3) {
                return (
                  <div className="p-4 rounded-lg border border-destructive bg-destructive/10">
                    <p className="text-sm font-bold text-destructive">⚠️ Atenção: {faltasInjustificadas} faltas injustificadas</p>
                    <p className="text-xs text-destructive/80 mt-1">
                      A partir da 3ª falta sem justificativa, este colaborador não recebe mais dispensa remunerada. 
                      Horas extras devem ser convertidas em banco de horas (a compensar).
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium text-muted-foreground">Saldo Banco de Horas</p>
              <p className={`text-2xl font-bold ${saldoBancoHoras >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {saldoBancoHoras.toFixed(1)}h
              </p>
            </div>

            {/* Novo lançamento banco de horas */}
            <div>
              <p className="font-semibold mb-2">Lançar Horas</p>
              <div className="flex gap-2 items-end flex-wrap">
                <div>
                  <Label>Tipo</Label>
                  <Select value={newBancoHoras.tipo} onValueChange={v => setNewBancoHoras(p => ({ ...p, tipo: v }))}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Horas</Label>
                  <Input type="number" step="0.5" value={newBancoHoras.horas} onChange={e => setNewBancoHoras(p => ({ ...p, horas: e.target.value }))} className="w-20" />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={newBancoHoras.data} onChange={e => setNewBancoHoras(p => ({ ...p, data: e.target.value }))} className="w-36" />
                </div>
                <div>
                  <Label>Motivo</Label>
                  <Input value={newBancoHoras.motivo} onChange={e => setNewBancoHoras(p => ({ ...p, motivo: e.target.value }))} className="w-40" />
                </div>
                <Button size="sm" onClick={async () => {
                  if (!newBancoHoras.horas || !newBancoHoras.data) return;
                  await createBancoHoras.mutateAsync({
                    colaborador_id: colaboradorId,
                    tipo: newBancoHoras.tipo,
                    horas: Number(newBancoHoras.horas),
                    data: newBancoHoras.data,
                    motivo: newBancoHoras.motivo || null,
                  } as any);
                  setNewBancoHoras({ tipo: 'credito', horas: '', data: '', motivo: '' });
                  toast.success('Lançamento registrado');
                }}>
                  <Plus className="w-4 h-4 mr-1" /> Lançar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(bancoHoras || []).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Nenhum lançamento</TableCell></TableRow>
                  ) : (bancoHoras || []).map((bh: any) => (
                    <TableRow key={bh.id}>
                      <TableCell>
                        <Badge variant={bh.tipo === 'credito' ? 'default' : 'destructive'}>
                          {bh.tipo === 'credito' ? '+' : '−'} {bh.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{Number(bh.horas).toFixed(1)}h</TableCell>
                      <TableCell>{bh.data}</TableCell>
                      <TableCell>{bh.motivo || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Faltas e Licenças */}
            <div>
              <p className="font-semibold mb-2">Faltas e Licenças</p>
              <div className="flex gap-2 items-end flex-wrap">
                <div>
                  <Label>Tipo</Label>
                  <Select value={newFalta.tipo} onValueChange={v => setNewFalta(p => ({ ...p, tipo: v }))}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="falta_justificada">Falta Justificada</SelectItem>
                      <SelectItem value="falta_injustificada">Falta Injustificada</SelectItem>
                      <SelectItem value="licenca">Licença</SelectItem>
                      <SelectItem value="afastamento">Afastamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Início</Label>
                  <Input type="date" value={newFalta.data_inicio} onChange={e => setNewFalta(p => ({ ...p, data_inicio: e.target.value }))} className="w-36" />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input type="date" value={newFalta.data_fim} onChange={e => setNewFalta(p => ({ ...p, data_fim: e.target.value }))} className="w-36" />
                </div>
                <Button size="sm" onClick={async () => {
                  if (!newFalta.data_inicio) return;
                  await createFaltaLicenca.mutateAsync({
                    colaborador_id: colaboradorId,
                    tipo: newFalta.tipo,
                    data_inicio: newFalta.data_inicio,
                    data_fim: newFalta.data_fim || null,
                    remunerada: newFalta.tipo === 'licenca',
                    observacoes: newFalta.observacoes || null,
                  } as any);
                  setNewFalta({ tipo: 'falta_justificada', data_inicio: '', data_fim: '', remunerada: true, observacoes: '' });
                  toast.success('Registro adicionado');
                }}>
                  <Plus className="w-4 h-4 mr-1" /> Registrar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Remunerada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(faltasLicencas || []).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Nenhum registro</TableCell></TableRow>
                  ) : (faltasLicencas || []).map((fl: any) => (
                    <TableRow key={fl.id}>
                      <TableCell>{fl.tipo.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{fl.data_inicio}</TableCell>
                      <TableCell>{fl.data_fim || '—'}</TableCell>
                      <TableCell>{fl.remunerada ? 'Sim' : 'Não'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ColaboradorDetailModal;
