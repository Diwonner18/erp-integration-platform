import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { AlertTriangle, Calendar, Users, Eye, FileText } from 'lucide-react';
import ObservacoesFaseModal from '@/components/Obras/ObservacoesFaseModal';

const ObrasEmAndamento = () => {
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });
  const [showObservacoesFase, setShowObservacoesFase] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState<{ id: string; nome: string } | null>(null);

  const obrasEmAndamento: any[] = [];

  const obras: { id: string; nome: string }[] = [];

  const statusOptions = [
    { value: 'executando', label: 'Em Execução' },
    { value: 'atrasada', label: 'Atrasada' },
    { value: 'adiantada', label: 'Adiantada' },
    { value: 'pausada', label: 'Pausada' }
  ];

  const filteredObras = useMemo(() => {
    let result = obrasEmAndamento;

    // Aplicar filtros avançados individualmente
    if (filters.obra) {
      result = result.filter(obra => obra.obraId === filters.obra);
    }

    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(obra => {
        const obraDate = new Date(obra.dataPrevista);
        return obraDate >= filters.dataInicial! && obraDate <= filters.dataFinal!;
      });
    }

    if (filters.status) {
      result = result.filter(obra => obra.status === filters.status);
    }

    return result;
  }, [obrasEmAndamento, filters]);

  const verDetalhes = (obra: string) => {
  };

  const handleObservacoesFase = (obraId: string, obraNome: string) => {
    setObraSelecionada({ id: obraId, nome: obraNome });
    setShowObservacoesFase(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-title text-foreground">Obras em Andamento</h1>
          <p className="text-muted-foreground mt-1">Acompanhamento de obras ativas</p>
        </div>

        <AdvancedFilters
          onFiltersChange={setFilters}
          obras={obras}
          statusOptions={statusOptions}
        />

        <div className="text-sm text-muted-foreground mb-4">
          Exibindo {filteredObras.length} de {obrasEmAndamento.length} obras
        </div>

        <div className="grid gap-6">
          {filteredObras.map((obra, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{obra.nome}</CardTitle>
                    <p className="text-muted-foreground mt-1">{obra.cliente} - {obra.endereco}</p>
                  </div>
                  {obra.alertaAtraso && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Atraso
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Etapa Atual</h4>
                    <p className="text-foreground">{obra.etapaAtual}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Data Prevista</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className={obra.alertaAtraso ? 'text-red-600' : 'text-foreground'}>
                        {obra.dataPrevista}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm text-foreground">Progresso</h4>
                    <span className="text-sm font-medium">{obra.progresso}%</span>
                  </div>
                  <Progress value={obra.progresso} className="h-2" />
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Equipe Responsável</h4>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{obra.equipeResponsavel.join(', ')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Observações</h4>
                  <p className="text-muted-foreground text-sm">{obra.observacoes}</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => handleObservacoesFase(obra.obraId, obra.nome)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Observações por Fase
                  </Button>
                  <Button onClick={() => verDetalhes(obra.nome)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver mais detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de Observações por Fase */}
        {obraSelecionada && (
          <ObservacoesFaseModal
            open={showObservacoesFase}
            onClose={() => {
              setShowObservacoesFase(false);
              setObraSelecionada(null);
            }}
            obraId={obraSelecionada.id}
            obraNome={obraSelecionada.nome}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ObrasEmAndamento;
