
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Search } from 'lucide-react';

const ObrasConcluidas = () => {
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const obrasConcluidas = [
    {
      nome: 'Instalação Elétrica Residencial',
      cliente: 'João Silva',
      endereco: 'Rua das Flores, 123',
      metragem: '120 m²',
      dataInicio: '2024-01-15',
      dataFim: '2024-02-28',
      responsavel: 'Carlos Pereira',
      statusFinal: 'Concluída com Sucesso'
    },
    {
      nome: 'Reforma Comercial',
      cliente: 'Maria Santos',
      endereco: 'Av. Principal, 456',
      metragem: '200 m²',
      dataInicio: '2024-02-01',
      dataFim: '2024-03-15',
      responsavel: 'Ana Costa',
      statusFinal: 'Concluída com Sucesso'
    },
    {
      nome: 'Instalação Industrial',
      cliente: 'Empresa ABC Ltda',
      endereco: 'Distrito Industrial, 789',
      metragem: '500 m²',
      dataInicio: '2024-01-10',
      dataFim: '2024-04-20',
      responsavel: 'Roberto Lima',
      statusFinal: 'Concluída com Sucesso'
    }
  ];

  const exportarPDF = () => {
    console.log('Exportando para PDF...');
  };

  const exportarExcel = () => {
    console.log('Exportando para Excel...');
  };

  const filteredObras = obrasConcluidas.filter(obra => {
    const matchesMes = !filtroMes || obra.dataFim.includes(`2024-${filtroMes}`);
    const matchesCliente = !filtroCliente || obra.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    const matchesTipo = !filtroTipo || obra.nome.toLowerCase().includes(filtroTipo.toLowerCase());
    const matchesSearch = !searchTerm || 
      obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesMes && matchesCliente && matchesTipo && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Obras Concluídas</h1>
          <p className="text-slate-600 mt-1">Histórico completo de obras finalizadas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="mes">Mês</Label>
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input 
                  placeholder="Nome do cliente"
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de Obra</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de obra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="busca">Busca Geral</Label>
                <Input 
                  placeholder="Nome, cliente ou endereço"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Obras Concluídas</CardTitle>
              <div className="flex gap-2">
                <Button onClick={exportarPDF} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={exportarExcel} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Obra</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Metragem</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObras.map((obra, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{obra.nome}</TableCell>
                    <TableCell>{obra.cliente}</TableCell>
                    <TableCell>{obra.endereco}</TableCell>
                    <TableCell>{obra.metragem}</TableCell>
                    <TableCell>{obra.dataInicio}</TableCell>
                    <TableCell>{obra.dataFim}</TableCell>
                    <TableCell>{obra.responsavel}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {obra.statusFinal}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ObrasConcluidas;
