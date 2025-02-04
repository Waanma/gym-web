'use client';

import { useEffect, useState } from 'react';
import { useGymStore } from '@/store/gymStore';
import { useParams } from 'next/navigation';
import Loader from '@/components/Loader';

export default function GymDetailsPage() {
  const { gymId } = useParams(); // 🔥 Obtiene el gymId de la URL
  const { gyms, fetchGyms } = useGymStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gyms.length === 0) {
      fetchGyms().then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchGyms, gyms]);

  const gym = gyms.find((g) => g.gym_id === gymId);

  if (isLoading) return <Loader />;
  if (!gym) return <p>Gym not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold">{gym.name}</h1>
      <p className="text-gray-500">{gym.location}</p>

      <h2 className="text-2xl font-semibold mt-6">Manifests</h2>
      <ul>
        {gym.manifests.map((manifest) => (
          <li key={manifest.manifest_id} className="border p-3 my-2 rounded-md">
            <h3 className="font-semibold">{manifest.name}</h3>
            <p>Date: {manifest.date}</p>
            <p>Status: {manifest.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
