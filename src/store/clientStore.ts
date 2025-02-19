import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '@/types/client';

interface ClientState {
  clients: Client[];
  addClient: (newClient: Client) => void;
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: [],
      addClient: (newClient) =>
        set((state) => ({ clients: [...state.clients, newClient] })),
    }),
    { name: 'client-storage' }
  )
);
