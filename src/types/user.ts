export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // 'client' | 'trainer' | 'admin'
}
