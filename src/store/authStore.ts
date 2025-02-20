'use client';

import { create } from 'zustand';
import { auth } from '@/config/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import api from '@/services/axiosConfig';
import type { RegisterFormData } from '@/types/registration';

interface AuthStoreState {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  verifyEmail: (email: string) => Promise<boolean>;
  registerUser: (formData: RegisterFormData) => Promise<string | null>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (message) => set({ error: message }),

  verifyEmail: async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length === 0;
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        throw new Error(err.message);
      }
      throw new Error('Unknown error during email verification.');
    }
  },

  registerUser: async (formData: RegisterFormData): Promise<string | null> => {
    const {
      email,
      password,
      confirmPassword,
      role,
      gym_name,
      gym_address,
      gym_id,
      name,
      phone_number,
      address,
    } = formData;
    const { setLoading, setError } = get();
    setLoading(true);
    setError(null);

    // Validaciones básicas: nombre, email y rol siempre son requeridos.
    if (!name || !email || !role) {
      setError('Name, email, and role are required.');
      setLoading(false);
      return null;
    }

    // Para trainer y admin se exige que se ingresen teléfono y dirección.
    if (
      (role === 'trainer' || role === 'admin') &&
      (!phone_number || !address)
    ) {
      setError(
        'Phone number and address are required for trainers and admins.'
      );
      setLoading(false);
      return null;
    }

    // Para admin se requiere gym_name y gym_address.
    if (role === 'admin' && (!gym_name || !gym_address)) {
      setError('Gym name and gym address are required for admin users.');
      setLoading(false);
      return null;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return null;
    }

    try {
      // Crear el usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (!user?.uid) {
        setError('User creation failed. No UID available.');
        setLoading(false);
        return null;
      }
      const token = await user.getIdToken();

      let assignedGymId: string | null = (gym_id && gym_id.trim()) || null;

      if (role === 'admin') {
        // Para admin, asignamos el UID como gym_id automáticamente (ignorando lo que se haya ingresado)
        assignedGymId = user.uid;
        const gymPayload = {
          gym_id: assignedGymId,
          gym_name,
          gym_address,
          subscription_plan: 'Basic',
          owner_id: user.uid,
        };
        const gymResp = await api.post('/gyms', gymPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (gymResp.status !== 201) {
          setError(gymResp.data.error || 'Failed to create gym');
          setLoading(false);
          return null;
        }
      } else if (role === 'trainer') {
        // Para trainer, se exige que se ingrese un gym_id no vacío.
        assignedGymId = assignedGymId; // ya lo tenemos con trim()
        if (!assignedGymId) {
          setError('Gym ID is required for trainers.');
          setLoading(false);
          return null;
        }
        // Verificar que el gimnasio existe en la API.
        await api.get(`/gyms/${assignedGymId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (role === 'client') {
        // Para client, si no se ingresa gym_id, lo dejamos como null.
        if (!assignedGymId) {
          assignedGymId = null;
        }
      }

      const userPayload = {
        user_id: user.uid,
        name,
        email,
        phone_number:
          phone_number && phone_number.trim() ? phone_number.trim() : null,
        address: address && address.trim() ? address.trim() : null,
        role,
        gym_id: assignedGymId,
      };

      const userResp = await api.post('/users', userPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userResp.status !== 201) {
        setError(userResp.data.error || 'Failed to register user in API');
        setLoading(false);
        return null;
      }
      setLoading(false);
      return assignedGymId;
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
      setLoading(false);
      return null;
    }
  },
}));
