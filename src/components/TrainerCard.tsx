import Link from 'next/link';
import { User } from '@/types/user';

export default function TrainerCard({ trainer }: { trainer: User }) {
  return (
    <div className="border p-4 rounded-md shadow-md hover:shadow-lg transition">
      <h2 className="text-lg font-bold text-black">{trainer.name}</h2>
      <p className="text-gray-500">{trainer.email}</p>
      <p className="text-sm text-gray-400">Role: {trainer.role}</p>
      <Link
        href={`/dashboard/trainers/${trainer.id}`}
        className="text-blue-500 hover:underline mt-2 block"
      >
        Edit Trainer
      </Link>
    </div>
  );
}
