export type User = {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  role: string | null;
  gym_id: string | null;
  photo_url?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
