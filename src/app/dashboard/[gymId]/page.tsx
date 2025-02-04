'use client';

import { useParams } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import UserList from '@/components/ClientList';

export default function Dashboard() {
  const { gymId } = useParams();
  const gymName = `Gym ${gymId}`; // 🔥 Temporalmente usamos el ID como nombre

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader gymName={gymName} />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <UserList />
        </div>
      </div>
    </div>
  );
}
