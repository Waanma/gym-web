import { create } from 'zustand';
import { Routine, Exercise, RoutineState } from '@/types/routine';
import { auth } from '@/config/firebaseConfig';

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

  // Ejercicios (API calls)
  addExercise: async (exercise: Exercise, routineId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...exercise, routine_id: routineId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to add exercise:', errorText);
        throw new Error('Failed to add exercise');
      }
      const newExercise = await res.json();
      set((state) => {
        const updatedRoutines = state.routines.map((rt) => {
          if (rt.routine_id === routineId) {
            // Si ya existe un ejercicio con el mismo id, no lo agregamos de nuevo
            const alreadyExists = rt.exercises?.some(
              (ex) => ex.id === newExercise.id
            );
            return {
              ...rt,
              exercises: alreadyExists
                ? rt.exercises
                : rt.exercises
                ? [newExercise, ...rt.exercises]
                : [newExercise],
            };
          }
          return rt;
        });
        const updatedSelectedRoutine =
          state.selectedRoutine &&
          state.selectedRoutine.routine_id === routineId
            ? updatedRoutines.find((r) => r.routine_id === routineId) ||
              state.selectedRoutine
            : state.selectedRoutine;
        return {
          routines: updatedRoutines,
          selectedRoutine: updatedSelectedRoutine,
        };
      });
      return newExercise;
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  },

  updateExercise: async (exercise: Exercise, routineId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/exercises/${exercise.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exercise),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to update exercise:', errorText);
        throw new Error('Failed to update exercise');
      }
      const updatedExercise = await res.json();
      set((state) => {
        const updatedRoutines = state.routines.map((rt) =>
          rt.routine_id === routineId
            ? {
                ...rt,
                exercises: rt.exercises?.map((ex) =>
                  ex.id === updatedExercise.id ? updatedExercise : ex
                ),
              }
            : rt
        );
        const updatedSelectedRoutine =
          state.selectedRoutine &&
          state.selectedRoutine.routine_id === routineId
            ? updatedRoutines.find((r) => r.routine_id === routineId) ||
              state.selectedRoutine
            : state.selectedRoutine;
        return {
          routines: updatedRoutines,
          selectedRoutine: updatedSelectedRoutine,
        };
      });
      return updatedExercise;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  },

  deleteExercise: async (exerciseId: string, routineId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to delete exercise:', errorText);
        throw new Error('Failed to delete exercise');
      }
      set((state) => {
        const updatedRoutines = state.routines.map((rt) =>
          rt.routine_id === routineId
            ? {
                ...rt,
                exercises: rt.exercises?.filter((ex) => ex.id !== exerciseId),
              }
            : rt
        );
        const updatedSelectedRoutine =
          state.selectedRoutine &&
          state.selectedRoutine.routine_id === routineId
            ? updatedRoutines.find((r) => r.routine_id === routineId) ||
              state.selectedRoutine
            : state.selectedRoutine;
        return {
          routines: updatedRoutines,
          selectedRoutine: updatedSelectedRoutine,
        };
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  },

  // API calls for routines

  fetchAllRoutines: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/routines`, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`Failed to fetch routines. Status: ${res.status}`);
      }
      const data = await res.json();
      // Forzamos que cada rutina tenga un array de ejercicios
      const routinesWithExercises: Routine[] = data.map((r: Routine) => ({
        ...r,
        exercises: Array.isArray(r.exercises) ? r.exercises : [],
      }));
      set({ routines: routinesWithExercises });
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  },

  createRoutine: async (routine: Routine): Promise<Routine> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      // Nota: La rutina ya no envía weight, sets ni reps
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
      set((state) => ({ routines: [...state.routines, newRoutine] }));
      console.log('Routine created:', newRoutine);
      return newRoutine;
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  },

  updateRoutine: async (
    routineId: string,
    data: Partial<Routine>
  ): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
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
        selectedRoutine:
          state.selectedRoutine &&
          state.selectedRoutine.routine_id === routineId
            ? updatedRoutine
            : state.selectedRoutine,
      }));
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  },

  deleteRoutine: async (routineId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
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
