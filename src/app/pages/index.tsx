import { useEffect } from 'react';
import { useGymStore } from '@/store/gymStore';
import { Gym } from '../../types/gym';

export default function Home() {
  const { gyms, fetchGyms } = useGymStore();

  useEffect(() => {
    fetchGyms();
  }, [gyms, fetchGyms]);

  return (
    <div>
      <h1>Gyms</h1>
      {gyms.length === 0 ? (
        <p>Loading...</p>
      ) : (
        gyms.map((gym: Gym) => (
          <div key={gym.gym_id}>
            <h2>{gym.name}</h2>
            <p>Location: {gym.location}</p>
          </div>
        ))
      )}
    </div>
  );
}
