// store/routineStore.ts
import { create } from 'zustand';
import { Routine, Exercise } from '@/types/routine';

interface RoutineState {
  routines: Routine[];
  selectedRoutine: Routine | null;
  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;
  selectRoutine: (routine: Routine | null) => void;
  addExercise: (exercise: Exercise, routineId: string) => void;
  updateExercise: (exercise: Exercise, routineId: string) => void;
  deleteExercise: (exerciseId: string, routineId: string) => void;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  selectedRoutine: null,
  setRoutines: (routines) => set({ routines }),
  addRoutine: (routine) =>
    set((state) => ({ routines: [routine, ...state.routines] })),
  updateRoutine: (routine) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.routine_id === routine.routine_id ? routine : r
      ),
    })),
  deleteRoutine: (routineId) =>
    set((state) => ({
      routines: state.routines.filter((r) => r.routine_id !== routineId),
    })),
  selectRoutine: (routine) => set({ selectedRoutine: routine }),
  addExercise: (exercise, routineId) =>
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.routine_id === routineId
          ? {
              ...routine,
              exercises: routine.exercises
                ? [exercise, ...routine.exercises]
                : [exercise],
            }
          : routine
      ),
    })),
  updateExercise: (exercise, routineId) =>
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.routine_id === routineId
          ? {
              ...routine,
              exercises: routine.exercises?.map((ex) =>
                ex.id === exercise.id ? exercise : ex
              ),
            }
          : routine
      ),
    })),
  deleteExercise: (exerciseId, routineId) =>
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.routine_id === routineId
          ? {
              ...routine,
              exercises: routine.exercises?.filter(
                (ex) => ex.id !== exerciseId
              ),
            }
          : routine
      ),
    })),
}));
