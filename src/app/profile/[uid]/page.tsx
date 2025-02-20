'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useGymStore } from '@/store/gymStore';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, fetchCurrentUser, updateCurrentUser } = useUserStore();
  const { gym, fetchGymById } = useGymStore();

  // Estado para el modo edición y para el formulario, incluyendo teléfono y dirección
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    gym_id: currentUser?.gym_id || '',
    phone_number: currentUser?.phone_number || '',
    address: currentUser?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Actualiza el formData cuando currentUser cambia
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        gym_id: currentUser.gym_id || '',
        phone_number: currentUser.phone_number || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  // Carga currentUser si aún no está disponible
  useEffect(() => {
    if (!currentUser) {
      fetchCurrentUser();
    }
  }, [currentUser, fetchCurrentUser]);

  // Función para guardar cambios utilizando updateCurrentUser del store
  const handleSaveChanges = async () => {
    if (!formData.gym_id.trim()) {
      setError('El Gym ID no puede estar vacío.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      // Llamamos a la función del store para actualizar el usuario
      await updateCurrentUser({
        name: formData.name,
        gym_id: formData.gym_id,
        phone_number: formData.phone_number,
        address: formData.address,
      });
      // Si es necesario, actualizamos la información del gimnasio
      if (formData.gym_id) {
        await fetchGymById(formData.gym_id);
      }
      setIsEditing(false);
      setSuccessMsg('Perfil actualizado correctamente.');
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar la edición y restaurar valores originales
  const handleCancelEdit = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        gym_id: currentUser.gym_id || '',
        phone_number: currentUser.phone_number || '',
        address: currentUser.address || '',
      });
    }
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header con botón para volver atrás */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-black hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-black">Perfil</h1>

      {/* Sección de Información Personal */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-black">
            Información Personal
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Editar
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-black font-medium">Nombre:</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border p-2 rounded w-full text-black"
              />
            ) : (
              <p className="mt-1 text-black">{currentUser?.name}</p>
            )}
          </div>
          <div>
            <label className="block text-black font-medium">Email:</label>
            <p className="mt-1 text-black">{currentUser?.email}</p>
          </div>
          <div>
            <label className="block text-black font-medium">Rol:</label>
            <p className="mt-1 text-black">{currentUser?.role}</p>
          </div>
          <div>
            <label className="block text-black font-medium">Teléfono:</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full text-black"
              />
            ) : (
              <p className="mt-1 text-black">
                {currentUser?.phone_number || 'No registrado'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-black font-medium">Dirección:</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="border p-2 rounded w-full text-black"
              />
            ) : (
              <p className="mt-1 text-black">
                {currentUser?.address || 'No registrada'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sección para asociar Gym (solo para clientes) */}
      {currentUser?.role === 'client' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Asociar Gimnasio
          </h2>
          {isEditing ? (
            <>
              <label className="block text-black font-medium">Gym ID:</label>
              <input
                type="text"
                value={formData.gym_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gym_id: e.target.value }))
                }
                className="border p-2 rounded w-full mt-2 text-black"
                placeholder="Ingrese Gym ID"
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </>
          ) : currentUser?.gym_id ? (
            <p className="text-green-600">
              ✅ Asociado con Gym ID: {currentUser.gym_id}
            </p>
          ) : (
            <p className="text-black">No estás asociado a ningún gimnasio.</p>
          )}
        </div>
      )}

      {/* Sección para Admin/Trainer: Información del Gimnasio */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'trainer') && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Información del Gimnasio
          </h2>
          {gym ? (
            <>
              <p className="mt-2 text-black">
                <strong>Nombre:</strong> {gym.name}
              </p>
              <p className="mt-1 text-black">
                <strong>Dirección:</strong> {gym.gym_address}
              </p>
              <p className="mt-1 text-black">
                <strong>ID del Propietario:</strong> {gym.owner_id}
              </p>
            </>
          ) : (
            <p className="text-black">
              No se encontró información del gimnasio. Contacta a soporte.
            </p>
          )}
        </div>
      )}

      {/* Botones para guardar o cancelar la edición */}
      {isEditing && (
        <div className="flex space-x-4">
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancelar
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {successMsg && <p className="mt-4 text-green-600">{successMsg}</p>}
    </div>
  );
}
