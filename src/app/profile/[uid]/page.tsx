'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useGymStore } from '@/store/gymStore';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateCurrentUser, fetchCurrentUser } = useUserStore();
  const { gym, fetchGymById, updateGym } = useGymStore();

  // Estados para modo edición
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingGym, setIsEditingGym] = useState(false);
  // Nuevo estado para asociar Gym
  const [isAssociatingGym, setIsAssociatingGym] = useState(false);

  // Estado para el formulario de usuario
  const [userFormData, setUserFormData] = useState({
    name: currentUser?.name || '',
    gym_id: currentUser?.gym_id || '',
    phone_number: currentUser?.phone_number || '',
    address: currentUser?.address || '',
  });
  // Estado para el formulario de gimnasio (solo para admin)
  const [gymFormData, setGymFormData] = useState({
    gym_name: gym?.name || '',
    gym_address: gym?.gym_address || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Actualizar formularios cuando currentUser o gym cambien
  useEffect(() => {
    if (currentUser) {
      setUserFormData({
        name: currentUser.name,
        gym_id: currentUser.gym_id || '',
        phone_number: currentUser.phone_number || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (gym) {
      setGymFormData({
        gym_name: gym.name,
        gym_address: gym.gym_address,
      });
    }
  }, [gym]);

  // Cargar currentUser si aún no está disponible
  useEffect(() => {
    if (!currentUser) {
      fetchCurrentUser();
    }
  }, [currentUser, fetchCurrentUser]);

  // Función para guardar cambios en el usuario
  const handleSaveUserChanges = async () => {
    if (!userFormData.gym_id.trim()) {
      setError('El Gym ID no puede estar vacío.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateCurrentUser({
        name: userFormData.name,
        gym_id: userFormData.gym_id,
        phone_number: userFormData.phone_number,
        address: userFormData.address,
      });
      if (userFormData.gym_id) {
        await fetchGymById(userFormData.gym_id);
      }
      setIsEditingUser(false);
      setSuccessMsg('Perfil actualizado correctamente.');
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Función para asociar Gym (para clientes)
  const handleAssociateGym = async () => {
    if (!userFormData.gym_id.trim()) {
      setError('El Gym ID no puede estar vacío.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateCurrentUser({ gym_id: userFormData.gym_id });
      // Se actualiza la información del gym en el store
      await fetchGymById(userFormData.gym_id);
      setIsAssociatingGym(false);
      setSuccessMsg(
        `✅ Asociado con Gym: ${gym ? gym.name : userFormData.gym_id}`
      );
    } catch (err: unknown) {
      console.error('Error associating gym:', err);
      setError('Error al asociar el gimnasio.');
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar cambios en el gimnasio (solo para admin)
  const handleSaveGymChanges = async () => {
    if (!currentUser?.gym_id) {
      setError('No hay Gym ID asociado.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateGym(currentUser.gym_id, {
        name: gymFormData.gym_name,
        gym_address: gymFormData.gym_address,
      });
      setIsEditingGym(false);
      setSuccessMsg('Información del gimnasio actualizada correctamente.');
    } catch (err: unknown) {
      console.error('Error updating gym:', err);
      setError('Error al actualizar el gimnasio.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    if (currentUser) {
      setUserFormData({
        name: currentUser.name,
        gym_id: currentUser.gym_id || '',
        phone_number: currentUser.phone_number || '',
        address: currentUser.address || '',
      });
    }
    setError('');
    setIsEditingUser(false);
    setIsEditingGym(false);
    setIsAssociatingGym(false);
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
          {!isEditingUser && (
            <button
              onClick={() => setIsEditingUser(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Editar
            </button>
          )}
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-black font-medium">Nombre:</label>
            {isEditingUser ? (
              <input
                type="text"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData((prev) => ({ ...prev, name: e.target.value }))
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
            {isEditingUser ? (
              <input
                type="text"
                value={userFormData.phone_number}
                onChange={(e) =>
                  setUserFormData((prev) => ({
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
            {isEditingUser ? (
              <input
                type="text"
                value={userFormData.address}
                onChange={(e) =>
                  setUserFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
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
          {currentUser?.gym_id ? (
            <p className="text-green-600">
              ✅ Asociado con Gym: {gym ? gym.name : currentUser.gym_id}
            </p>
          ) : (
            <>
              {isAssociatingGym ? (
                <>
                  <input
                    type="text"
                    value={userFormData.gym_id}
                    onChange={(e) =>
                      setUserFormData((prev) => ({
                        ...prev,
                        gym_id: e.target.value,
                      }))
                    }
                    className="border p-2 rounded w-full mt-2 text-black"
                    placeholder="Ingrese Gym ID"
                  />
                  <button
                    onClick={handleAssociateGym}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Asociar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAssociatingGym(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Asociar
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Sección para Admin: Información del Gimnasio */}
      {currentUser?.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Información del Gimnasio
          </h2>
          {isEditingGym ? (
            <>
              <label className="block text-black font-medium">
                Nombre del Gimnasio:
              </label>
              <input
                type="text"
                value={gymFormData.gym_name}
                onChange={(e) =>
                  setGymFormData((prev) => ({
                    ...prev,
                    gym_name: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full text-black"
              />
              <label className="block text-black font-medium mt-4">
                Dirección:
              </label>
              <input
                type="text"
                value={gymFormData.gym_address}
                onChange={(e) =>
                  setGymFormData((prev) => ({
                    ...prev,
                    gym_address: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full text-black"
              />
              <button
                onClick={handleSaveGymChanges}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={() => setIsEditingGym(false)}
                className="mt-2 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
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
                  No se encontró información del gimnasio.
                </p>
              )}
              <button
                onClick={() => setIsEditingGym(true)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Editar Gym Info
              </button>
            </>
          )}
        </div>
      )}

      {/* Botones para guardar o cancelar la edición del usuario */}
      {isEditingUser && (
        <div className="flex space-x-4">
          <button
            onClick={handleSaveUserChanges}
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
