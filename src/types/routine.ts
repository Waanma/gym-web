// types/routine.ts
export interface Exercise {
  id: string;
  name: string;
  weight: number;
  reps: number;
  sets: number;
}

export interface Routine {
  routine_id: string;
  user_id: string;
  name: string;
  description?: string;
  weight: number;
  sets: number;
  reps: number;
  created_by: string;
  updated_by?: string;
  createdAt: string;
  updatedAt: string;
  exercises?: Exercise[]; // Si tu modelo de ejercicios existe; sino, lo podés omitir
}
