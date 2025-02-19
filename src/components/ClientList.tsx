'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import ClientCard from '@/components/ClientCard';

export default function ClientList() {
  const { users, fetchUsers } = useUserStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers(); // Llamar la función para obtener los usuarios
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Search users..."
        className="border p-2 w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={() => {}}
        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
      >
        Add New User
      </button>
      {/* Si no hay usuarios */}
      {filteredUsers.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mostrar usuarios */}
          {filteredUsers.map((user) => (
            <ClientCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
