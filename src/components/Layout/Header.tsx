
import React, { useState } from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

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
      </header>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Header;
