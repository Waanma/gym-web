import Link from 'next/link';
import { User } from '@/types/user';

export default function UserCard({ user }: { user: User }) {
  return (
    <div className="border p-4 rounded-md shadow-md hover:shadow-lg transition">
      <h2 className="text-lg font-bold">{user.name}</h2>
      <p className="text-gray-500">{user.email}</p>
      <Link
        href={`/dashboard/${user.id}`}
        className="text-blue-500 hover:underline mt-2 block"
      >
        View Profile
      </Link>
    </div>
  );
}
