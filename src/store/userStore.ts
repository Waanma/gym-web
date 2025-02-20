import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/services/axiosConfig';
import { User } from '@/types/user';
import { auth } from '@/config/firebaseConfig';
import { AxiosError } from 'axios';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface UserStore {
  users: User[];
  trainers: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  fetchUsers: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchUsersByGym: (gymId: string) => Promise<void>;
  fetchTrainersByGym: (gymId: string) => Promise<void>;
}

// Helper: espera a que Firebase determine el usuario, con timeout
const waitForAuthUser = (timeoutMs = 5000): Promise<FirebaseUser> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout waiting for Firebase auth state'));
    }, timeoutMs);
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      if (newUser) {
        clearTimeout(timeout);
        unsubscribe();
        console.log('✅ Firebase auth state resolved:', newUser.uid);
        resolve(newUser);
      }
    });
  });
};

export const useUserStore = create<UserStore, [['zustand/persist', UserStore]]>(
  persist(
    (set) => ({
      users: [],
      trainers: [],
      currentUser: null,

      setCurrentUser: (user) => set({ currentUser: user }),

      // Obtener todos los usuarios desde la API
      fetchUsers: async () => {
        try {
          let firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            console.warn(
              '🚫 No authenticated user found, waiting for Firebase auth state...'
            );
            firebaseUser = await waitForAuthUser().catch((err) => {
              console.error('❌ Error waiting for auth state:', err);
              return null;
            });
          }
          if (!firebaseUser) {
            console.error('🚫 No authenticated user found after waiting.');
            return;
          }

          const token = await firebaseUser.getIdToken();
          if (!token) {
            console.error('🚫 Failed to retrieve token');
            return;
          }

          const response = await api.get<User[]>('/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ users: response.data });
          console.log('✅ Users fetched successfully:', response.data);
        } catch (error) {
          handleApiError(error);
        }
      },

      // Obtener datos del usuario autenticado desde la API
      fetchCurrentUser: async () => {
        try {
          let firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            console.warn(
              '🚫 No authenticated user found, waiting for Firebase auth state...'
            );
            firebaseUser = await waitForAuthUser().catch((err) => {
              console.error('❌ Error waiting for auth state:', err);
              return null;
            });
          }
          if (!firebaseUser) {
            console.error('🚫 No authenticated user found after waiting.');
            return;
          }

          const token = await firebaseUser.getIdToken();
          if (!token) {
            console.error('🚫 Failed to retrieve token');
            return;
          }

          try {
            // Intentar obtener el usuario desde la API
            const response = await api.get<User>(`/users/${firebaseUser.uid}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            set({ currentUser: response.data });
            console.log('✅ Current user fetched successfully:', response.data);
          } catch (error: unknown) {
            if (error instanceof AxiosError && error.response?.status === 404) {
              console.warn('🚫 User not found in API. Creating new user...');
              const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.email || 'Guest',
                email: firebaseUser.email || '',
                phone_number: '', // Ajusta según tu lógica
                address: '',
                role: 'client', // Valor por defecto, ajústalo según corresponda
                gym_id: '', // Valor por defecto o a completar
              };
              const createResponse = await api.post<User>('/users', newUser, {
                headers: { Authorization: `Bearer ${token}` },
              });
              set({ currentUser: createResponse.data });
              console.log(
                '✅ New user created successfully:',
                createResponse.data
              );
            } else {
              throw error;
            }
          }
        } catch (error) {
          console.error('❌ Error fetching current user:', error);
        }
      },
      fetchUsersByGym: async (gymId: string) => {
        try {
          let firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            console.warn(
              '🚫 No authenticated user found, waiting for Firebase auth state...'
            );
            firebaseUser = await waitForAuthUser().catch((err) => {
              console.error('❌ Error waiting for auth state:', err);
              return null;
            });
          }
          if (!firebaseUser) {
            console.error('🚫 No authenticated user found after waiting.');
            return;
          }
          const token = await firebaseUser.getIdToken();
          if (!token) {
            console.error('🚫 Failed to retrieve token');
            return;
          }
          const endpoint = `/gyms/${gymId}/clients`;
          console.log('Llamando a:', endpoint);
          const response = await api.get<User[]>(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ users: response.data });
          console.log('✅ Users by gym fetched successfully:', response.data);
        } catch (error) {
          handleApiError(error);
        }
      },

      fetchTrainersByGym: async (gym_id: string) => {
        try {
          let firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            firebaseUser = await waitForAuthUser().catch(() => null);
          }
          if (!firebaseUser) return;
          const token = await firebaseUser.getIdToken();
          const response = await api.get<User[]>(`/gyms/${gym_id}/trainers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ trainers: response.data }); // Agrega una propiedad "trainers" en el store
          console.log(
            '✅ Trainers by gym fetched successfully:',
            response.data
          );
        } catch (error) {
          handleApiError(error);
        }
      },
    }),
    {
      name: 'user-storage', // clave en localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('📌 Response Data:', error.response.data);
      console.error('📌 Response Status:', error.response.status);
    } else if (error.request) {
      console.error('⚠️ No response received from API');
    }
  } else {
    console.error('❗ Unknown error:', error);
  }
};
