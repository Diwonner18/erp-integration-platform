
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
