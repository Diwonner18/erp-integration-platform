
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ControleRetencoes = () => {
  const navigate = useNavigate();

  const handleAcompanhar = (retencaoIndex: number) => {
    navigate(`/retencoes/${retencaoIndex + 1}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Controle de Retenções</h1>
          <p className="text-slate-600 mt-1">Acompanhar valores retidos e prazos de liberação</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Retido</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 8.900</div>
              <p className="text-xs text-muted-foreground">Aguardando liberação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liberações Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liberado Este Mês</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 12.400</div>
              <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Retenções por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  cliente: 'ABC Construções', 
                  valor: 'R$ 3.200', 
                  tipo: 'INSS', 
                  vencimento: '15/02/2024', 
                  status: 'pendente',
                  dias: 12
                },
                { 
                  cliente: 'Silva Engenharia', 
                  valor: 'R$ 2.800', 
                  tipo: 'IRRF', 
                  vencimento: '20/02/2024', 
                  status: 'atrasado',
                  dias: -3
                },
                { 
                  cliente: 'Costa & Filhos', 
                  valor: 'R$ 1.900', 
                  tipo: 'INSS', 
                  vencimento: '28/02/2024', 
                  status: 'pendente',
                  dias: 20
                },
                { 
                  cliente: 'Mendes Construtora', 
                  valor: 'R$ 1.000', 
                  tipo: 'ISS', 
                  vencimento: '10/01/2024', 
                  status: 'liberado',
                  dias: null
                }
              ].map((retencao, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      retencao.status === 'liberado' ? 'bg-green-100' :
                      retencao.status === 'atrasado' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {retencao.status === 'liberado' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : retencao.status === 'atrasado' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{retencao.cliente}</h4>
                      <p className="text-sm text-slate-600">{retencao.tipo} - {retencao.valor}</p>
                      <p className="text-xs text-slate-500">
                        Vencimento: {retencao.vencimento}
                        {retencao.dias !== null && (
                          <span className={`ml-2 ${retencao.dias < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                            ({retencao.dias < 0 ? `${Math.abs(retencao.dias)} dias atraso` : `${retencao.dias} dias`})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      retencao.status === 'liberado' ? 'default' :
                      retencao.status === 'atrasado' ? 'destructive' : 'secondary'
                    }>
                      {retencao.status === 'liberado' ? 'Liberado' :
                       retencao.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                    </Badge>
                    {retencao.status !== 'liberado' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAcompanhar(index)}
                      >
                        Acompanhar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ControleRetencoes;
