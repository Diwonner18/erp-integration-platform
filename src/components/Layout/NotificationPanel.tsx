
import React from 'react';
import { Bell, Check, X, Clock, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { user } = useAuth();
  
  const getNotificationsForUser = (): Notification[] => {
    return [];
  };

  const [notifications, setNotifications] = React.useState<Notification[]>(getNotificationsForUser());

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute top-16 right-6 w-96 bg-white rounded-lg shadow-lg border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      notification.isRead 
                        ? 'bg-slate-50 border-slate-200' 
                        : getTypeColor(notification.type)
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <notification.icon 
                        className={`w-5 h-5 mt-0.5 ${
                          notification.isRead 
                            ? 'text-slate-400' 
                            : getIconColor(notification.type)
                        }`} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium text-sm ${
                            notification.isRead ? 'text-slate-600' : 'text-slate-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 h-auto"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          notification.isRead ? 'text-slate-500' : 'text-slate-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default NotificationPanel;
