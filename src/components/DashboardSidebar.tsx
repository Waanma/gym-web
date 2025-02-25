'use client';

import React from 'react';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';

interface DashboardSidebarProps {
  toggleSidebar?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  toggleSidebar,
}) => {
  const { currentUser } = useUserStore();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      {/* Botón hamburguesa para toggle en modo móvil */}
      {toggleSidebar && (
        <div className="flex justify-start mb-4">
          <button onClick={toggleSidebar} className="p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      )}
      <nav>
        <ul>
          {(currentUser?.role === 'admin' ||
            currentUser?.role === 'trainer') && (
            <li className="mb-4">
              <button
                onClick={() => handleNavigation('/dashboard/users')}
                className="hover:underline text-left w-full"
              >
                🏋️ Users
              </button>
            </li>
          )}
          {currentUser?.role === 'admin' && (
            <li className="mb-4">
              <button
                onClick={() => handleNavigation('/dashboard/trainers')}
                className="hover:underline text-left w-full"
              >
                👨‍🏫 Trainers
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => handleNavigation('/dashboard/settings')}
              className="hover:underline text-left w-full"
            >
              ⚙️ Settings
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
