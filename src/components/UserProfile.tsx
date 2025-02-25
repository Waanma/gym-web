'use client';

import React from 'react';
import { User } from '@/types/user';
import UserRoutines from '@/components/UserRoutines';
import { Exercise } from '@/types/routine';

const DEFAULT_AVATAR = 'https://via.placeholder.com/150?text=User+Avatar';

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  // Función para editar un ejercicio (podrías abrir un modal o navegar a otro formulario)
  const handleEditExercise = (routineId: string, exercise: Exercise) => {
    alert(`Editar ejercicio "${exercise.name}" de la rutina ${routineId}`);
  };

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* Botón de cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Encabezado con foto e info principal */}
      <div className="p-6 border-b flex items-center">
        <img
          src={(user as any).photoURL || DEFAULT_AVATAR}
          alt="User Avatar"
          className="w-20 h-20 rounded-full object-cover bg-black"
        />
        <div className="ml-6">
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.role}</p>
          <p className="text-sm text-gray-500 mt-1">Gym ID: {user.gym_id}</p>
        </div>
      </div>

      {/* Sección de datos adicionales */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-2 text-black">
          Información adicional
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">Registrado desde:</span>{' '}
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Última actualización:</span>{' '}
            {user.updatedAt
              ? new Date(user.updatedAt).toLocaleDateString()
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Sección de rutinas */}
      <div className="flex-1 p-6 overflow-auto">
        <h3 className="text-lg font-semibold mb-4 text-black">Rutinas</h3>
        <UserRoutines
          userId={user.user_id}
          onEditExercise={handleEditExercise}
        />
      </div>
    </div>
  );
}
