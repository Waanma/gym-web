// app/dashboard/trainers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import TrainerCard from '@/components/TrainerCard';
import DashboardLoader from '@/components/DashboardLoader';

export default function TrainersPage() {
  const { currentUser, trainers, fetchTrainersByGym } = useUserStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const gym_id = currentUser?.gym_id || '';

  useEffect(() => {
    if (gym_id) {
      fetchTrainersByGym(gym_id)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [gym_id, fetchTrainersByGym]);

  const filteredTrainers = trainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-black">Trainers</h1>
      <input
        type="text"
        placeholder="Search trainers..."
        className="border p-2 w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filteredTrainers.length === 0 ? (
        <p className="text-gray-500">No trainers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrainers.map((trainer, index) => (
            <TrainerCard key={trainer.id || index} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
