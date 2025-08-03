
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Edit, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ObrasAgendadas = () => {
  const [editandoObra, setEditandoObra] = useState<any>(null);

  const obrasAgendadas = [
    {
      id: 1,
      nome: 'Instalação Elétrica Escritório',
      cliente: 'Empresa Alfa',
      endereco: 'Centro Empresarial, Sala 205',
      escopo: 'Instalação completa de sistema elétrico',
      responsavel: 'João Silva',
      dataInicio: '2024-02-20',
      observacoes: 'Cliente solicitou início após horário comercial',
      pendencias: 'Aguardando aprovação do condomínio'
    },
    {
      id: 2,
      nome: 'Reforma Elétrica Residencial',
      cliente: 'Família Oliveira',
      endereco: 'Rua das Acácias, 456',
      escopo: 'Troca de fiação antiga e instalação de novos pontos',
      responsavel: 'Maria Santos',
      dataInicio: '2024-02-25',
      observacoes: 'Casa ocupada, trabalho aos finais de semana',
      pendencias: 'Definir detalhes dos novos pontos'
    },
    {
      id: 3,
      nome: 'Instalação Industrial',
      cliente: 'Metalúrgica Gama',
      endereco: 'Distrito Industrial, Galpão 12',
      escopo: 'Sistema elétrico para nova linha de produção',
      responsavel: 'Carlos Pereira',
      dataInicio: '2024-03-05',
      observacoes: 'Obra de grande porte, equipe ampliada',
      pendencias: 'Aguardando entrega dos equipamentos especiais'
    }
  ];

  const editarAgendamento = (obra: any) => {
    setEditandoObra(obra);
  };

  const salvarEdicao = () => {
    console.log('Salvando edição:', editandoObra);
    setEditandoObra(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Obras Agendadas</h1>
          <p className="text-slate-600 mt-1">Próximas obras programadas para execução</p>
        </div>

        <div className="grid gap-6">
          {obrasAgendadas.map((obra) => (
            <Card key={obra.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{obra.nome}</CardTitle>
                    <p className="text-slate-600 mt-1">{obra.cliente}</p>
                  </div>
                  <Badge variant="secondary">
                    <Calendar className="w-3 h-3 mr-1" />
                    {obra.dataInicio}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Local</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-900">{obra.endereco}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Responsável</h4>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-900">{obra.responsavel}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">Escopo</h4>
                  <p className="text-slate-900">{obra.escopo}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">Observações</h4>
                  <p className="text-slate-600 text-sm">{obra.observacoes}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">Pendências Pré-Obra</h4>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-700 text-sm">{obra.pendencias}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => editarAgendamento(obra)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Agendamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Editar Agendamento - {obra.nome}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cliente">Cliente</Label>
                            <Input defaultValue={obra.cliente} />
                          </div>
                          <div>
                            <Label htmlFor="dataInicio">Data de Início</Label>
                            <Input type="date" defaultValue={obra.dataInicio} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="endereco">Endereço</Label>
                          <Input defaultValue={obra.endereco} />
                        </div>
                        <div>
                          <Label htmlFor="escopo">Escopo</Label>
                          <Textarea defaultValue={obra.escopo} />
                        </div>
                        <div>
                          <Label htmlFor="responsavel">Responsável</Label>
                          <Input defaultValue={obra.responsavel} />
                        </div>
                        <div>
                          <Label htmlFor="observacoes">Observações</Label>
                          <Textarea defaultValue={obra.observacoes} />
                        </div>
                        <div>
                          <Label htmlFor="pendencias">Pendências</Label>
                          <Textarea defaultValue={obra.pendencias} />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancelar</Button>
                          <Button onClick={salvarEdicao}>Salvar Alterações</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ObrasAgendadas;
