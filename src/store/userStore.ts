import { create } from 'zustand';
import { User } from '@/types/user';

interface UserState {
  users: User[];
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  fetchUsers: async () => {
    try {
      const response = await fetch('/api/users'); // 🔥 API Mock temporal
      const data = await response.json();
      set({ users: data.users });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },
}));
