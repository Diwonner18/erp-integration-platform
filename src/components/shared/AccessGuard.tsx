import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Clock, CheckCircle } from 'lucide-react';
import { useSolicitarAcesso } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface AccessGuardProps {
  hasAccess: boolean | undefined;
  isLoading: boolean;
  tabela: string;
  registroId: string;
  children: React.ReactNode;
  readOnlyContent?: React.ReactNode;
  accessLevel?: string;
}

const AccessGuard = ({ hasAccess, isLoading, tabela, registroId, children, readOnlyContent, accessLevel }: AccessGuardProps) => {
  const { toast } = useToast();
  const solicitarAcesso = useSolicitarAcesso();

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Verificando permissões...</div>;

  if (hasAccess === false) {
    // Check if access level is 'view' - show read only content
    if (accessLevel === 'view' && readOnlyContent) {
      return <>{readOnlyContent}</>;
    }

    return (
      <div className="p-8 text-center space-y-4">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
        <h3 className="text-lg font-semibold text-foreground">Acesso restrito</h3>
        <p className="text-sm text-muted-foreground">
          Este registro pertence a outro funcionário. Solicite acesso ao administrador.
        </p>
        <Button
          onClick={async () => {
            try {
              await solicitarAcesso.mutateAsync({ tabela, registro_id: registroId });
              toast({ title: 'Solicitação enviada', description: 'O admin será notificado.' });
            } catch {
              toast({ title: 'Erro ao solicitar acesso', variant: 'destructive' });
            }
          }}
          disabled={solicitarAcesso.isPending}
        >
          {solicitarAcesso.isPending ? (
            <><Clock className="w-4 h-4 mr-2" />Enviando...</>
          ) : (
            'Solicitar Acesso ao Admin'
          )}
        </Button>
        {solicitarAcesso.isSuccess && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Solicitação enviada com sucesso
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessGuard;
