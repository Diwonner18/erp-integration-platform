
import React, { useState, useEffect } from 'react';
import { Bell, User, Settings, LogOut, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<Array<{id: string, type: string, message: string}>>([]);

  // Sistema de alertas automatizados
  useEffect(() => {
    const checkAlerts = () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Janeiro = 1
      const newAlerts = [];

      // Alerta de Aniversário Contratual (apenas para admin)
      if (user?.type === 'admin') {
        // Simula verificação de contratos próximos ao vencimento
        newAlerts.push({
          id: 'aniversario-contratual',
          type: 'warning',
          message: 'Atenção: 3 contratos com aniversário nos próximos 30 dias'
        });
      }

      // Alerta de Reajuste por Dissídio (maio - admin e comercial)
      if (currentMonth === 5 && (user?.type === 'admin' || user?.type === 'comercial')) {
        newAlerts.push({
          id: 'reajuste-dissidio',
          type: 'info',
          message: 'Mês de Maio: Verificar reajustes por dissídio nos contratos'
        });
      }

      setAlerts(newAlerts);
    };

    if (user) {
      checkAlerts();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleSettingsClick = () => {
    navigate('/configuracoes');
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
    <>
      <header className="bg-card shadow-sm border-b border-border h-16 fixed top-0 right-0 left-64 z-10">
        <div className="flex items-center justify-between px-6 h-full">
          <div>
            <h2 className="text-lg font-title font-semibold text-primary">
              Bem-vindo ao Sistema CT Guedes
            </h2>
            <p className="text-sm font-body text-muted-foreground">
              Gerencie suas obras de forma eficiente
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleNotificationClick}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              )}
            </button>
            
            <button 
              onClick={handleSettingsClick}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {user && (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-full">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div className="text-sm font-body">
                    <span className="font-medium text-primary block">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{getUserTypeLabel(user.type)}</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-primary font-body"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Alertas automatizados */}
        {alerts.length > 0 && (
          <div className="px-6 pb-2">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={`mb-2 ${alert.type === 'warning' ? 'border-destructive/30 bg-destructive/10' : 'border-primary/30 bg-primary/10'}`}>
                {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                <AlertDescription className="font-body text-sm">
                  {alert.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </header>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Header;
