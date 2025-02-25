// store/routineStore.ts
import { create } from 'zustand';
import { Routine, Exercise } from '@/types/routine';
import { auth } from '@/config/firebaseConfig';

interface RoutineState {
  routines: Routine[];
  selectedRoutine: Routine | null;

  // Mutaciones de estado
  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutineState: (routine: Routine) => void;
  deleteRoutineState: (routineId: string) => void;
  selectRoutine: (routine: Routine | null) => void;

  // Exercises
  addExercise: (exercise: Exercise, routineId: string) => void;
  updateExercise: (exercise: Exercise, routineId: string) => void;
  deleteExercise: (exerciseId: string, routineId: string) => void;

  // API calls
  fetchAllRoutines: () => Promise<void>;
  createRoutine: (routine: Routine) => Promise<void>;
  updateRoutine: (routineId: string, data: Partial<Routine>) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
}

// Asegúrate de que NEXT_PUBLIC_API_URL esté configurado sin el prefijo "/api"
// Por ejemplo: http://localhost:4000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  selectedRoutine: null,

  // Mutaciones de estado
  setRoutines: (routines: Routine[]) => set({ routines }),
  addRoutine: (routine: Routine) =>
    set((state) => ({ routines: [routine, ...state.routines] })),
  updateRoutineState: (routine: Routine) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.routine_id === routine.routine_id ? routine : r
      ),
    })),
  deleteRoutineState: (routineId: string) =>
    set((state) => ({
      routines: state.routines.filter((r) => r.routine_id !== routineId),
    })),
  selectRoutine: (routine: Routine | null) => set({ selectedRoutine: routine }),

  // Exercises
  addExercise: (exercise: Exercise, routineId: string) =>
    set((state) => ({
      routines: state.routines.map((rt) =>
        rt.routine_id === routineId
          ? {
              ...rt,
              exercises: rt.exercises
                ? [exercise, ...rt.exercises]
                : [exercise],
            }
          : rt
      ),
    })),
  updateExercise: (exercise: Exercise, routineId: string) =>
    set((state) => ({
      routines: state.routines.map((rt) =>
        rt.routine_id === routineId
          ? {
              ...rt,
              exercises: rt.exercises?.map((ex) =>
                ex.id === exercise.id ? exercise : ex
              ),
            }
          : rt
      ),
    })),
  deleteExercise: (exerciseId: string, routineId: string) =>
    set((state) => ({
      routines: state.routines.map((rt) =>
        rt.routine_id === routineId
          ? {
              ...rt,
              exercises: rt.exercises?.filter((ex) => ex.id !== exerciseId),
            }
          : rt
      ),
    })),

  // API calls

  fetchAllRoutines: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/routines`, {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch routines. Status: ${res.status}`);
      }
      const data = await res.json();
      set({ routines: data });
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  },

  createRoutine: async (routine: Routine) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/routines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(routine),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to create routine:', errorText);
        throw new Error('Failed to create routine');
      }
      const newRoutine = await res.json();
      set((state) => ({ routines: [newRoutine, ...state.routines] }));
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  },

  updateRoutine: async (routineId: string, data: Partial<Routine>) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to update routine:', errorText);
        throw new Error('Failed to update routine');
      }
      const updatedRoutine = await res.json();
      set((state) => ({
        routines: state.routines.map((r) =>
          r.routine_id === routineId ? updatedRoutine : r
        ),
      }));
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  },

  deleteRoutine: async (routineId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to delete routine:', errorText);
        throw new Error('Failed to delete routine');
      }
      set((state) => ({
        routines: state.routines.filter((r) => r.routine_id !== routineId),
      }));
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  },
}));
