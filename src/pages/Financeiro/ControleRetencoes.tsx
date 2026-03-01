
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ControleRetencoes = () => {
  const navigate = useNavigate();
  const [retencoes] = useState<any[]>([]);

  const handleAcompanhar = (retencaoIndex: number) => {
    navigate(`/retencoes/${retencaoIndex + 1}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Controle de Retenções</h1>
          <p className="text-muted-foreground mt-1">Acompanhar valores retidos e prazos de liberação</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Retido</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0</div>
              <p className="text-xs text-muted-foreground">Aguardando liberação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liberações Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liberado Este Mês</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 0</div>
              <p className="text-xs text-muted-foreground">Sem dados</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Retenções por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {retencoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma retenção registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {retencoes.map((retencao: any, index: number) => (
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
                        <h4 className="font-semibold text-foreground">{retencao.cliente}</h4>
                        <p className="text-sm text-muted-foreground">{retencao.tipo} - {retencao.valor}</p>
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ControleRetencoes;
