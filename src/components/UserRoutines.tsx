'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Routine, Exercise } from '@/types/routine';
import RoutineManager from './RoutineManager';
import { getAuth } from 'firebase/auth';

interface UserRoutinesProps {
  userId: string;
  onEditExercise: (routineId: string, exercise: Exercise) => void;
}

// Función para transformar una fecha al formato ISO (si no lo está)
const parseISODate = (dateString: string): string => {
  if (dateString.includes('T')) return dateString;
  const parts = dateString.split(' ');
  if (parts.length >= 2) {
    return (
      parts[0] +
      'T' +
      parts[1] +
      (parts.length >= 3 ? parts.slice(2).join('') : '')
    );
  }
  return dateString;
};

export default function UserRoutines({
  userId,
  onEditExercise,
}: UserRoutinesProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [expandedRoutines, setExpandedRoutines] = useState<string[]>([]);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Nuevo estado para almacenar la rutina a editar/crear
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/routines?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch routines. Status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Data from API:', data);
      // Aseguramos que cada rutina tenga exercises como array
      const routinesWithExercises: Routine[] = data.map((r: Routine) => ({
        ...r,
        exercises: Array.isArray(r.exercises) ? r.exercises : [],
      }));
      // Ordenar de forma descendente: última creada arriba
      const sortedData = routinesWithExercises.sort(
        (a: Routine, b: Routine) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log('Fetched routines:', sortedData);
      setRoutines(sortedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching routines:', err);
        setError(err.message);
      } else {
        console.error('Error fetching routines:', err);
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, userId]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  // Filtra las rutinas por mes
  const filteredRoutines = routines.filter((routine) => {
    if (selectedMonth === 'All') return true;
    const isoDate = parseISODate(routine.createdAt);
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) return false;
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    return month === selectedMonth;
  });

  const toggleRoutine = (routineId: string) => {
    setExpandedRoutines((prev) =>
      prev.includes(routineId)
        ? prev.filter((id) => id !== routineId)
        : [...prev, routineId]
    );
  };

  const handleRoutineSave = async () => {
    setIsRoutineModalOpen(false);
    // Al cerrar el modal, se limpia la rutina seleccionada
    setSelectedRoutine(null);
    await fetchRoutines();
  };

  const handleAddNewRoutine = () => {
    // Para crear una nueva rutina, se limpia la rutina seleccionada
    setSelectedRoutine(null);
    setIsRoutineModalOpen(true);
  };

  const handleEditRoutine = (routine: Routine) => {
    // Al editar, se establece la rutina seleccionada en el estado local y se abre el modal
    setSelectedRoutine(routine);
    setIsRoutineModalOpen(true);
  };

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Routines</h2>
        <button
          onClick={handleAddNewRoutine}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add New Routine
        </button>
      </div>

      {/* Filtro por mes */}
      <div className="mb-6 flex items-center">
        <label
          htmlFor="month-select"
          className="mr-3 text-lg font-medium text-gray-700"
        >
          Filter by Month:
        </label>
        <select
          id="month-select"
          className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">All</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Mensajes de carga y error */}
      {loading && (
        <p className="text-center text-gray-500">Loading routines...</p>
      )}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && filteredRoutines.length === 0 && (
        <p className="text-center text-gray-500">
          No routines found for {selectedMonth}.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredRoutines.map((routine) => (
          <div
            key={routine.routine_id}
            className="bg-white shadow-lg rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {routine.name || 'Unnamed Routine'}
                </h3>
                <p className="text-sm text-gray-500">
                  Created on:{' '}
                  {new Date(parseISODate(routine.createdAt)).toLocaleDateString(
                    'en-US'
                  )}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => toggleRoutine(routine.routine_id)}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  {expandedRoutines.includes(routine.routine_id)
                    ? 'Hide Details'
                    : 'Show Details'}
                </button>
                <button
                  onClick={() => handleEditRoutine(routine)}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  Edit Routine
                </button>
              </div>
            </div>
            {expandedRoutines.includes(routine.routine_id) && (
              <div className="border-t border-gray-200 pt-4">
                {routine.exercises && routine.exercises.length > 0 ? (
                  <ul className="space-y-4">
                    {routine.exercises.map((exercise) => (
                      <li
                        key={exercise.id}
                        className="bg-white p-4 rounded-md shadow-sm"
                      >
                        <p className="text-lg font-semibold text-gray-800">
                          {exercise.name}
                        </p>
                        <div className="mt-2 flex justify-around">
                          <div className="flex flex-col items-center">
                            <div className="w-20 bg-blue-200/50 border border-blue-300 rounded-t-md text-center text-sm font-medium text-gray-500">
                              Weight
                            </div>
                            <div className="w-20 h-8 flex items-center justify-center border border-blue-300 rounded-b-md">
                              <span className="text-sm text-gray-700">
                                {exercise.weight}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-20 bg-blue-200/50 border border-blue-300 rounded-t-md text-center text-sm font-medium text-gray-500">
                              Sets
                            </div>
                            <div className="w-20 h-8 flex items-center justify-center border border-blue-300 rounded-b-md">
                              <span className="text-sm text-gray-700">
                                {exercise.sets}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-20 bg-blue-200/50 border border-blue-300 rounded-t-md text-center text-sm font-medium text-gray-500">
                              Reps
                            </div>
                            <div className="w-20 h-8 flex items-center justify-center border border-blue-300 rounded-b-md">
                              <span className="text-sm text-gray-700">
                                {exercise.reps}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-right">
                          <button
                            onClick={() =>
                              onEditExercise(routine.routine_id, exercise)
                            }
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No exercises added yet.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isRoutineModalOpen && (
        <RoutineManager routine={selectedRoutine} onClose={handleRoutineSave} />
      )}
    </div>
  );
}
