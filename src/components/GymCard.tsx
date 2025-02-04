import Link from 'next/link';
import { Gym } from '@/types/gym';

interface GymCardProps {
  gym: Gym;
}

export default function GymCard({ gym }: GymCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-md hover:shadow-lg transition">
      <h2 className="text-lg font-semibold">{gym.name}</h2>
      <p className="text-gray-500">{gym.location}</p>
      <Link
        href={`/gyms/${gym.gym_id}`}
        className="text-blue-500 hover:underline mt-2 block"
      >
        View Details
      </Link>
    </div>
  );
}
