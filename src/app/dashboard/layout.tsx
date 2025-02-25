'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen">
      {/* Sidebar para pantallas grandes */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Sidebar móvil (visible en pantallas pequeñas) */}
      <div className="lg:hidden">
        {/* Overlay, sin animación, sólo se renderiza cuando el sidebar está abierto */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black opacity-50"
            onClick={toggleSidebar}
          ></div>
        )}
        {/* Contenedor del sidebar móvil con animación */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <DashboardSidebar toggleSidebar={toggleSidebar} />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <DashboardHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
