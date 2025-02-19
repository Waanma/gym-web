import { getAuth } from 'firebase/auth';

export const getFirebaseToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.warn('⚠️ No hay usuario autenticado.');
    return null;
  }

  try {
    const token = await user.getIdToken(true);
    console.log('🔐 Token obtenido:', token);
    return token;
  } catch (error) {
    console.error('🚨 Error obteniendo token:', error);
    return null;
  }
};
