
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Clock, FileText, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Automacao = () => {
  const { toast } = useToast();
  const [automations, setAutomations] = useState([
    {
      title: 'Envio Automático de Propostas',
      description: 'Envio automático de propostas por email após aprovação',
      icon: FileText,
      status: true,
      lastRun: '2 horas atrás'
    },
    {
      title: 'Geração de Boletins de Medição',
      description: 'Criação automática de boletins baseada nas medições inseridas',
      icon: Zap,
      status: true,
      lastRun: '1 dia atrás'
    },
    {
      title: 'Notificações de Vencimento',
      description: 'Alertas automáticos para pagamentos em atraso',
      icon: Clock,
      status: false,
      lastRun: '5 dias atrás'
    },
    {
      title: 'Backup Automático',
      description: 'Backup diário dos dados do sistema',
      icon: Settings,
      status: true,
      lastRun: '6 horas atrás'
    }
  ]);

  const handleToggleAutomation = (index: number) => {
    const automation = automations[index];
    const newStatus = !automation.status;
    
    // Update otimista - interface atualiza instantaneamente
    setAutomations(prev => {
      const newAutomations = [...prev];
      newAutomations[index].status = newStatus;
      return newAutomations;
    });
    
    toast({
      title: `Automação ${newStatus ? 'ativada' : 'pausada'}`,
      description: `"${automation.title}" foi ${newStatus ? 'ativada' : 'pausada'} com sucesso`,
    });

    // Simula chamada API em background
    setTimeout(() => {
      console.log('Automação sincronizada com backend');
    }, 100);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Controle de Automação</h1>
          <p className="text-slate-600 mt-1">Gerenciar fluxos automáticos do sistema</p>
        </div>

        <div className="grid gap-6">
          {automations.map((automation, index) => (
            <Card key={index} className="transition-all duration-150 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <automation.icon className="w-5 h-5 mr-2 transition-colors duration-150" />
                    <CardTitle className="text-lg">{automation.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={automation.status ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleAutomation(index)}
                      className="transition-all duration-150 hover:scale-105"
                    >
                      {automation.status ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                    <Switch 
                      checked={automation.status}
                      onCheckedChange={() => handleToggleAutomation(index)}
                      className="transition-all duration-150"
                    />
                  </div>
                </div>
                <CardDescription>{automation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Última execução: {automation.lastRun}</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                    automation.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {automation.status ? 'Ativo' : 'Pausado'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Automacao;
