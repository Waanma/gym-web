'use client';

import { useEffect } from 'react';
import { useGymStore } from '@/store/gymStore';
import Link from 'next/link';

export default function Home() {
  const { gyms, fetchGyms } = useGymStore();

  useEffect(() => {
    if (gyms.length === 0) {
      fetchGyms();
    }
  }, [fetchGyms, gyms.length]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Gym Rutinas</h1>
      <p className="text-lg text-gray-600 mb-6">
        Manage your gym routines and track your progress easily.
      </p>
      <Link
        href="/gyms"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        View Gyms
      </Link>
    </div>
  );
}
