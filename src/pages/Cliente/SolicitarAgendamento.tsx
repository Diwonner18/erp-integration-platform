import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

const agendamentoSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  telefone: z.string().trim().min(8, 'Telefone inválido').max(20),
  email: z.string().trim().email('Email inválido').max(255),
  tipoServico: z.string().trim().min(1, 'Selecione o tipo de serviço').max(200),
  dataPreferida: z.string().min(1, 'Data é obrigatória'),
  horario: z.string().min(1, 'Selecione um horário'),
  endereco: z.string().trim().min(10, 'Endereço deve ter pelo menos 10 caracteres').max(500),
  descricao: z.string().trim().min(20, 'Descrição deve ter pelo menos 20 caracteres').max(2000),
  prioridade: z.string().min(1, 'Selecione a prioridade'),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

const SolicitarAgendamento = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      nome: user?.name || '',
      email: user?.email || '',
    },
  });

  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const createAgendamento = useMutation({
    mutationFn: async (formData: AgendamentoFormData) => {
      const { error } = await supabase.from('agendamentos').insert({
        user_id: user!.id,
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        tipo_servico: formData.tipoServico,
        data_preferida: formData.dataPreferida,
        horario: formData.horario,
        endereco: formData.endereco,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast({
        title: 'Agendamento solicitado',
        description: 'Sua solicitação foi enviada e será confirmada em até 24 horas',
      });
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao enviar a solicitação',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AgendamentoFormData) => {
    createAgendamento.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pendente: { label: 'Pendente', variant: 'secondary' },
      confirmada: { label: 'Confirmada', variant: 'default' },
      cancelada: { label: 'Cancelada', variant: 'destructive' },
      concluida: { label: 'Concluída', variant: 'outline' },
    };
    const item = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold text-foreground">Solicitar Agendamento</h1>
          <p className="text-muted-foreground mt-1">Programe uma nova obra ou manutenção</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-tour="page-form">
            <CardHeader>
              <CardTitle>Detalhes do Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nome *</label>
                    <Input placeholder="Seu nome completo" className="mt-1" {...register('nome')} />
                    {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email *</label>
                    <Input type="email" placeholder="seu@email.com" className="mt-1" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Telefone *</label>
                  <Input placeholder="(11) 99999-9999" className="mt-1" {...register('telefone')} />
                  {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Tipo de Serviço *</label>
                  <Input placeholder="Descreva o tipo de serviço desejado" className="mt-1" {...register('tipoServico')} />
                  {errors.tipoServico && <p className="text-sm text-destructive mt-1">{errors.tipoServico.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Data Preferida *</label>
                    <Input type="date" className="mt-1" {...register('dataPreferida')} />
                    {errors.dataPreferida && <p className="text-sm text-destructive mt-1">{errors.dataPreferida.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Horário *</label>
                    <select className="w-full mt-1 p-2 border rounded-md bg-background text-foreground" {...register('horario')}>
                      <option value="">Selecione o horário</option>
                      <option value="manha">Manhã (8h-12h)</option>
                      <option value="tarde">Tarde (13h-17h)</option>
                      <option value="dia-todo">Dia todo</option>
                    </select>
                    {errors.horario && <p className="text-sm text-destructive mt-1">{errors.horario.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Endereço completo da obra (incluindo CEP) *</label>
                  <Input placeholder="Rua, número, bairro, cidade, estado, CEP" className="mt-1" {...register('endereco')} />
                  {errors.endereco && <p className="text-sm text-destructive mt-1">{errors.endereco.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Descrição do Serviço *</label>
                  <Textarea placeholder="Descreva detalhadamente o serviço necessário..." className="mt-1" rows={4} {...register('descricao')} />
                  {errors.descricao && <p className="text-sm text-destructive mt-1">{errors.descricao.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Prioridade *</label>
                  <select className="w-full mt-1 p-2 border rounded-md bg-background text-foreground" {...register('prioridade')}>
                    <option value="">Selecione a prioridade</option>
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                    <option value="emergencia">Emergência</option>
                  </select>
                  {errors.prioridade && <p className="text-sm text-destructive mt-1">{errors.prioridade.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={createAgendamento.isPending} data-tour="page-actions">
                  {createAgendamento.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                  ) : (
                    <><Calendar className="w-4 h-4 mr-2" />Enviar Solicitação</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Agendamentos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAgendamentos ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : agendamentos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum agendamento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agendamentos.map((ag: any) => (
                      <div key={ag.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-foreground">{ag.tipo_servico}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(ag.data_preferida).toLocaleDateString('pt-BR')} — {ag.horario}
                            </p>
                          </div>
                          {getStatusBadge(ag.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Agendamentos são confirmados em até 24 horas</p>
                  <p>• Para emergências, ligue: (11) 9999-9999</p>
                  <p>• Serviços residenciais: 8h às 18h</p>
                  <p>• Serviços comerciais: 6h às 22h</p>
                  <p>• Orçamento gratuito para todos os serviços</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SolicitarAgendamento;
