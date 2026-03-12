
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Calendar, ClipboardList, Users, AlertTriangle } from 'lucide-react';
import { useObras, useProgramacoes } from '@/hooks/useSupabaseData';

const RelatoriosObra = () => {
  const navigate = useNavigate();
  const handleCardClick = (route: string) => { navigate(route); };

  const { data: obras, isLoading: loadingObras } = useObras();
  const { data: programacoes, isLoading: loadingProg } = useProgramacoes();
  const isLoading = loadingObras || loadingProg;

  const stats = useMemo(() => {
    const list = obras || [];
    const concluidas = list.filter(o => o.status === 'concluida').length;
    const emAndamento = list.filter(o => o.status === 'em_andamento').length;
    const agendadas = list.filter(o => o.status === 'programada' || o.status === 'programacao_pendente').length;

    // Equipe ativa: unique members from active programacoes
    const activeProg = (programacoes || []).filter(p => ['programada', 'confirmada', 'em_execucao'].includes(p.status));
    const membrosSet = new Set<string>();
    activeProg.forEach(p => {
      if (Array.isArray(p.equipe)) {
        (p.equipe as any[]).forEach(m => {
          const nome = typeof m === 'string' ? m : m?.nome || m?.name;
          if (nome) membrosSet.add(nome);
        });
      }
      if (p.responsavel) membrosSet.add(p.responsavel);
    });

    return { concluidas, emAndamento, agendadas, equipe: membrosSet.size };
  }, [obras, programacoes]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-title text-foreground">Relatórios de Obra</h1>
          <p className="text-muted-foreground mt-1">Acompanhar indicadores das obras</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleCardClick('/obras-concluidas')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Obras Concluídas</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.concluidas}</div><p className="text-xs text-muted-foreground">Total</p></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleCardClick('/obras-em-andamento')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Em Andamento</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.emAndamento}</div><p className="text-xs text-muted-foreground">Obras ativas</p></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleCardClick('/obras-agendadas')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Agendadas</CardTitle><ClipboardList className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.agendadas}</div><p className="text-xs text-muted-foreground">Próximas obras</p></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleCardClick('/equipe-ativa')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Equipe Ativa</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.equipe}</div><p className="text-xs text-muted-foreground">Funcionários</p></CardContent>
            </Card>
          </div>
        )}

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleCardClick('/central-alertas')}>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" />Central de Alertas</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Alertas ativos no sistema</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-red-600 font-semibold">0 Críticos</span>
                  <span className="text-orange-600 font-semibold">0 Médios</span>
                  <span className="text-yellow-600 font-semibold">0 Baixo</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-600">0</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Produtividade Mensal</CardTitle></CardHeader>
          <CardContent><div className="h-64 flex items-center justify-center text-muted-foreground">Gráfico de produtividade será implementado aqui</div></CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RelatoriosObra;
