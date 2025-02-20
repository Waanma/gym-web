'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import ClientCard from '@/components/ClientCard';

interface ClientListProps {
  gymId: string;
}

export default function ClientList({ gymId }: ClientListProps) {
  const { users, fetchUsersByGym } = useUserStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (gymId) {
      fetchUsersByGym(gymId); // Llama a la función pasando el gymId
    }
  }, [gymId, fetchUsersByGym]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search users..."
        className="border p-2 w-full mb-4 text-black"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={() => {}}
        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
      >
        Add New User
      </button>
      {filteredUsers.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user, index) => (
            <ClientCard key={user.id || index} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
