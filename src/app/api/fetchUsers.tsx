import api from '@/services/axiosConfig';

async function fetchUsers() {
  try {
    const response = await api.get('/users');
    console.log('Usuarios obtenidos:', response.data);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
  }
}
export default fetchUsers();
