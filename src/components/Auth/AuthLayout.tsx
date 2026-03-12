import React from 'react';
import logotipo from '@/assets/logotipo.png';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="bg-sidebar text-sidebar-foreground lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16">
        {/* Mobile: compact header / Desktop: full panel */}
        <div className="flex flex-col items-center gap-6 lg:gap-8">
          <img
            src={logotipo}
            alt="CT Guedes"
            className="h-16 lg:h-24 brightness-0 invert"
          />
          <div className="text-center">
            <h1 className="font-title text-2xl lg:text-4xl font-bold tracking-tight">
              CT Guedes
            </h1>
            <p className="font-body text-sidebar-primary-foreground/80 mt-2 lg:mt-4 text-sm lg:text-lg max-w-md">
              Sistema de Gestão de Obras
            </p>
          </div>
          {/* Decorative elements - desktop only */}
          <div className="hidden lg:flex flex-col items-center gap-3 mt-8 text-sidebar-primary-foreground/60">
            <div className="w-16 h-px bg-sidebar-primary" />
            <p className="font-body text-xs text-center max-w-xs">
              Gerencie propostas, obras, medições e finanças em um único lugar
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="bg-background flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
