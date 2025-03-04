'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientsList from '@/components/ClientList';
import DashboardLoader from '@/components/DashboardLoader';
import UserProfile from '@/components/UserProfile';
import { useGymStore } from '@/store/gymStore';
import { useUserStore } from '@/store/userStore';
import { AxiosError } from 'axios';
import { User } from '@/types/user';

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, fetchCurrentUser, fetchUsers } = useUserStore();
  const gym = useGymStore((state) => state.gym);
  const fetchGymById = useGymStore((state) => state.fetchGymById);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Cargar datos del usuario y la lista de usuarios
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
        (!gym_id || !gym_id.trim())
      ) {
        console.error('❌ gym_id no disponible para admin/trainer');
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
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <DashboardLoader />
      </div>
    );
  }

  // Vista para clientes
  if (currentUser?.role === 'client') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Welcome, {currentUser.name}
          </h1>
          {!gym_id.trim() ? (
            <>
              <p className="text-lg mb-6">
                You haven’t associated your account with a gym.
              </p>
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded shadow transition"
              >
                Enter Gym ID
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Your Routines</h2>
              <p className="text-lg">Your routine details will appear here.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Vista para administradores y entrenadores
  // Vista para admin/trainer
  if (currentUser?.role === 'admin' || currentUser?.role === 'trainer') {
    return (
      <div className="flex h-screen bg-gray-100 relative">
        {/* Sección principal (lista de usuarios) */}
        <div
          className={`
          transition-all duration-300 p-8 
          ${selectedUser ? 'w-full md:w-1/2' : 'w-full'}
        `}
        >
          <div className="mb-8 border-b pb-4">
            <h1 className="text-4xl font-bold text-gray-800">
              {gym?.name || 'Dashboard'}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Location: {gym?.gym_address || 'N/A'}
            </p>
            {currentUser?.role === 'admin' ? (
              <p className="mt-1 text-lg text-gray-600">
                Owner ID: {gym?.owner_id || 'N/A'}
              </p>
            ) : (
              <p className="mt-1 text-lg text-gray-600">
                Trainer: {currentUser.name}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              User List
            </h2>
            <div className="bg-white rounded-lg shadow p-4">
              <ClientsList gymId={gym_id} onSelectUser={setSelectedUser} />
            </div>
          </div>
        </div>

        {/* Panel de perfil (absoluto, desliza desde la derecha) */}
        <div
          className={`
          hidden md:block
          absolute top-0 right-0 bottom-0
          w-full md:w-1/2
          bg-white shadow-lg
          transition-transform duration-300
          ${selectedUser ? 'translate-x-0' : 'translate-x-full'}
        `}
        >
          {/* Renderiza el perfil solo si hay un usuario seleccionado */}
          {selectedUser && (
            <UserProfile
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          )}
        </div>

        {/* Modal para mobile */}
        {selectedUser && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 flex items-end">
            <div className="w-full bg-white p-4 rounded-t-lg transition-transform duration-300 transform translate-y-0">
              <UserProfile
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: rol no reconocido
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-xl text-red-500">Error: User role not recognized.</p>
    </div>
  );
}
