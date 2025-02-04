'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Dashboard() {
  const { gymId } = useParams();
  const router = useRouter();
  const [gym, setGym] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId || typeof gymId !== 'string') {
      router.push('/login'); // 🔥 Evita que gymId sea undefined
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.uid !== gymId) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [gymId, router]);

  useEffect(() => {
    if (!gymId || typeof gymId !== 'string') return; // 🔥 Evita que getDoc falle

    const fetchGymData = async () => {
      try {
        const gymRef = doc(db, 'gyms', gymId); // 🔥 Ahora `gymId` siempre será string
        const gymSnap = await getDoc(gymRef);

        if (gymSnap.exists()) {
          setGym(gymSnap.data() as { name: string; email: string });
        } else {
          router.push('/login'); // 🔥 Si no existe, redirigir
        }
      } catch (error) {
        console.error('Error fetching gym data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGymData();
  }, [gymId, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Welcome, {gym?.name}!</h1>
      <p className="text-gray-500">{gym?.email}</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
