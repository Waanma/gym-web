'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import ClientsList from '@/components/ClientList';
import DashboardLoader from '@/components/DashboardLoader';
import { useGymStore } from '@/store/gymStore';
import { useUserStore } from '@/store/userStore';
import { AxiosError } from 'axios';

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, fetchCurrentUser, fetchUsers } = useUserStore();
  const gym = useGymStore((state) => state.gym);
  const fetchGymById = useGymStore((state) => state.fetchGymById);

  // Estados de carga separados:
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  // Cargar el usuario actual y usuarios generales
  useEffect(() => {
    const initUser = async () => {
      await fetchCurrentUser();
      await fetchUsers();
      setLoadingUser(false);
    };
    initUser();
  }, [fetchCurrentUser, fetchUsers]);

  // Usar el gymId del currentUser
  const gymId = currentUser?.gym_id || '';

  // Cargar datos del gimnasio; solo proceder si ya se cargó el usuario
  useEffect(() => {
    const loadGym = async () => {
      if (loadingUser) return; // Esperamos a que se cargue el usuario
      if (!gymId) {
        console.error('❌ gymId no disponible en currentUser');
        router.push('/');
        return;
      }
      console.log('✅ gymId obtenido desde currentUser:', gymId);
      try {
        await fetchGymById(gymId);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error(
            `❌ API Error (${error.response?.status}):`,
            error.response?.data
          );
          if (error.response?.status === 404) {
            router.push('/not-found');
          } else if (error.response?.status === 403) {
            router.push('/unauthorized');
          } else {
            router.push('/');
          }
        } else {
          console.error('❌ Error desconocido:', error);
          router.push('/');
        }
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadGym();
  }, [gymId, loadingUser, router, fetchGymById]);

  if (loadingDashboard || loadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <DashboardLoader />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 p-6 bg-gray-50">
        <DashboardHeader />
        <div className="mt-6">
          <h1 className="text-4xl font-semibold text-gray-800 mb-2">
            {gym?.name || 'Dashboard'}
          </h1>
          <p className="text-xl text-gray-600">
            Location: {gym?.gym_address || 'N/A'}
          </p>
          <p className="text-xl text-gray-600">
            Owner ID: {gym?.owner_id || 'N/A'}
          </p>
          <div className="mt-8">
            <h2 className="text-3xl font-semibold text-gray-700 mb-4">
              User List
            </h2>
            <ClientsList gymId={gymId} />
          </div>
        </div>
      </div>
    </div>
  );
}
