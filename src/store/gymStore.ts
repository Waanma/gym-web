import { create } from 'zustand';
import api from '@/services/axiosConfig';
import { Gym } from '@/types/gym';

interface GymState {
  gyms: Gym[];
  gym: Gym | null;
  fetchGyms: () => Promise<void>;
  fetchGymById: (gymId: string) => Promise<void>;
}

export const useGymStore = create<GymState>((set) => ({
  gyms: [],
  gym: null,
  fetchGyms: async () => {
    try {
      const response = await api.get('/gyms');
      set({ gyms: response.data.gyms });
    } catch (error) {
      console.error('Error fetching gyms:', error);
    }
  },
  fetchGymById: async (gymId: string) => {
    try {
      const response = await api.get(`/gyms/${gymId}`);
      // Se espera que la API retorne el objeto Gym
      set({ gym: response.data });
    } catch (error) {
      console.error('Error fetching gym by ID:', error);
      set({ gym: null });
      throw error;
    }
  },
}));
