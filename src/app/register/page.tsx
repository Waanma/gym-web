'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importa Firestore
import { fetchSignInMethodsForEmail } from 'firebase/auth'; // Importa para verificar el email
import Loader from '@/components/Loader';
import { RegisterFormData } from '@/types/registration';

export default function RegisterPage({ toggle }: { toggle: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // Paso de flujo (1: Email, 2: Contraseña, 3: Formulario del gimnasio)
  const [formData, setFormData] = useState<RegisterFormData>({
    gym_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleEmailValidation = async () => {
    setLoading(true);
    setError('');

    if (!validateEmailFormat(formData.email)) {
      setError('Invalid email format.');
      setLoading(false);
      return;
    }

    try {
      // Verificar si el email ya está registrado usando fetchSignInMethodsForEmail
      const methods = await fetchSignInMethodsForEmail(auth, formData.email);

      if (methods.length > 0) {
        setError('The email is already registered.');
      } else {
        // Si el email no está registrado, avanzamos al paso 2 para ingresar la contraseña
        setStep(2);
      }
    } catch (err) {
      console.error('Firebase error: ', err);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const handlePasswordSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setStep(3); // Avanzamos al siguiente paso después de validar la contraseña
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Crear el usuario con el email y la contraseña
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      if (!user) {
        setError('User creation failed');
        setLoading(false);
        return;
      }

      // Guardar datos en firestore
      await setDoc(doc(db, 'gyms', user.uid), {
        created_at: new Date().toISOString(),
        email: formData.email,
        gym_name: formData.gym_name,
        gym_id: user.uid,
        user_data: {
          address: '',
          name: '',
          phone_number: '',
        },
      });

      router.push(`/owner-details/${user.uid}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred.');
      }
    }

    setLoading(false);
  };

  return (
    <div>
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailValidation(); // Valida email
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
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Next
            </button>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordSubmit(); // Valida contraseña
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
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Next
            </button>
          )}
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(); // Envia los datos a Firebase para crear el usuario
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            name="gym_name"
            placeholder="Gym Name"
            onChange={handleChange}
            required
            className="border p-2 rounded bg-gray-800 text-white"
          />
          {loading ? (
            <Loader />
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
