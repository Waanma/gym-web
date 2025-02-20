export type RegisterFormData = {
  role: 'client' | 'trainer' | 'admin'; // Role de usuario
  gym_name: string; // Nombre del gimnasio
  gym_address: string; // Dirección del gimnasio (solo si el usuario es un admin)
  email: string; // Correo electrónico
  password: string; // Contraseña
  confirmPassword: string; // Confirmación de la contraseña
  gym_id?: string | null | undefined; // ID del gimnasio (solo si el usuario es un trainer)
  name?: string; // Nombre completo del usuario (required for all)
  phone_number?: string; // Número de teléfono del usuario
  address?: string; // Dirección del usuario
};
