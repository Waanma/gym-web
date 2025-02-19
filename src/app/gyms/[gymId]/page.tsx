'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/axiosConfig';
import Loader from '@/components/Loader';

interface Manifest {
  manifest_id: string;
  name: string;
  date: string;
  status: string;
}

interface Gym {
  gym_id: string;
  name: string;
  gym_address: string;
  manifests: Manifest[];
}

export default function GymDetailsPage() {
  const { gymId } = useParams(); // 🔥 Obtiene el gymId de la URL
  const router = useRouter();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId || typeof gymId !== 'string') {
      router.push('/dashboard'); // 🔄 Redirige si no hay gymId válido
      return;
    }

    const fetchGymData = async () => {
      try {
        const token = localStorage.getItem('firebaseToken');
        if (!token) {
          console.error('🚫 No token found');
          router.push('/login');
          return;
        }

        const response = await api.get<Gym>(`/gyms/${gymId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setGym(response.data);
      } catch (error) {
        console.error('❌ Error fetching gym data:', error);
        router.push('/dashboard'); // 🔄 Redirige si hay un error
      } finally {
        setLoading(false);
      }
    };

    fetchGymData();
  }, [gymId, router]);

  if (loading) return <Loader />;
  if (!gym) return <p>❌ Gym not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold">{gym.name}</h1>
      <p className="text-gray-500">{gym.gym_address}</p>

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
