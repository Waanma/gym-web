'use client';

import { useParams } from 'next/navigation';
import { useClientStore } from '@/store/clientStore';

export default function ClientProfile() {
  const { clientId } = useParams();
  const { clients } = useClientStore();
  const client = clients.find((c) => c.user_id === clientId);

  if (!client) return <p>Client not found</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">{client.name}</h2>
      <p>Email: {client.email}</p>
      <p>Goal: {client.goal}</p>
      <h3 className="text-xl font-semibold mt-4">Routines</h3>
      {client.routines.map((routine) => (
        <p key={routine.day}>
          Day {routine.day}:{' '}
          {routine.exercises.join(', ') || 'No exercises yet'}
        </p>
      ))}
    </div>
  );
}
