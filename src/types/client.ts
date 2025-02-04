export interface Routine {
  day: number;
  exercises: string[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  age: number;
  goal: string;
  gymId: string;
  routines: Routine[];
}
