
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, FileText, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Aprovacoes = () => {
  const { toast } = useToast();
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 1,
      title: 'Nova Forma de Pagamento - PIX',
      description: 'Cliente ABC Construções solicita inclusão do PIX como forma de pagamento',
      type: 'critical',
      icon: Shield,
      date: '2 horas atrás'
    },
    {
      id: 2,
      title: 'Alteração de Escopo - Obra Silva',
      description: 'Equipe de obras sugere alteração no escopo do projeto residencial',
      type: 'warning',
      icon: FileText,
      date: '1 dia atrás'
    },
    {
      id: 3,
      title: 'Novo Usuário - Equipe Comercial',
      description: 'Solicitação de criação de usuário para Carlos Mendes',
      type: 'normal',
      icon: CheckSquare,
      date: '3 dias atrás'
    }
  ]);

  const handleApprove = (item: any) => {
    // Update otimista - interface atualiza primeiro
    setPendingApprovals(prev => prev.filter(approval => approval.id !== item.id));
    
    toast({
      title: 'Item aprovado',
      description: `"${item.title}" foi aprovado com sucesso`,
    });

    // Simula chamada API em background (sem loading)
    setTimeout(() => {
      console.log('Aprovação sincronizada com backend');
    }, 100);
  };

  const handleReject = (item: any) => {
    // Update otimista - interface atualiza primeiro
    setPendingApprovals(prev => prev.filter(approval => approval.id !== item.id));
    
    toast({
      title: 'Item rejeitado',
      description: `"${item.title}" foi rejeitado`,
      variant: 'destructive',
    });

    // Simula chamada API em background (sem loading)
    setTimeout(() => {
      console.log('Rejeição sincronizada com backend');
    }, 100);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aprovações Pendentes</h1>
          <p className="text-slate-600 mt-1">Itens aguardando aprovação do administrador</p>
        </div>

        {pendingApprovals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhuma aprovação pendente
              </h3>
              <p className="text-slate-600">
                Todas as solicitações foram processadas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingApprovals.map((item) => (
              <Card key={item.id} className="transition-all duration-150 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150 ${
                        item.type === 'critical' ? 'bg-red-100' :
                        item.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <item.icon className={`w-5 h-5 ${
                          item.type === 'critical' ? 'text-red-600' :
                          item.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-slate-900">{item.title}</h3>
                          <Badge variant={
                            item.type === 'critical' ? 'destructive' :
                            item.type === 'warning' ? 'secondary' : 'outline'
                          } className="transition-colors duration-150">
                            {item.type === 'critical' ? 'Crítico' :
                             item.type === 'warning' ? 'Atenção' : 'Normal'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        <div className="flex items-center text-xs text-slate-500 mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(item)}
                        className="transition-all duration-150 hover:scale-105"
                      >
                        Rejeitar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(item)}
                        className="transition-all duration-150 hover:scale-105"
                      >
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Aprovacoes;
