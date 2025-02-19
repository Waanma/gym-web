import { RegisterFormData } from '@/types/registration';
import { useState } from 'react';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    gym_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // Por defecto el rol es 'client'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        onChange={handleChange}
        required
        className="border p-2 rounded bg-gray-800 text-white"
      />
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="border p-2 rounded bg-gray-800 text-white"
      >
        <option value="client">Client</option>
        <option value="trainer">Trainer</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Register
      </button>
    </form>
  );
}
