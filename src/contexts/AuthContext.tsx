import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserType = 'admin' | 'obras' | 'financeira' | 'comercial' | 'cliente';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  areaAssigned?: boolean;
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
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
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

// Helper to build User object from Supabase data
const buildUser = (
  supabaseUser: SupabaseUser,
  fullName: string,
  role: UserType | null
): User => ({
  id: supabaseUser.id,
  name: fullName,
  email: supabaseUser.email || '',
  type: role || 'cliente',
  areaAssigned: role !== null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch role and profile for a given user id
  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', supabaseUser.id)
        .single();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      const fullName = profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email || '';
      const role = (roleData?.role as UserType) || null;

      const appUser = buildUser(supabaseUser, fullName, role);
      setUser(appUser);
      if (role) {
        setPermissions(getPermissionsByUserType(role));
      } else {
        setPermissions(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(() => loadUserData(session.user), 0);
        } else {
          setUser(null);
          setPermissions(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; needsAreaSelection?: boolean; user?: User }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        return { success: false };
      }

      // Fetch profile and role
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      const fullName = profile?.full_name || data.user.user_metadata?.full_name || email;
      const role = (roleData?.role as UserType) || null;
      const appUser = buildUser(data.user, fullName, role);

      // If company employee without role assigned, prompt area selection
      if (isCompanyEmail(email) && !role) {
        // Don't set user in state yet — wait for area selection
        return { success: true, needsAreaSelection: true, user: appUser };
      }

      setUser(appUser);
      setPermissions(getPermissionsByUserType(appUser.type));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const assignUserArea = async (userId: string, area: UserType): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: area });

      if (error) {
        console.error('Error assigning area:', error);
        return false;
      }

      // Reload user data
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await loadUserData(currentUser);
      }
      return true;
    } catch (error) {
      console.error('Error assigning user area:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error || !data.user) {
        console.error('Register error:', error);
        return false;
      }

      // If client (external email), auto-assign role
      if (!isCompanyEmail(email)) {
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'cliente' as any });
      }

      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const updateProfile = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'Usuário não autenticado.' };

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: name, email })
        .eq('id', user.id);

      if (profileError) return { success: false, error: profileError.message };

      // Update email in Supabase Auth if changed
      if (email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email });
        if (authError) return { success: false, error: authError.message };
      }

      // Update user metadata
      await supabase.auth.updateUser({ data: { full_name: name } });

      setUser(prev => prev ? { ...prev, name, email } : null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar perfil.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'Usuário não autenticado.' };

      // V4 fix: validate current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) return { success: false, error: 'Senha atual incorreta.' };

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao alterar senha.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPermissions(null);
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    // Restrict admin access to only carla@ctguedes.com.br
    if (user?.type === 'admin' && user?.email !== 'carla@ctguedes.com.br') {
      const basicPermissions: (keyof UserPermissions)[] = ['canViewOwnData'];
      if (!basicPermissions.includes(permission)) {
        return false;
      }
    }
    return permissions ? permissions[permission] : false;
  };

  return (
    <AuthContext.Provider value={{ user, permissions, login, register, logout, isLoading, hasPermission, assignUserArea, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
