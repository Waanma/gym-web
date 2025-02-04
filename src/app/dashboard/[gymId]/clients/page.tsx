'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Link from 'next/link';

interface Client {
  client_id: string;
  name: string;
  email: string;
}

export default function ClientsPage() {
  const { gym_id } = useParams() as { gym_id: string };
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gym_id) {
      router.push('/login');
      return;
    }

    const fetchClients = async () => {
      try {
        const clientsRef = collection(db, 'gyms', gym_id, 'clients');
        const snapshot = await getDocs(clientsRef);
        const clientList: Client[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Client, 'client_id'>;
          return { client_id: doc.id, ...data }; // 🔥 Ahora el ID es `client_id`
        });

        setClients(clientList);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [gym_id, router]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <Link href="add-client" className="bg-blue-500 text-white p-2 rounded">
        Add Client
      </Link>
      {loading ? (
        <p>Loading...</p>
      ) : clients.length === 0 ? (
        <p>No clients yet.</p>
      ) : (
        <ul className="mt-4">
          {clients.map((client) => (
            <li key={client.client_id}>
              <Link
                href={`${client.client_id}`}
                className="text-blue-500 hover:underline"
              >
                {client.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
