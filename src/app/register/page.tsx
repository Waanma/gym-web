'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterPage({ toggle }: { toggle: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gym_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'gyms', user.uid), {
        gym_id: user.uid,
        gym_name: formData.gym_name,
        email: formData.email,
        created_at: new Date().toISOString(),
      });

      router.push(`/dashboard/${user.uid}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error registering gym');
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="gym_name"
        placeholder="Gym Name"
        onChange={handleChange}
        required
        className="border p-2 rounded bg-gray-800 text-white"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
        className="border p-2 rounded bg-gray-800 text-white"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
        className="border p-2 rounded bg-gray-800 text-white"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      {/* 🔥 Ahora el texto está dentro del formulario */}
      <p className="text-gray-400 mt-3 text-center">
        Already have an account?{' '}
        <button
          type="button"
          onClick={toggle}
          className="text-blue-500 hover:underline"
        >
          Login
        </button>
      </p>
    </form>
  );
}
