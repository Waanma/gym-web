// ClientCard.tsx
import Link from 'next/link';
import { User } from '@/types/user';

export default function ClientCard({ user }: { user: User }) {
  return (
    <div className="border p-4 rounded-md shadow-md hover:shadow-lg transition">
      <h2 className="text-lg font-bold text-black">{user.name}</h2>
      <p className="text-gray-500">{user.email}</p>

      {/* Mostrar el rol si existe */}
      {user.role && <p className="text-sm text-gray-400">Role: {user.role}</p>}

      {/* Link para ver el perfil */}
      <Link
        href={`/dashboard/${user.id}`} // Navegar al perfil del usuario
        className="text-blue-500 hover:underline mt-2 block"
      >
        View Profile
      </Link>
    </div>
  );
}
