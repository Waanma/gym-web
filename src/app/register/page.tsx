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
  const { loading, error, registerUser, verifyEmail } = useAuthStore();
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // Valor por defecto: client
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

  // Paso 1: Validar email
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

  // Paso 2: Validar contraseñas
  const handlePasswordSubmit = (): void => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setStep(3);
  };

  // Paso 3: Registro final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Para trainer: gym_id debe estar ingresado (no vacío)
    if (
      formData.role === 'trainer' &&
      (!formData.gym_id || !formData.gym_id.trim())
    ) {
      alert('Gym ID is required for trainers.');
      return;
    }

    // Para admin: ignoramos lo ingresado en gym_id (se asignará automáticamente)
    // Para client: se permite que quede vacío (se completará desde el dashboard)
    const effectiveGymId =
      formData.role === 'admin'
        ? '' // Se dejará vacío; en el authStore se asignará el UID automáticamente
        : formData.role === 'client'
        ? formData.gym_id || ''
        : formData.gym_id; // Para trainer, se usa lo ingresado

    const gymId = await registerUser({ ...formData, gym_id: effectiveGymId });
    if (gymId !== null) {
      router.push(`/dashboard/${gymId}`);
    } else {
      // Si por alguna razón no se asignó un gym (por ejemplo, para clientes sin asociación)
      router.push('/dashboard/no-gym');
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            required={formData.role !== 'client'}
            className="border p-2 rounded bg-gray-800 text-white"
          />
          <input
            type="text"
            name="address"
            placeholder="Your Personal Address"
            onChange={handleChange}
            required={formData.role !== 'client'}
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

          {/* Para admin, mostramos campos para el gimnasio pero no para gym_id */}
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

          {/* Para trainer, se requiere gym_id */}
          {formData.role === 'trainer' && (
            <input
              type="text"
              name="gym_id"
              placeholder="Existing Gym ID"
              onChange={handleChange}
              required
              className="border p-2 rounded bg-gray-800 text-white"
            />
          )}

          {/* Para client, gym_id es opcional */}
          {formData.role === 'client' && (
            <input
              type="text"
              name="gym_id"
              placeholder="Existing Gym ID (optional)"
              onChange={handleChange}
              className="border p-2 rounded bg-gray-800 text-white"
            />
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            Register
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      )}

      <p className="text-gray-400 mt-3 text-center">
        Already have an account?{' '}
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          className="text-blue-500 hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
}
