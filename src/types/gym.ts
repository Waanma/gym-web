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
  id: string;
  gym_id: string;
  name: string;
  email: string;
  password: string;
  location: string;
  owner_id: string;
  manifests: Manifest[];
}
