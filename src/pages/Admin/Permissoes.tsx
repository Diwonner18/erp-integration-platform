import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Shield, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAllPermissoesPerfil, useUpsertPermissoesPerfil, PermissaoPerfil } from '@/hooks/usePermissoesPerfil';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const PERFIS = [
  { key: 'obras', label: 'Obras' },
  { key: 'financeira', label: 'Financeiro' },
  { key: 'comercial', label: 'Comercial' },
  { key: 'cliente', label: 'Cliente' },
];

const MODULO_LABELS: Record<string, string> = {
  propostas: 'Propostas',
  medicoes: 'Medições',
  colaboradores: 'Colaboradores',
  epis: 'EPIs',
  horas_extras: 'Horas Extras',
  materiais: 'Materiais',
  equipamentos: 'Equipamentos',
  programacoes: 'Programações',
  despesas: 'Despesas',
  boletins: 'Boletins de Medição',
  relatorios_diarios: 'Relatório Diário (RDO)',
  alteracoes_escopo: 'Alterações de Escopo',
  valores_unitarios: 'Valores Unitários',
  aceites: 'Aceites Digitais',
  modelos_contrato: 'Modelos de Contrato',
  relatorios_comerciais: 'Relatórios Comerciais',
  financeiro: 'Controle Financeiro',
  retencoes: 'Retenções',
  fechamento_mensal: 'Fechamento Mensal',
  exportar_dados: 'Exportar Dados',
  relatorios_financeiros: 'Relatórios Financeiros',
  relatorios_obra: 'Relatórios de Obra',
};

const ACOES = [
  { key: 'acesso_modulo' as const, label: 'Acesso' },
  { key: 'pesquisar' as const, label: 'Pesquisar' },
  { key: 'incluir_editar' as const, label: 'Incluir/Editar' },
  { key: 'excluir' as const, label: 'Excluir' },
];

const Permissoes = () => {
  const { toast } = useToast();
  const { data: allPermissions, isLoading } = useAllPermissoesPerfil();
  const upsertMutation = useUpsertPermissoesPerfil();
  const [localPermissions, setLocalPermissions] = useState<PermissaoPerfil[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activePerfil, setActivePerfil] = useState('obras');

  useEffect(() => {
    if (allPermissions) {
      setLocalPermissions(allPermissions);
    }
  }, [allPermissions]);

  // Auto-save after 1.5s of inactivity
  useEffect(() => {
    if (!hasChanges) return;
    const timer = setTimeout(() => handleSave(), 1500);
    return () => clearTimeout(timer);
  }, [localPermissions, hasChanges]);

  const handleToggle = useCallback((perfil: string, modulo: string, acao: keyof PermissaoPerfil) => {
    setLocalPermissions(prev =>
      prev.map(p => {
        if (p.perfil === perfil && p.modulo === modulo) {
          return { ...p, [acao]: !p[acao] };
        }
        return p;
      })
    );
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync(localPermissions);
      setHasChanges(false);
      toast({ title: 'Permissões salvas', description: 'Alterações persistidas com sucesso.' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const perfilPermissions = localPermissions.filter(p => p.perfil === activePerfil);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div data-tour="page-header">
            <h1 className="text-3xl font-bold text-primary">Permissões do Sistema</h1>
            <p className="text-muted-foreground mt-1">Configure permissões por perfil de usuário</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Alterações pendentes
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || upsertMutation.isPending}
              data-tour="page-actions"
            >
              {upsertMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {hasChanges ? 'Salvar Agora' : 'Salvo'}
            </Button>
          </div>
        </div>

        <Tabs value={activePerfil} onValueChange={setActivePerfil}>
          <TabsList className="grid w-full grid-cols-4">
            {PERFIS.map(p => (
              <TabsTrigger key={p.key} value={p.key}>
                <Shield className="w-4 h-4 mr-2" />
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PERFIS.map(perfil => (
            <TabsContent key={perfil.key} value={perfil.key}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Permissões — {perfil.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Módulo</TableHead>
                        {ACOES.map(a => (
                          <TableHead key={a.key} className="text-center w-[130px]">
                            {a.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perfilPermissions.map(perm => (
                        <TableRow key={perm.id}>
                          <TableCell className="font-medium">
                            {MODULO_LABELS[perm.modulo] || perm.modulo}
                          </TableCell>
                          {ACOES.map(acao => (
                            <TableCell key={acao.key} className="text-center">
                              <Checkbox
                                checked={!!perm[acao.key]}
                                onCheckedChange={() => handleToggle(perfil.key, perm.modulo, acao.key)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Permissoes;
