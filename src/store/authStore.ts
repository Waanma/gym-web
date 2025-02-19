'use client';

import { create } from 'zustand';
import { auth } from '@/config/firebaseConfig';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import api from '@/services/axiosConfig';
import { v4 as uuidv4 } from 'uuid';

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'trainer' | 'admin';
  gym_name?: string; // Para admin
  gym_address?: string; // Dirección del gym (solo para admin)
  gym_id?: string; // Para trainer/client
  name: string;
  phone_number: string;
  address: string;
}

interface AuthStoreState {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  // Verifica si el email está disponible (true = disponible, false = ya registrado)
  verifyEmail: (email: string) => Promise<boolean>;
  // Registra al usuario (crea en Firebase y en la API) y devuelve el gym_id asignado o null en caso de error.
  registerUser: (formData: RegistrationData) => Promise<string | null>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (message) => set({ error: message }),

  // Función de verificación de email: crea un usuario con "dummyPassword" y, si se crea, lo elimina
  verifyEmail: async (email: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        'dummyPassword'
      );
      await userCredential.user.delete();
      return true;
    } catch (err: unknown) {
      if (
        err instanceof FirebaseError &&
        err.code === 'auth/email-already-in-use'
      ) {
        return false;
      } else if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error('Unknown error during email verification.');
    }
  },

  registerUser: async (formData: RegistrationData): Promise<string | null> => {
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

    // Validaciones básicas
    if (!name || !phone_number || !address) {
      setError('All fields are required.');
      setLoading(false);
      return null;
    }
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
      // Crear el usuario real en Firebase
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

      // Obtener token para llamadas a la API
      const token = await user.getIdToken();
      let assignedGymId: string | undefined = gym_id;

      if (role === 'admin') {
        // Para admin, generar un nuevo gym con un ID único
        assignedGymId = uuidv4();
        const gymPayload = {
          gym_id: assignedGymId,
          gym_name: gym_name as string,
          location: gym_address as string,
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
      } else {
        // Para trainer o client, se requiere un gym_id existente
        if (!assignedGymId) {
          setError('Gym ID is required for trainer/client.');
          setLoading(false);
          return null;
        }
        // Verificar que el gym exista en la API
        await api.get(`/gyms/${assignedGymId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Crear el usuario en la API
      const userPayload = {
        user_id: user.uid,
        name,
        email,
        phone_number,
        address,
        role,
        gym_id: assignedGymId as string,
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
      return assignedGymId as string;
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
