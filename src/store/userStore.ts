import { create } from 'zustand';
import { RegisterFormData } from '@/types/registration';

interface UserStore {
  user: RegisterFormData | null;
  setUser: (user: RegisterFormData) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
