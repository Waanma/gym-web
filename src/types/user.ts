export type User = {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  role: 'client' | 'trainer' | 'admin';
  gym_id?: string;
};
