import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  title,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div id="dashboard-layout" className="flex h-screen bg-slate-50 overflow-hidden w-full">
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full" id="dashboard-main-container">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={title}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8" id="dashboard-content-area">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>

        <footer id="dashboard-footer" className="px-8 py-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            &copy; {new Date().getFullYear()} PETVEX SAAS PLATFORM. ALL RIGHTS RESERVED.
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            v1.0.0-stable
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
