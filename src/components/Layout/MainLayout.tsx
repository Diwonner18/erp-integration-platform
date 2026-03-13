import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTour } from '@/hooks/usePageTour';
import ProductTour from '@/components/Tour/ProductTour';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
  onStartTour?: () => void;
}

const ROLE_BANNER_COLORS: Record<string, string> = {
  obras: 'bg-orange-500',
  financeira: 'bg-green-600',
  comercial: 'bg-blue-600',
  cliente: 'bg-purple-600',
};

const ROLE_LABELS: Record<string, string> = {
  obras: 'Obras',
  financeira: 'Financeiro',
  comercial: 'Comercial',
  cliente: 'Cliente',
};

const MainLayout = ({ children, onStartTour }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { impersonatedRole, stopImpersonation } = useAuth();
  const { pathname } = useLocation();
  const { steps, hasSteps, startPageTour, tour } = usePageTour();

  const handleStartTour = () => {
    // If on dashboard and parent provided onStartTour, use that
    if (pathname === '/' && onStartTour) {
      onStartTour();
      return;
    }
    // Otherwise use page tour
    if (!startPageTour()) {
      toast.info('Tour não disponível para esta página.');
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onStartTour={handleStartTour} />

      <main
        className={`mt-16 p-4 md:p-6 overflow-y-auto overflow-x-hidden ${isMobile ? 'ml-0' : 'ml-64'} ${impersonatedRole ? 'h-[calc(100vh-4rem-2.5rem)] pb-4' : 'h-[calc(100vh-4rem)]'}`}
        style={{ scrollbarGutter: 'stable' }}
      >
        {children}
      </main>

      {impersonatedRole && (
        <div
          className={`fixed left-0 right-0 z-40 ${ROLE_BANNER_COLORS[impersonatedRole] || 'bg-primary'} text-white`}
          style={{ bottom: 0, top: 'auto' }}
        >
          <div className={`flex items-center justify-center gap-3 py-1.5 text-xs font-medium ${isMobile ? 'ml-0' : 'ml-64'}`}>
            <span>Visualizando como: <strong>{ROLE_LABELS[impersonatedRole] || impersonatedRole}</strong></span>
            <button
              onClick={stopImpersonation}
              className="p-0.5 rounded hover:bg-white/20 transition-colors"
              title="Sair do modo agente"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Page Tour (non-dashboard pages) */}
      {pathname !== '/' && hasSteps && (
        <ProductTour
          steps={steps}
          currentStep={tour.currentStep}
          isActive={tour.isActive}
          onNext={tour.nextStep}
          onPrev={tour.prevStep}
          onSkip={tour.skipTour}
        />
      )}
    </div>
  );
};

export default MainLayout;
