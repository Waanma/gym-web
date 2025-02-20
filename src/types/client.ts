export interface Routine {
  day: number;
  exercises: string[];
}

export interface Client {
  user_id: string;
  name: string;
  email: string;
  age: number;
  goal: string;
  gymId: string;
  routines: Routine[];
}
