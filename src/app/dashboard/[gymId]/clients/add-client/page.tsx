'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export default function AddClientPage() {
  const { gym_id } = useParams() as { gym_id: string };
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goal: '',
    days_per_week: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const clientsRef = collection(db, 'gyms', gym_id, 'clients');
      await addDoc(clientsRef, {
        name: formData.name,
        email: formData.email,
        goal: formData.goal,
        days_per_week: Number(formData.days_per_week),
      });

      router.push(`/dashboard/${gym_id}/clients`);
    } catch (err) {
      setError('Error adding client');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Client</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Client Name"
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="goal"
          placeholder="Goal (e.g., muscle_gain)"
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <select
          name="days_per_week"
          onChange={handleChange}
          className="border p-2 rounded"
        >
          {[...Array(7)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} days per week
            </option>
          ))}
        </select>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          {loading ? 'Saving...' : 'Add Client'}
        </button>
      </form>
    </div>
  );
}
