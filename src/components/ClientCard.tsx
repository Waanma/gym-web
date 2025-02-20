import Link from 'next/link';
import { User } from '@/types/user';

export default function ClientCard({ user }: { user: User }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{user.name}</h2>
      <p className="text-gray-600 mb-1">{user.email}</p>
      <p className="text-gray-600 mb-1">Gym ID: {user.gym_id}</p>
      {user.role && (
        <p className="text-sm text-gray-500 mb-3">Role: {user.role}</p>
      )}
      <Link
        href={`/dashboard/${user.user_id}`}
        className="inline-block px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors duration-300"
      >
        View Profile
      </Link>
    </div>
  );
}
