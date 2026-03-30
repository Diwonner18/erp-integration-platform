
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserType } from '@/contexts/AuthContext';
import { useAllUserPermissions } from '@/hooks/usePermissoesPerfil';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
  modulo?: string; // nome do modulo em permissoes_perfil
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserTypes = ['admin', 'gerenciador_tecnico', 'obras', 'financeira', 'comercial', 'cliente'],
  modulo,
}) => {
  const { user, isLoading, effectiveType } = useAuth();
  const { hasModuleAccess, isLoading: permLoading } = useAllUserPermissions();

  if (isLoading || permLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // gerenciador_tecnico and demo users always have access regardless of impersonation
  const realType = user.type;
  const checkType = effectiveType || realType;
  if (realType === 'gerenciador_tecnico' || realType === 'admin' || user.isDemo) {
    return <>{children}</>;
  }

  if (allowedUserTypes && !allowedUserTypes.includes(checkType)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Acesso Negado</h2>
          <p className="text-slate-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Check module-level permission from permissoes_perfil
  if (modulo && !hasModuleAccess(modulo)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Acesso ao Módulo Negado</h2>
          <p className="text-slate-600">O administrador desabilitou seu acesso a este módulo.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
