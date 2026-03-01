
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Users, Settings, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Permissoes = () => {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [permissions, setPermissions] = useState([
    {
      title: 'Equipe de Obras',
      icon: Settings,
      permissions: [] as { name: string; enabled: boolean }[]
    },
    {
      title: 'Equipe Financeira',
      icon: Shield,
      permissions: [] as { name: string; enabled: boolean }[]
    },
    {
      title: 'Equipe Comercial',
      icon: Users,
      permissions: [] as { name: string; enabled: boolean }[]
    }
  ]);

  // Auto-save após 1 segundo de inatividade
  useEffect(() => {
    if (hasChanges) {
      const saveTimer = setTimeout(() => {
        handleAutoSave();
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
  }, [permissions, hasChanges]);

  const handlePermissionChange = (groupIndex: number, permIndex: number, enabled: boolean) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      newPermissions[groupIndex].permissions[permIndex].enabled = enabled;
      return newPermissions;
    });
    setHasChanges(true);
  };

  const handleAutoSave = () => {
    // Simula auto-save em background
    setHasChanges(false);
    toast({
      title: 'Permissões salvas automaticamente',
      description: 'Suas alterações foram salvas',
    });
    
  };

  const handleManualSave = () => {
    handleAutoSave();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Permissões do Sistema</h1>
            <p className="text-muted-foreground mt-1">Configure permissões por tipo de usuário</p>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center text-sm text-orange-600 mr-2">
                <span>Salvando automaticamente...</span>
              </div>
            )}
            <Button 
              onClick={handleManualSave} 
              disabled={!hasChanges}
              className="transition-all duration-150 hover:scale-105"
            >
              <Save className="w-4 h-4 mr-2" />
              {hasChanges ? 'Salvar Agora' : 'Salvo'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {permissions.map((group, index) => (
            <Card key={index} className="transition-all duration-150 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <group.icon className="w-5 h-5 mr-2" />
                  {group.title}
                </CardTitle>
                <CardDescription>
                  Configure as permissões específicas para este grupo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.permissions.map((permission, permIndex) => (
                    <div key={permIndex} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-150">
                      <span className="text-sm font-medium">{permission.name}</span>
                      <div className="flex items-center space-x-2">
                        {permission.enabled && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        <Switch 
                          checked={permission.enabled}
                          onCheckedChange={(checked) => handlePermissionChange(index, permIndex, checked)}
                          className="transition-all duration-150"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Permissoes;
