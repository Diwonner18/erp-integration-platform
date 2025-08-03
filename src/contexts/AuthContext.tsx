import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserType = 'admin' | 'obras' | 'financeira' | 'comercial' | 'cliente';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  areaAssigned?: boolean; // Flag para indicar se a área já foi atribuída
}

export interface UserPermissions {
  canManageUsers: boolean;
  canApproveChanges: boolean;
  canViewAllReports: boolean;
  canManageAutomation: boolean;
  canConfirmSchedules: boolean;
  canInsertMeasurements: boolean;
  canSuggestScopeChanges: boolean;
  canAccessFinancialData: boolean;
  canIssueMeasurementBulletins: boolean;
  canExportReports: boolean;
  canCreateProposals: boolean;
  canManageContracts: boolean;
  canManageUnitValues: boolean;
  canViewOwnData: boolean;
  canScheduleWorks: boolean;
  canConfirmProposals: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  login: (email: string, password: string) => Promise<{ success: boolean; needsAreaSelection?: boolean; user?: User }>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  assignUserArea: (userId: string, area: UserType) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isCompanyEmail = (email: string): boolean => {
  return email.endsWith('@ctguedes.com.br');
};

const determineUserType = (email: string): UserType => {
  // Verificar se é do domínio da empresa CT Guedes
  if (email.endsWith('@ctguedes.com.br')) {
    // Para funcionários da empresa, determinar o tipo baseado no prefixo do e-mail
    const prefix = email.split('@')[0].toLowerCase();
    
    if (prefix.includes('admin') || prefix.includes('diretor') || prefix.includes('gerente')) {
      return 'admin';
    } else if (prefix.includes('obra') || prefix.includes('campo') || prefix.includes('execucao')) {
      return 'obras';
    } else if (prefix.includes('financ') || prefix.includes('contab') || prefix.includes('tesour')) {
      return 'financeira';
    } else if (prefix.includes('comercial') || prefix.includes('venda') || prefix.includes('proposta')) {
      return 'comercial';
    } else {
      // Por padrão, funcionários da empresa são admin
      return 'admin';
    }
  } else {
    // Usuários externos são clientes
    return 'cliente';
  }
};

const getPermissionsByUserType = (userType: UserType): UserPermissions => {
  switch (userType) {
    case 'admin':
      return {
        canManageUsers: true,
        canApproveChanges: true,
        canViewAllReports: true,
        canManageAutomation: true,
        canConfirmSchedules: true,
        canInsertMeasurements: true,
        canSuggestScopeChanges: true,
        canAccessFinancialData: true,
        canIssueMeasurementBulletins: true,
        canExportReports: true,
        canCreateProposals: true,
        canManageContracts: true,
        canManageUnitValues: true,
        canViewOwnData: true,
        canScheduleWorks: true,
        canConfirmProposals: true,
      };
    case 'obras':
      return {
        canManageUsers: false,
        canApproveChanges: false,
        canViewAllReports: false,
        canManageAutomation: false,
        canConfirmSchedules: true,
        canInsertMeasurements: true,
        canSuggestScopeChanges: true,
        canAccessFinancialData: false,
        canIssueMeasurementBulletins: false,
        canExportReports: false,
        canCreateProposals: false,
        canManageContracts: false,
        canManageUnitValues: false,
        canViewOwnData: true,
        canScheduleWorks: false,
        canConfirmProposals: false,
      };
    case 'financeira':
      return {
        canManageUsers: false,
        canApproveChanges: false,
        canViewAllReports: true,
        canManageAutomation: false,
        canConfirmSchedules: false,
        canInsertMeasurements: false,
        canSuggestScopeChanges: false,
        canAccessFinancialData: true,
        canIssueMeasurementBulletins: true,
        canExportReports: true,
        canCreateProposals: false,
        canManageContracts: false,
        canManageUnitValues: false,
        canViewOwnData: true,
        canScheduleWorks: false,
        canConfirmProposals: false,
      };
    case 'comercial':
      return {
        canManageUsers: false,
        canApproveChanges: false,
        canViewAllReports: false,
        canManageAutomation: false,
        canConfirmSchedules: false,
        canInsertMeasurements: false,
        canSuggestScopeChanges: false,
        canAccessFinancialData: false,
        canIssueMeasurementBulletins: false,
        canExportReports: false,
        canCreateProposals: true,
        canManageContracts: true,
        canManageUnitValues: true,
        canViewOwnData: true,
        canScheduleWorks: false,
        canConfirmProposals: false,
      };
    case 'cliente':
      return {
        canManageUsers: false,
        canApproveChanges: false,
        canViewAllReports: false,
        canManageAutomation: false,
        canConfirmSchedules: false,
        canInsertMeasurements: false,
        canSuggestScopeChanges: false,
        canAccessFinancialData: false,
        canIssueMeasurementBulletins: false,
        canExportReports: false,
        canCreateProposals: false,
        canManageContracts: false,
        canManageUnitValues: false,
        canViewOwnData: true,
        canScheduleWorks: true,
        canConfirmProposals: true,
      };
    default:
      return {
        canManageUsers: false,
        canApproveChanges: false,
        canViewAllReports: false,
        canManageAutomation: false,
        canConfirmSchedules: false,
        canInsertMeasurements: false,
        canSuggestScopeChanges: false,
        canAccessFinancialData: false,
        canIssueMeasurementBulletins: false,
        canExportReports: false,
        canCreateProposals: false,
        canManageContracts: false,
        canManageUnitValues: false,
        canViewOwnData: false,
        canScheduleWorks: false,
        canConfirmProposals: false,
      };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default admin (Carla) if no users exist
    const initializeDefaultAdmin = () => {
      const users = JSON.parse(localStorage.getItem('ct-guedes-users') || '[]');
      
      // Check if Carla already exists
      const carlaExists = users.some((u: any) => u.email === 'carla@ctguedes.com.br');
      
      if (!carlaExists) {
        const carlaAdmin = {
          id: 'carla-admin-001',
          name: 'Carla',
          email: 'carla@ctguedes.com.br',
          password: 'admin123',
          type: 'admin' as UserType,
          areaAssigned: true
        };
        
        users.push(carlaAdmin);
        localStorage.setItem('ct-guedes-users', JSON.stringify(users));
      }
    };

    // Initialize default admin
    initializeDefaultAdmin();

    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('ct-guedes-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setPermissions(getPermissionsByUserType(userData.type));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; needsAreaSelection?: boolean; user?: User }> => {
    try {
      // Simulate API call - in real app, this would be a backend call
      const users = JSON.parse(localStorage.getItem('ct-guedes-users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Verificar se é funcionário da empresa e se já tem área atribuída
        if (isCompanyEmail(email) && !userWithoutPassword.areaAssigned) {
          return { 
            success: true, 
            needsAreaSelection: true, 
            user: userWithoutPassword 
          };
        }
        
        setUser(userWithoutPassword);
        setPermissions(getPermissionsByUserType(userWithoutPassword.type));
        localStorage.setItem('ct-guedes-user', JSON.stringify(userWithoutPassword));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const assignUserArea = async (userId: string, area: UserType): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('ct-guedes-users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].type = area;
        users[userIndex].areaAssigned = true;
        localStorage.setItem('ct-guedes-users', JSON.stringify(users));
        
        const { password: _, ...userWithoutPassword } = users[userIndex];
        setUser(userWithoutPassword);
        setPermissions(getPermissionsByUserType(area));
        localStorage.setItem('ct-guedes-user', JSON.stringify(userWithoutPassword));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error assigning user area:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - in real app, this would be a backend call
      const users = JSON.parse(localStorage.getItem('ct-guedes-users') || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        return false;
      }

      // Para funcionários da empresa, não determinar o tipo automaticamente
      let userType: UserType = 'cliente';
      let areaAssigned = true;
      
      if (isCompanyEmail(email)) {
        userType = 'admin'; // Tipo temporário, será definido no login
        areaAssigned = false; // Precisará selecionar área
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        type: userType,
        areaAssigned
      };

      users.push(newUser);
      localStorage.setItem('ct-guedes-users', JSON.stringify(users));

      // Se for cliente, fazer login automático
      if (userType === 'cliente') {
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        setPermissions(getPermissionsByUserType(userWithoutPassword.type));
        localStorage.setItem('ct-guedes-user', JSON.stringify(userWithoutPassword));
      }
      
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions(null);
    localStorage.removeItem('ct-guedes-user');
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    // Restringir acesso administrativo apenas para Carla
    if (user?.type === 'admin' && user?.email !== 'carla@ctguedes.com.br') {
      // Permitir apenas permissões básicas para outros admins
      const basicPermissions: (keyof UserPermissions)[] = ['canViewOwnData'];
      if (!basicPermissions.includes(permission)) {
        return false;
      }
    }
    return permissions ? permissions[permission] : false;
  };

  return (
    <AuthContext.Provider value={{ user, permissions, login, register, logout, isLoading, hasPermission, assignUserArea }}>
      {children}
    </AuthContext.Provider>
  );
};
