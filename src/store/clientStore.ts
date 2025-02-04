import { create } from 'zustand';
import { Client } from '@/types/client';

interface ClientState {
  clients: Client[];
  addClient: (newClient: Client) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  addClient: (newClient) =>
    set((state) => ({ clients: [...state.clients, newClient] })),
}));
