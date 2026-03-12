
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
  onStartTour?: () => void;
}

const MainLayout = ({ children, onStartTour }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onStartTour={onStartTour} />
      <main className={`pt-16 p-4 md:p-6 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
