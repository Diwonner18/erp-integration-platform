import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

export interface FilterValues {
  obra: string;
  dataInicial: Date | null;
  dataFinal: Date | null;
  status: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  obras: { id: string; nome: string }[];
  statusOptions: { value: string; label: string }[];
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  obras,
  statusOptions,
  className
}) => {
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Aplicar filtros imediatamente - sem validação obrigatória
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      obra: '',
      dataInicial: null,
      dataFinal: null,
      status: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  

  return (
    <Card className={cn("mb-6", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-primary">Filtros Avançados</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Obra */}
            <div className="space-y-2">
              <Label htmlFor="obra" className="text-sm font-medium">
                Obra
              </Label>
              <Select 
                value={filters.obra} 
                onValueChange={(value) => handleFilterChange('obra', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma obra" />
                </SelectTrigger>
                <SelectContent>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Data Inicial
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dataInicial && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dataInicial ? (
                      format(filters.dataInicial, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dataInicial || undefined}
                    onSelect={(date) => handleFilterChange('dataInicial', date || null)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Data Final
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dataFinal && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dataFinal ? (
                      format(filters.dataFinal, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dataFinal || undefined}
                    onSelect={(date) => handleFilterChange('dataFinal', date || null)}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => 
                      filters.dataInicial ? date < filters.dataInicial : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Status
              </Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};