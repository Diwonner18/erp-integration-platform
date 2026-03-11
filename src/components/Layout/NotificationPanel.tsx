import React from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotificacoes, useUpdateNotificacao } from '@/hooks/useSupabaseData';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { data: notifications = [] } = useNotificacoes();
  const updateNotificacao = useUpdateNotificacao();

  const markAsRead = async (id: string) => {
    await updateNotificacao.mutateAsync({ id, lida: true });
  };

  const markAllAsRead = async () => {
    for (const n of notifications.filter(n => !n.lida)) {
      await updateNotificacao.mutateAsync({ id: n.id, lida: true });
    }
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'alerta_seguranca': return 'bg-red-50 border-red-200';
      case 'email': return 'bg-blue-50 border-blue-200';
      default: return 'bg-muted border-border';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute top-16 right-6 w-96 bg-card rounded-lg shadow-lg border border-border">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Notificações</h3>
            {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">Marcar todas</Button>}
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Bell className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Nenhuma notificação</p></div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg border transition-colors ${n.lida ? 'bg-muted/50 border-border' : getTypeColor(n.tipo)}`}>
                    <div className="flex items-start space-x-3">
                      <Bell className={`w-5 h-5 mt-0.5 ${n.lida ? 'text-muted-foreground' : 'text-primary'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium text-sm ${n.lida ? 'text-muted-foreground' : 'text-foreground'}`}>{n.titulo}</h4>
                          {!n.lida && <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="p-1 h-auto"><Check className="w-3 h-3" /></Button>}
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{n.mensagem}</p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground"><Clock className="w-3 h-3 mr-1" />{new Date(n.created_at).toLocaleString('pt-BR')}</div>
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
