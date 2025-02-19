'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import ClientsList from '@/components/ClientList';
import DashboardLoader from '@/components/DashboardLoader';
import { useGymStore } from '@/store/gymStore';
import { useUserStore } from '@/store/userStore';
import { AxiosError } from 'axios';

export default function Dashboard() {
  const router = useRouter();
  const { gymId } = useParams(); // Se obtiene el gymId desde la URL

  // Usamos el gymStore para gestionar la información del gimnasio
  const gym = useGymStore((state) => state.gym);
  const fetchGymById = useGymStore((state) => state.fetchGymById);

  // Cargamos usuarios y datos del usuario actual desde el userStore
  const { fetchUsers, fetchCurrentUser } = useUserStore();

  const [loading, setLoading] = useState(true);

  // Cargar usuarios y usuario actual
  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, [fetchUsers, fetchCurrentUser]);

  // Cargar datos del gimnasio usando el store
  useEffect(() => {
    const loadGym = async () => {
      if (!gymId || typeof gymId !== 'string') {
        console.error('❌ gymId inválido:', gymId);
        router.push('/login');
        return;
      }
      console.log('✅ gymId recibido:', gymId);
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
            router.push('/login');
          }
        } else {
          console.error('❌ Error desconocido:', error);
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadGym();
  }, [gymId, router, fetchGymById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
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
            <ClientsList />
          </div>
        </div>
      </div>
    </div>
  );
}
