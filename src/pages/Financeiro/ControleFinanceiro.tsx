
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign, 
  Calendar,
  Download,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ControleFinanceiro = () => {
  const { toast } = useToast();

  const handleExportar = (tipo: string) => {
    toast({
      title: "Exportação iniciada",
      description: `Exportando dados de ${tipo}`,
    });
  };

  const [contasReceber] = useState<any[]>([]);
  const [contasPagar] = useState<any[]>([]);

  const totalReceber = contasReceber.reduce((acc, conta) => acc + conta.valor, 0);
  const totalPagar = contasPagar.reduce((acc, conta) => acc + conta.valor, 0);
  const saldoLiquido = totalReceber - totalPagar;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>;
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'pago':
        return <Badge variant="default">Pago</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Controle Financeiro</h1>
            <p className="text-muted-foreground mt-1">Gestão de contas a pagar e receber</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportar('contas a receber')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Receber
            </Button>
            <Button variant="outline" onClick={() => handleExportar('contas a pagar')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Pagar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalReceber)}</div>
              <p className="text-xs text-muted-foreground">{contasReceber.length} contas pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalPagar)}</div>
              <p className="text-xs text-muted-foreground">{contasPagar.length} contas pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarMoeda(saldoLiquido)}
              </div>
              <p className="text-xs text-muted-foreground">Diferença entre receber e pagar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencimentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Contas vencendo hoje</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
              <CardTitle>Contas a Receber</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExportar('receber')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            {contasReceber.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma conta a receber</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasReceber.map((conta: any) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium">{conta.cliente}</TableCell>
                      <TableCell>{conta.obra}</TableCell>
                      <TableCell className="font-semibold text-green-600">{formatarMoeda(conta.valor)}</TableCell>
                      <TableCell>{formatarData(conta.vencimento)}</TableCell>
                      <TableCell>{getStatusBadge(conta.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowDownCircle className="h-5 w-5 text-red-600" />
              <CardTitle>Contas a Pagar</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExportar('pagar')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            {contasPagar.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowDownCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma conta a pagar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasPagar.map((conta: any) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                      <TableCell>{conta.categoria}</TableCell>
                      <TableCell className="font-semibold text-red-600">{formatarMoeda(conta.valor)}</TableCell>
                      <TableCell>{formatarData(conta.vencimento)}</TableCell>
                      <TableCell>{getStatusBadge(conta.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ControleFinanceiro;
