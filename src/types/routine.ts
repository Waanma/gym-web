export interface Exercise {
  id: string;
  name: string;
  weight: number;
  reps: number;
  sets: number;
  day: number;
  time: string;
}

export interface Routine {
  routine_id: string;
  user_id: string;
  name: string;
  description?: string;
  created_by: string;
  updated_by?: string;
  createdAt: string;
  updatedAt: string;
  exercises?: Exercise[]; // Asociación a ejercicios
}

export interface RoutineState {
  routines: Routine[];
  selectedRoutine: Routine | null;

  // Mutaciones de estado
  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutineState: (routine: Routine) => void;
  deleteRoutineState: (routineId: string) => void;
  selectRoutine: (routine: Routine | null) => void;

  // Ejercicios
  addExercise: (exercise: Exercise, routineId: string) => void;
  updateExercise: (exercise: Exercise, routineId: string) => void;
  deleteExercise: (exerciseId: string, routineId: string) => void;

  // API calls
  fetchAllRoutines: () => Promise<void>;
  createRoutine: (routine: Routine) => Promise<Routine>;
  updateRoutine: (routineId: string, data: Partial<Routine>) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
}
