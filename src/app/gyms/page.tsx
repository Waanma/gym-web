import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Definir el tipo de Gym
interface Gym {
  gym_name: string;
  email: string;
  location: string;
  subscription_plan: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const { gymId } = useParams(); // Obtener gymId desde la URL

  useEffect(() => {
    if (!gymId || typeof gymId !== 'string') return;

    const fetchGymData = async () => {
      try {
        const gymRef = doc(db, 'gyms', gymId);
        const gymSnap = await getDoc(gymRef);

        if (gymSnap.exists()) {
          const gymData = gymSnap.data() as Partial<Gym>; // Definimos que puede tener campos opcionales

          setGym({
            gym_name: gymData.gym_name ?? 'Unknown Gym',
            email: gymData.email ?? 'No Email',
            location: gymData.location ?? 'No Location',
            subscription_plan: gymData.subscription_plan ?? 'No Plan',
          });
        } else {
          router.push('/register'); // Redirige si no encuentra el gimnasio
        }
      } catch (error) {
        console.error('❌ Error fetching gym data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGymData();
  }, [gymId, router]);

  return (
    <div>
      {loading ? <p>Loading...</p> : <p>Gym Name: {gym?.gym_name}</p>}
    </div>
  );
}
