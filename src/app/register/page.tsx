'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { RegisterFormData } from '@/types/registration';
import Loader from '@/components/Loader';

interface RegisterPageProps {
  toggle: () => void;
}

export default function RegisterPage({ toggle }: RegisterPageProps) {
  const router = useRouter();
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const registerUser = useAuthStore((state) => state.registerUser);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    gym_name: '',
    gym_address: '',
    gym_id: '',
    name: '',
    phone_number: '',
    address: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  // Paso 1: Validar formato y verificar si el email está disponible
  const handleEmailValidation = async (): Promise<void> => {
    if (!validateEmailFormat(formData.email)) {
      alert('Invalid email format.');
      return;
    }
    try {
      const available = await verifyEmail(formData.email);
      console.log('Email available:', available);
      if (!available) {
        alert('The email is already registered.');
        return;
      }
      setStep(2);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  // Paso 2: Validar que las contraseñas coincidan
  const handlePasswordSubmit = (): void => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setStep(3);
  };

  // Paso 3: Registro final
  const handleSubmit = async (): Promise<void> => {
    const gymId = await registerUser(formData);
    if (gymId) {
      router.push(`/dashboard/${gymId}`);
    }
  };

  return (
    <div>
      {/* PASO 1: Email */}
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailValidation();
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="border p-2 rounded bg-gray-800 text-white"
          />
          {loading ? (
            <Loader />
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Next
            </button>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </form>
      )}

      {/* PASO 2: Contraseñas */}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordSubmit();
          }}
          className="flex flex-col gap-4"
        >
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
          {loading ? (
            <Loader />
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Next
            </button>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </form>
      )}

      {/* PASO 3: Datos adicionales y registro final */}
      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            className="border p-2 rounded bg-gray-800 text-white"
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            onChange={handleChange}
            required
            className="border p-2 rounded bg-gray-800 text-white"
          />
          <input
            type="text"
            name="address"
            placeholder="Your Personal Address"
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
          {formData.role === 'admin' && (
            <>
              <input
                type="text"
                name="gym_name"
                placeholder="Gym Name"
                onChange={handleChange}
                required
                className="border p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="text"
                name="gym_address"
                placeholder="Gym Address"
                onChange={handleChange}
                required
                className="border p-2 rounded bg-gray-800 text-white"
              />
            </>
          )}
          {formData.role !== 'admin' && (
            <input
              type="text"
              name="gym_id"
              placeholder="Existing Gym ID"
              onChange={handleChange}
              required
              className="border p-2 rounded bg-gray-800 text-white"
            />
          )}
          {loading ? (
            <Loader />
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Register
            </button>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </form>
      )}

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
    </div>
  );
}
