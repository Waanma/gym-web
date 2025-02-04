'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useGymStore } from '@/store/gymStore';
import GymCard from '@/components/GymCard';
import Loader from '@/components/Loader';

export default function GymsPage() {
  const { gyms, fetchGyms } = useGymStore();

  useEffect(() => {
    if (gyms.length === 0) {
      fetchGyms();
    }
  }, [fetchGyms, gyms]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">List of Gyms</h1>
      {gyms.length === 0 ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gyms.map((gym) => (
            <div key={gym.gym_id}>
              <GymCard gym={gym} />
              <Link
                href={`/gyms/${gym.gym_id}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
