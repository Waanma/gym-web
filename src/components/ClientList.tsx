import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import ClientCard from '@/components/ClientCard';
import { User } from '@/types/user';

interface ClientListProps {
  gymId: string;
  onSelectUser: (user: User) => void;
}

export default function ClientList({ gymId, onSelectUser }: ClientListProps) {
  const { users, fetchUsersByGym } = useUserStore();
  const [search, setSearch] = useState('');

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
        <div className="max-h-96 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
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
