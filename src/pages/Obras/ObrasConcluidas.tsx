import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, CheckCircle } from 'lucide-react';
import { useObras } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const ObrasConcluidas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: todasObras = [], isLoading } = useObras();
  const obrasConcluidas = todasObras.filter(o => o.status === 'concluida');

  const filteredObras = useMemo(() => {
    if (!searchTerm) return obrasConcluidas;
    return obrasConcluidas.filter(o =>
      o.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.clientes?.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.endereco || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [obrasConcluidas, searchTerm]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold font-title text-foreground">Obras Concluídas</h1>
          <p className="text-muted-foreground mt-1">Histórico completo de obras finalizadas</p>
        </div>
        <div className="flex items-center space-x-4" data-tour="page-search">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">Exibindo {filteredObras.length} obras</div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : filteredObras.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma obra concluída</p>
          </div>
        ) : (
          <Card data-tour="page-list">
            <CardHeader><CardTitle>Lista de Obras Concluídas</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead><TableHead>Cliente</TableHead><TableHead>Endereço</TableHead>
                    <TableHead>Início</TableHead><TableHead>Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObras.map((obra) => (
                    <TableRow key={obra.id}>
                      <TableCell className="font-medium">{obra.nome}</TableCell>
                      <TableCell>{obra.clientes?.razao_social || '-'}</TableCell>
                      <TableCell>{obra.endereco || '-'}</TableCell>
                      <TableCell>{obra.data_inicio ? new Date(obra.data_inicio).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>{obra.data_conclusao ? new Date(obra.data_conclusao).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ObrasConcluidas;
