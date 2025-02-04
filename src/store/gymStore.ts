import { create } from 'zustand';
import axios from 'axios';
import { Gym } from '@/types/gym';

interface GymState {
  gyms: Gym[];
  fetchGyms: () => Promise<void>;
}

export const useGymStore = create<GymState>((set, get) => ({
  gyms: [],
  fetchGyms: async () => {
    if (get().gyms.length > 0) return;

    try {
      const response = await axios.get('/api/gyms');
      set({ gyms: response.data.gyms });
    } catch (error) {
      console.error('Error fetching gyms:', error);
    }
  },
}));
