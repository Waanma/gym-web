export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  gym_name: string;
  gym_address: string;
  gym_id?: string | null; // allow null
  name?: string;
  phone_number?: string;
  address?: string;
};
