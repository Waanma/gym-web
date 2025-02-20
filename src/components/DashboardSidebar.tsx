'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/userStore';

export default function DashboardSidebar() {
  const { currentUser } = useUserStore();

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <nav>
        <ul>
          {(currentUser?.role === 'admin' ||
            currentUser?.role === 'trainer') && (
            <li className="mb-4">
              <Link href="/dashboard/users" className="hover:underline">
                🏋️ Users
              </Link>
            </li>
          )}

          {currentUser?.role === 'admin' && (
            <li className="mb-4">
              <Link href="/dashboard/trainers" className="hover:underline">
                👨‍🏫 Trainers
              </Link>
            </li>
          )}

          <li>
            <Link href="/dashboard/settings" className="hover:underline">
              ⚙️ Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
