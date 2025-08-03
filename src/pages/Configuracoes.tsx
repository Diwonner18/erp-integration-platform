
import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Lock, Bell, Globe, Shield } from 'lucide-react';

const Configuracoes = () => {
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    systemAlerts: true
  });
  
  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light'
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      toast.success('Perfil atualizado com sucesso!');
    }, 1000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Senha alterada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1000);
  };

  const handleNotificationUpdate = () => {
    toast.success('Preferências de notificação atualizadas!');
  };

  const getUserTypeLabel = (type: string) => {
    const types = {
      admin: 'Administrador',
      obras: 'Equipe de Obras',
      financeira: 'Equipe Financeira', 
      comercial: 'Equipe Comercial',
      cliente: 'Cliente'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
            <p className="text-slate-600">Gerencie suas preferências e configurações da conta</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
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
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Usuário</Label>
                    <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-700">
                        {getUserTypeLabel(user?.type || '')}
                      </span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    Salvar Alterações
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Altere sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Digite sua senha atual"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Digite sua nova senha"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  <Button type="submit" variant="destructive" className="w-full md:w-auto">
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como e quando você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Notificações por E-mail</h4>
                    <p className="text-sm text-slate-600">Receber notificações importantes por e-mail</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => {
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }));
                      handleNotificationUpdate();
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Notificações Push</h4>
                    <p className="text-sm text-slate-600">Receber notificações instantâneas no navegador</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => {
                      setNotifications(prev => ({ ...prev, pushNotifications: checked }));
                      handleNotificationUpdate();
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Relatórios Semanais</h4>
                    <p className="text-sm text-slate-600">Receber resumo semanal das atividades</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => {
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }));
                      handleNotificationUpdate();
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">Alertas do Sistema</h4>
                    <p className="text-sm text-slate-600">Notificações sobre atualizações e manutenções</p>
                  </div>
                  <Switch
                    checked={notifications.systemAlerts}
                    onCheckedChange={(checked) => {
                      setNotifications(prev => ({ ...prev, systemAlerts: checked }));
                      handleNotificationUpdate();
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências Gerais</CardTitle>
                <CardDescription>
                  Configure as preferências gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <select
                      id="language"
                      value={preferences.language}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <select
                      id="timezone"
                      value={preferences.timezone}
                      onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                    </select>
                  </div>
                </div>

                <Button onClick={() => toast.success('Preferências salvas com sucesso!')}>
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
