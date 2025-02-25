import { RegisterFormData } from "./registration";

export type AuthStoreState = {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  verifyEmail: (email: string) => Promise<boolean>;
  registerUser: (formData: RegisterFormData) => Promise<string | null>;
};
