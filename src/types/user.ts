export type User = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  role: 'client' | 'trainer' | 'admin';
  gym_id?: string;
};
