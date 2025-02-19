import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.warn('⚠️ No user authenticated, skipping token.');
      return config;
    }

    try {
      const token = await user.getIdToken();
      console.log('🔐 Token enviado:', token);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('🚨 Error obteniendo token:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
