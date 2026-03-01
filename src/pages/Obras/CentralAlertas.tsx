
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, TrendingDown, UserX, Download, Bell } from 'lucide-react';

const CentralAlertas = () => {
  const alertas: any[] = [];

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'baixa': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'atraso': return <Clock className="w-5 h-5" />;
      case 'produtividade': return <TrendingDown className="w-5 h-5" />;
      case 'cancelamento': return <AlertTriangle className="w-5 h-5" />;
      case 'sobrecarga': return <UserX className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const exportarAlertas = () => {};
  const notificarResponsavel = (alerta: any) => {};

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Central de Alertas</h1>
            <p className="text-slate-600 mt-1">Avisos automáticos e notificações do sistema</p>
          </div>
          <Button onClick={exportarAlertas} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Alertas
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Alertas Críticos</p>
                  <p className="text-2xl font-bold text-red-700">2</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Alertas Médios</p>
                  <p className="text-2xl font-bold text-orange-700">2</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Alertas Baixos</p>
                  <p className="text-2xl font-bold text-yellow-700">1</p>
                </div>
                <TrendingDown className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {alertas.map((alerta) => (
            <Card key={alerta.id} className={`border-l-4 ${getPrioridadeColor(alerta.prioridade).replace('bg-', 'border-').replace('-100', '-500')}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getPrioridadeColor(alerta.prioridade)}`}>
                      {getTipoIcon(alerta.tipo)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{alerta.titulo}</CardTitle>
                      <p className="text-slate-600 mt-1">{alerta.descricao}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPrioridadeColor(alerta.prioridade)}>
                    {alerta.prioridade.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-600">Data do Alerta</p>
                    <p className="font-medium">{alerta.dataAlerta}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Responsável</p>
                    <p className="font-medium">{alerta.responsavel}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-1">Detalhes</p>
                  <p className="text-slate-900">{alerta.detalhes}</p>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => notificarResponsavel(alerta)}
                    variant="outline"
                    size="sm"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notificar Responsável
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CentralAlertas;
