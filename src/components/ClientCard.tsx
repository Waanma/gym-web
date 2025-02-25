import React from 'react';
import { User } from '@/types/user';

interface ClientCardProps {
  user: User;
  onSelectUser: (user: User) => void;
}

export default function ClientCard({ user, onSelectUser }: ClientCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{user.name}</h2>
      <p className="text-gray-600 mb-1">{user.email}</p>
      <p className="text-gray-500 text-sm">
        Updated at:{' '}
        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
      </p>
      <button
        onClick={() => onSelectUser(user)}
        className="inline-block px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors duration-300"
      >
        View Profile
      </button>
    </div>
  );
}
