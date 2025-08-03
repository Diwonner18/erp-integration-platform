import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const agendamentoSchema = z.object({
  tipoServico: z.string().min(1, 'Selecione o tipo de serviço'),
  dataPreferida: z.string().min(1, 'Data é obrigatória'),
  horario: z.string().min(1, 'Selecione um horário'),
  endereco: z.string().min(10, 'Endereço deve ter pelo menos 10 caracteres'),
  descricao: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  prioridade: z.string().min(1, 'Selecione a prioridade'),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

const SolicitarAgendamento = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
  });

  const onSubmit = async (data: AgendamentoFormData) => {
    setIsLoading(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Agendamento solicitado',
        description: 'Sua solicitação foi enviada e será confirmada em até 24 horas',
      });
      
      reset();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar a solicitação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Solicitar Agendamento</h1>
          <p className="text-slate-600 mt-1">Programe uma nova obra ou manutenção</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Tipo de Serviço</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    {...register('tipoServico')}
                  >
                    <option value="">Selecione o tipo de serviço</option>
                    <option value="residencial">Instalação Elétrica Residencial</option>
                    <option value="comercial">Instalação Elétrica Comercial</option>
                    <option value="automacao">Sistema de Automação</option>
                    <option value="manutencao">Manutenção Preventiva</option>
                    <option value="emergencia">Reparo de Emergência</option>
                  </select>
                  {errors.tipoServico && (
                    <p className="text-sm text-red-600 mt-1">{errors.tipoServico.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Data Preferida</label>
                    <Input 
                      type="date" 
                      className="mt-1" 
                      {...register('dataPreferida')}
                    />
                    {errors.dataPreferida && (
                      <p className="text-sm text-red-600 mt-1">{errors.dataPreferida.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Horário</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      {...register('horario')}
                    >
                      <option value="">Selecione o horário</option>
                      <option value="manha">Manhã (8h-12h)</option>
                      <option value="tarde">Tarde (13h-17h)</option>
                      <option value="dia-todo">Dia todo</option>
                    </select>
                    {errors.horario && (
                      <p className="text-sm text-red-600 mt-1">{errors.horario.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Endereço</label>
                  <Input 
                    placeholder="Endereço completo da obra" 
                    className="mt-1" 
                    {...register('endereco')}
                  />
                  {errors.endereco && (
                    <p className="text-sm text-red-600 mt-1">{errors.endereco.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Descrição do Serviço</label>
                  <Textarea 
                    placeholder="Descreva detalhadamente o serviço necessário..."
                    className="mt-1"
                    rows={4}
                    {...register('descricao')}
                  />
                  {errors.descricao && (
                    <p className="text-sm text-red-600 mt-1">{errors.descricao.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Prioridade</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    {...register('prioridade')}
                  >
                    <option value="">Selecione a prioridade</option>
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                    <option value="emergencia">Emergência</option>
                  </select>
                  {errors.prioridade && (
                    <p className="text-sm text-red-600 mt-1">{errors.prioridade.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Calendar className="w-4 h-4 mr-2" />
                  {isLoading ? 'Enviando...' : 'Enviar Solicitação'}
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
                <div className="space-y-3">
                  {[
                    { servico: 'Manutenção Preventiva', data: '2024-01-20', status: 'confirmado' },
                    { servico: 'Instalação Elétrica', data: '2024-01-15', status: 'concluido' },
                    { servico: 'Reparo Emergencial', data: '2024-01-10', status: 'concluido' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{item.servico}</p>
                        <p className="text-sm text-slate-600">{item.data}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'concluido' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status === 'concluido' ? 'Concluído' : 'Confirmado'}
                      </span>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3 text-sm text-slate-600">
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
