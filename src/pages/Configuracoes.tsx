import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Lock, Bell, Globe, Shield } from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: z.string().trim().email('E-mail inválido.').max(255, 'O e-mail deve ter no máximo 255 caracteres.'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número.'),
  confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

const defaultNotifications = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyReports: false,
  systemAlerts: true,
};

const defaultPreferences = {
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  theme: 'light',
};

const getUserTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    admin: 'Administrador',
    obras: 'Equipe de Obras',
    financeira: 'Equipe Financeira',
    comercial: 'Equipe Comercial',
    cliente: 'Cliente',
    gerenciador_tecnico: 'Gerenciador Técnico',
  };
  return types[type] || type;
};

const Configuracoes = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState(defaultNotifications);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);

  // Load preferences from Supabase on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('preferencias')
        .eq('id', user.id)
        .single();

      if (!error && data?.preferencias) {
        const prefs = data.preferencias as Record<string, unknown>;
        if (prefs.notifications) setNotifications({ ...defaultNotifications, ...(prefs.notifications as typeof defaultNotifications) });
        if (prefs.preferences) setPreferences({ ...defaultPreferences, ...(prefs.preferences as typeof defaultPreferences) });
      }
      setLoading(false);
    };
    loadPreferences();
  }, [user?.id]);

  const savePreferencesToDb = async (newNotifications: typeof notifications, newPreferences: typeof preferences) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        preferencias: {
          notifications: newNotifications,
          preferences: newPreferences,
        },
      } as any)
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao salvar preferências.');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = profileSchema.safeParse(profileData);
    if (!validation.success) {
      validation.error.errors.forEach(err => toast.error(err.message));
      return;
    }
    const result = await updateProfile(validation.data.name, validation.data.email);
    if (result.success) {
      toast.success('Perfil atualizado com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao atualizar perfil.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = passwordSchema.safeParse(passwordData);
    if (!validation.success) {
      validation.error.errors.forEach(err => toast.error(err.message));
      return;
    }
    const result = await changePassword(validation.data.currentPassword, validation.data.newPassword);
    if (result.success) {
      toast.success('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.error || 'Erro ao alterar senha.');
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, checked: boolean) => {
    const updated = { ...notifications, [key]: checked };
    setNotifications(updated);
    savePreferencesToDb(updated, preferences);
    toast.success('Preferências de notificação atualizadas!');
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    savePreferencesToDb(notifications, updated);
    toast.success('Preferência atualizada!');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4" data-tour="page-header">
          <div className="bg-primary/10 p-3 rounded-lg">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6" data-tour="page-list">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Preferências</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" value={profileData.name} onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))} placeholder="Seu nome completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))} placeholder="seu@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Usuário</Label>
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{getUserTypeLabel(user?.type || '')}</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">Salvar Alterações</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>Altere sua senha para manter sua conta segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder="Digite sua senha atual" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Digite sua nova senha" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirme sua nova senha" />
                  </div>
                  <Button type="submit" variant="destructive" className="w-full md:w-auto">Alterar Senha</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Configure como e quando você quer receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'emailNotifications' as const, title: 'Notificações por E-mail', desc: 'Receber notificações importantes por e-mail' },
                  { key: 'pushNotifications' as const, title: 'Notificações Push', desc: 'Receber notificações instantâneas no navegador' },
                  { key: 'weeklyReports' as const, title: 'Relatórios Semanais', desc: 'Receber resumo semanal das atividades' },
                  { key: 'systemAlerts' as const, title: 'Alertas do Sistema', desc: 'Notificações sobre atualizações e manutenções' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={notifications[item.key]} onCheckedChange={(checked) => handleNotificationChange(item.key, checked)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências Gerais</CardTitle>
                <CardDescription>Configure as preferências gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <select id="language" value={preferences.language} onChange={(e) => handlePreferenceChange('language', e.target.value)} className="w-full p-2 border border-border rounded-md bg-background text-foreground">
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <select id="timezone" value={preferences.timezone} onChange={(e) => handlePreferenceChange('timezone', e.target.value)} className="w-full p-2 border border-border rounded-md bg-background text-foreground">
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">As preferências são salvas automaticamente. A tradução completa do sistema será implementada futuramente.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
