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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // Aquí pasamos los datos correctos al paso siguiente
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
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Register
      </button>
    </form>
  );
}
