import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import ClientCard from '@/components/ClientCard';
import { User } from '@/types/user';

interface ClientListProps {
  gymId: string;
  onSelectUser: (user: User) => void;
  isProfileOpen?: boolean;
}

// Hook para obtener el ancho de la ventana
function useWindowWidth() {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export default function ClientList({
  gymId,
  onSelectUser,
  isProfileOpen = false,
}: ClientListProps) {
  const { users, fetchUsersByGym } = useUserStore();
  const [search, setSearch] = useState('');
  const width = useWindowWidth();

  useEffect(() => {
    if (gymId) {
      console.log('Fetching users for gymId:', gymId);
      fetchUsersByGym(gymId);
    } else {
      console.error('gymId is empty or undefined');
    }
  }, [gymId, fetchUsersByGym]);

  const filteredUsers = users.filter(
    (user) =>
      user.gym_id === gymId &&
      user.role === 'client' &&
      user.name.toLowerCase().includes(search.toLowerCase())
  );

  // Si el perfil está abierto o el ancho es menor a 1250px, forzamos 1 columna.
  // En caso contrario, usamos un grid autoajustable con un ancho mínimo de 300px para cada tarjeta.
  const gridClasses =
    isProfileOpen || width < 1250
      ? 'grid grid-cols-1 gap-6'
      : 'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6';

  return (
    <div className="p-6 bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="border border-gray-300 p-2 rounded w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {}}
          className="mt-4 sm:mt-0 sm:ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Add New User
        </button>
      </div>
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No users found.</p>
        </div>
      ) : (
        <div className={`${gridClasses} max-h-[400px] overflow-y-auto`}>
          {filteredUsers.map((user) => (
            <ClientCard
              key={user.user_id}
              user={user}
              onSelectUser={onSelectUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
