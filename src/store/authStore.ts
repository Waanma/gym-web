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
import type { User } from '@/types/user';

interface AuthStoreState {
  loading: boolean;
  error: string | null;
  user: User | null;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  setUser: (user: User | null) => void;
  verifyEmail: (email: string) => Promise<boolean>;
  registerUser: (formData: RegisterFormData) => Promise<string | null>;
}

export const useAuthStore = create<AuthStoreState>()((set, get) => ({
  loading: false,
  error: null,
  user: null,
  setLoading: (loading: boolean) => set({ loading }),
  setError: (message: string | null) => set({ error: message }),
  setUser: (user: User | null) => set({ user }),

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
    const { setLoading, setError, setUser } = get();
    setLoading(true);
    setError(null);

    // Check that role is one of the allowed values
    if (role !== 'client' && role !== 'trainer' && role !== 'admin') {
      setError('Invalid role. Must be client, trainer, or admin.');
      setLoading(false);
      return null;
    }

    // Basic validations
    if (!name || !email || !role) {
      setError('Name, email, and role are required.');
      setLoading(false);
      return null;
    }

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
      // Debug log the role before registration
      console.log('[registerUser] Role before Firebase creation:', role);

      // Create user in Firebase
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

      // Prepare gym_id value
      let assignedGymId: string | null = (gym_id && gym_id.trim()) || null;
      // For admin, override any provided gym_id with the Firebase UID.
      if (role === 'admin') {
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
        if (!assignedGymId) {
          setError('Gym ID is required for trainers.');
          setLoading(false);
          return null;
        }
        // Verify gym exists
        await api.get(`/gyms/${assignedGymId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (role === 'client') {
        // For client, if no gym_id provided, remain null
        if (!assignedGymId) {
          assignedGymId = null;
        }
      }

      // Build the user payload using the role from formData (which is trusted)
      const userPayload: User = {
        user_id: user.uid,
        name,
        email,
        phone_number:
          phone_number && phone_number.trim() ? phone_number.trim() : null,
        address: address && address.trim() ? address.trim() : null,
        role, // this is the role from the form
        gym_id: assignedGymId,
      };

      console.log('[registerUser] Final user payload:', userPayload);

      const userResp = await api.post('/users', userPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userResp.status !== 201) {
        setError(userResp.data.error || 'Failed to register user in API');
        setLoading(false);
        return null;
      }

      // Persist the registered user in the store
      setUser(userPayload);
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
