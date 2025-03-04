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
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para la rutina a editar/crear
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
      const res = await fetch(`${API_BASE_URL}/users/${userId}/routines`, {
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
      const routinesWithExercises: Routine[] = data.map((r: Routine) => ({
        ...r,
        exercises: Array.isArray(r.exercises) ? r.exercises : [],
      }));
      const sortedData = routinesWithExercises.sort(
        (a: Routine, b: Routine) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRoutines(sortedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
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

  // Maneja el desplegable por día (clave: `${routineId}-${day}`)
  const toggleDay = (routineId: string, day: number) => {
    const key = `${routineId}-${day}`;
    setExpandedDays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRoutineSave = async () => {
    setIsRoutineModalOpen(false);
    setSelectedRoutine(null);
    await fetchRoutines();
  };

  const handleAddNewRoutine = () => {
    setSelectedRoutine(null);
    setIsRoutineModalOpen(true);
  };

  const handleEditRoutine = (routine: Routine) => {
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

      {/* Lista de rutinas */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRoutines.map((routine) => {
          const isRoutineExpanded = expandedRoutines.includes(
            routine.routine_id
          );
          // Aseguramos que exercises sea siempre un array
          const exercises = routine.exercises ?? [];
          // Obtenemos los días únicos de esta rutina
          const days = Array.from(new Set(exercises.map((ex) => ex.day))).sort(
            (a, b) => a - b
          );

          return (
            <div
              key={routine.routine_id}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              {/* Cabecera de la rutina */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {routine.name || 'Unnamed Routine'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created on:{' '}
                    {new Date(
                      parseISODate(routine.createdAt)
                    ).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => toggleRoutine(routine.routine_id)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    {isRoutineExpanded ? 'Hide Details' : 'Show Details'}
                  </button>
                  <button
                    onClick={() => handleEditRoutine(routine)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    Edit Routine
                  </button>
                </div>
              </div>

              {/* Detalles de la rutina (ejercicios agrupados por día) */}
              {isRoutineExpanded && (
                <div className="border-t border-gray-200 pt-4">
                  {exercises.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No exercises added yet.
                    </p>
                  ) : (
                    days.map((day) => {
                      const key = `${routine.routine_id}-${day}`;
                      const isDayExpanded = !!expandedDays[key];
                      // Filtrar ejercicios de este día
                      const dayExercises = exercises.filter(
                        (ex) => ex.day === day
                      );

                      return (
                        <div key={day} className="mb-4 bg-gray-200">
                          {/* Encabezado para el día con ícono rotatorio */}
                          <div className="flex justify-between items-center mb-2 bg-gray-200 p-2">
                            <h4 className="text-lg font-medium text-gray-700">
                              Day {day}
                            </h4>
                            <button
                              onClick={() => toggleDay(routine.routine_id, day)}
                              className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none text-sm"
                            >
                              <span className="mr-1">
                                {isDayExpanded
                                  ? 'Hide Exercises'
                                  : 'Show Exercises'}
                              </span>
                              <svg
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isDayExpanded ? 'rotate-180' : 'rotate-0'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                          {/* Contenedor animado para la lista de ejercicios */}
                          <div
                            className={`
                              transition-all duration-300 ease-in-out overflow-hidden
                              ${
                                isDayExpanded
                                  ? 'max-h-96 opacity-100'
                                  : 'max-h-0 opacity-0'
                              }
                            `}
                          >
                            <ul className="space-y-4 p-3">
                              {dayExercises.map((exercise) => (
                                <li
                                  key={exercise.id}
                                  className="p-4 border rounded-md shadow-sm bg-white"
                                >
                                  {/* Título y botón Edit */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <h5 className="text-md font-semibold text-gray-800">
                                      {exercise.name}
                                    </h5>
                                    <button
                                      onClick={() =>
                                        onEditExercise(
                                          routine.routine_id,
                                          exercise
                                        )
                                      }
                                      className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition-colors"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                  {/* Datos del ejercicio en grid */}
                                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {exercise.time &&
                                      exercise.time !== '00:00:00' && (
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            Duration
                                          </p>
                                          <p className="text-base font-medium text-gray-800">
                                            {exercise.time}
                                          </p>
                                        </div>
                                      )}
                                    {exercise.weight > 0 && (
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Weight
                                        </p>
                                        <p className="text-base font-medium text-gray-800">
                                          {exercise.weight}
                                        </p>
                                      </div>
                                    )}
                                    {exercise.sets > 0 && (
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Sets
                                        </p>
                                        <p className="text-base font-medium text-gray-800">
                                          {exercise.sets}
                                        </p>
                                      </div>
                                    )}
                                    {exercise.reps > 0 && (
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Reps
                                        </p>
                                        <p className="text-base font-medium text-gray-800">
                                          {exercise.reps}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isRoutineModalOpen && (
        <RoutineManager
          routine={selectedRoutine}
          onClose={handleRoutineSave}
          clientId={userId}
        />
      )}
    </div>
  );
}
