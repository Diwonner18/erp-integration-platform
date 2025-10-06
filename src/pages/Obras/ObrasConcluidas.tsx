import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search } from 'lucide-react';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';

const ObrasConcluidas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const obrasConcluidas = [
    {
      id: 1,
      obraId: '1',
      nome: 'Instalação Elétrica Residencial',
      cliente: 'João Silva',
      endereco: 'Rua das Flores, 123',
      metragem: '120 m²',
      dataInicio: '2024-01-15',
      dataFim: '2024-02-28',
      responsavel: 'Carlos Pereira',
      statusFinal: 'Concluída com Sucesso',
      status: 'concluida'
    },
    {
      id: 2,
      obraId: '2',
      nome: 'Reforma Comercial',
      cliente: 'Maria Santos',
      endereco: 'Av. Principal, 456',
      metragem: '200 m²',
      dataInicio: '2024-02-01',
      dataFim: '2024-03-15',
      responsavel: 'Ana Costa',
      statusFinal: 'Concluída com Sucesso',
      status: 'concluida'
    },
    {
      id: 3,
      obraId: '3',
      nome: 'Instalação Industrial',
      cliente: 'Empresa ABC Ltda',
      endereco: 'Distrito Industrial, 789',
      metragem: '500 m²',
      dataInicio: '2024-01-10',
      dataFim: '2024-04-20',
      responsavel: 'Roberto Lima',
      statusFinal: 'Concluída com Sucesso',
      status: 'concluida'
    }
  ];

  const obras = [
    { id: '1', nome: 'Instalação Elétrica Residencial' },
    { id: '2', nome: 'Reforma Comercial' },
    { id: '3', nome: 'Instalação Industrial' }
  ];

  const statusOptions = [
    { value: 'concluida', label: 'Concluída' }
  ];

  const exportarPDF = () => {
    console.log('Exportando para PDF...');
  };

  const exportarExcel = () => {
    console.log('Exportando para Excel...');
  };

  const filteredObras = useMemo(() => {
    let result = obrasConcluidas;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(obra => obra.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(obra => {
        const obraDate = new Date(obra.dataFim);
        return obraDate >= filters.dataInicial! && obraDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(obra => obra.status === filters.status);
    }

    // Aplicar busca textual
    if (searchTerm) {
      result = result.filter(obra => 
        obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.endereco.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [obrasConcluidas, filters, searchTerm]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Obras Concluídas</h1>
          <p className="text-slate-600 mt-1">Histórico completo de obras finalizadas</p>
        </div>

        <AdvancedFilters
          onFiltersChange={setFilters}
          obras={obras}
          statusOptions={statusOptions}
        />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar por nome, cliente ou endereço..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-600">
            Exibindo {filteredObras.length} de {obrasConcluidas.length} obras
          </div>
        </div>

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
