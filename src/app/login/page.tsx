'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';

export default function LoginPage({ toggle }: { toggle: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      if (!user) {
        setError('Login failed.');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      localStorage.setItem('firebaseToken', token); 
      console.log('✅ Login exitoso, token guardado:', token);

      router.push(`/dashboard/${user.uid}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password');
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <p className="text-gray-400 mt-3 text-center">
        Dont have an account?{' '}
        <button
          type="button"
          onClick={toggle}
          className="text-blue-500 hover:underline"
        >
          Register
        </button>
      </p>
    </form>
  );
}
