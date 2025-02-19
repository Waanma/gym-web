export interface Exercise {
  exercise_id: string;
  name: string;
  sets: number;
  reps: number;
  rest_time: string;
  status: string;
}

export interface Manifest {
  manifest_id: string;
  name: string;
  trainer_id: string;
  date: string;
  status: string;
  exercises: Exercise[];
}

export interface Gym {
  gym_id: string;
  name: string;
  location: string;
  owner_id: string;
  subscription_plan?: string;
}
