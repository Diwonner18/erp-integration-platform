import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search } from 'lucide-react';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState as us2, useMemo } from 'react';

const ObrasConcluidas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({ obra: '', dataInicial: null, dataFinal: null, status: '' });
  const obrasConcluidas: any[] = [];
  const obras: { id: string; nome: string }[] = [];
  const statusOptions = [{ value: 'concluida', label: 'Concluída' }];
  const exportarPDF = () => {};
  const exportarExcel = () => {};

  const filteredObras = useMemo(() => {
    let result = obrasConcluidas;
    if (filters.obra) result = result.filter(obra => obra.obraId === filters.obra);
    if (filters.dataInicial && filters.dataFinal) result = result.filter(obra => { const d = new Date(obra.dataFim); return d >= filters.dataInicial! && d <= filters.dataFinal!; });
    if (filters.status) result = result.filter(obra => obra.status === filters.status);
    if (searchTerm) result = result.filter(obra => obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) || obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || obra.endereco.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [obrasConcluidas, filters, searchTerm]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-title text-foreground">Obras Concluídas</h1>
          <p className="text-muted-foreground mt-1">Histórico completo de obras finalizadas</p>
        </div>
        <AdvancedFilters onFiltersChange={setFilters} obras={obras} statusOptions={statusOptions} />
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar por nome, cliente ou endereço..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">Exibindo {filteredObras.length} de {obrasConcluidas.length} obras</div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Obras Concluídas</CardTitle>
              <div className="flex gap-2">
                <Button onClick={exportarPDF} variant="outline"><Download className="w-4 h-4 mr-2" />PDF</Button>
                <Button onClick={exportarExcel} variant="outline"><Download className="w-4 h-4 mr-2" />Excel</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Obra</TableHead><TableHead>Cliente</TableHead><TableHead>Endereço</TableHead>
                  <TableHead>Metragem</TableHead><TableHead>Data Início</TableHead><TableHead>Data Fim</TableHead>
                  <TableHead>Responsável</TableHead><TableHead>Status Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObras.map((obra, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{obra.nome}</TableCell>
                    <TableCell>{obra.cliente}</TableCell><TableCell>{obra.endereco}</TableCell>
                    <TableCell>{obra.metragem}</TableCell><TableCell>{obra.dataInicio}</TableCell>
                    <TableCell>{obra.dataFim}</TableCell><TableCell>{obra.responsavel}</TableCell>
                    <TableCell><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{obra.statusFinal}</span></TableCell>
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
