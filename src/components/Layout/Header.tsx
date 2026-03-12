
import React, { useState } from 'react';
import { Bell, User, Settings, LogOut, Menu, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onStartTour?: () => void;
}

const Header = ({ onToggleSidebar, onStartTour }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();

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
      <header className={`bg-card shadow-sm border-b border-border h-16 fixed top-0 right-0 z-10 ${
        isMobile ? 'left-0' : 'left-64'
      }`}>
        <div className="flex items-center justify-between px-4 md:px-6 h-full">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="text-primary">
                <Menu className="w-6 h-6" />
              </Button>
            )}
            <div>
              <h2 className={`font-title font-semibold text-primary ${isMobile ? 'text-sm' : 'text-lg'}`}>
                {isMobile ? 'CT Guedes' : 'Bem-vindo ao Sistema CT Guedes'}
              </h2>
              {!isMobile && (
                <p className="text-sm font-body text-muted-foreground">
                  Gerencie suas obras de forma eficiente
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={onStartTour}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
              title="Tutorial do sistema"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button 
              data-tour="notifications"
              onClick={handleNotificationClick}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full relative transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            
            {!isMobile && (
              <button 
                onClick={handleSettingsClick}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            
            {user && !isMobile && (
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
