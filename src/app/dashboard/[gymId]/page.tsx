'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      await fetchCurrentUser();
      await fetchUsers();
      setLoadingUser(false);
    };
    initUser();
  }, [fetchCurrentUser, fetchUsers]);

  const gym_id = currentUser?.gym_id || '';

  useEffect(() => {
    const loadGym = async () => {
      if (
        (currentUser?.role === 'admin' || currentUser?.role === 'trainer') &&
        !gym_id.trim()
      ) {
        console.error(
          '❌ gym_id no disponible en currentUser para admin/trainer'
        );
        router.push('/profile');
        return;
      }
      if (currentUser?.role === 'admin' || currentUser?.role === 'trainer') {
        try {
          console.log('✅ Cargando gimnasio con gym_id:', gym_id);
          await fetchGymById(gym_id);
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
        }
      }
      setLoadingDashboard(false);
    };

    if (!loadingUser) {
      loadGym();
    }
  }, [gym_id, currentUser, loadingUser, router, fetchGymById]);

  if (loadingUser || loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <DashboardLoader />
      </div>
    );
  }

  // Lógica diferenciada para clientes vs admin/trainer:
  if (currentUser?.role === 'client') {
    return (
      <div>
        {!gym_id.trim() ? (
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">
              You havent associated your account with a gym.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
            >
              Enter Gym ID
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-3xl font-semibold text-gray-700 mb-4">
              Your Routines
            </h2>
            <p className="text-black">Your routine details will appear here.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
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
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">User List</h2>
        <ClientsList gymId={gym_id} />
      </div>
    </div>
  );
}
