// components/UserRoutines.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Routine, Exercise } from '@/types/routine';
import { useRouter } from 'next/navigation';

interface UserRoutinesProps {
  userId: string;
  onEditExercise: (routineId: string, exercise: Exercise) => void;
}

export default function UserRoutines({
  userId,
  onEditExercise,
}: UserRoutinesProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [expandedRoutines, setExpandedRoutines] = useState<string[]>([]);
  const router = useRouter();

  // Obtiene las rutinas del backend para el usuario
  useEffect(() => {
    async function fetchRoutines() {
      try {
        const res = await fetch(`/api/routines?userId=${userId}`);
        const data = await res.json();
        setRoutines(data);
      } catch (error) {
        console.error('Error fetching routines:', error);
      }
    }
    fetchRoutines();
  }, [userId]);

  // Filtra las rutinas usando el mes derivado de createdAt
  const filteredRoutines = routines.filter((routine) => {
    if (selectedMonth === 'All') return true;
    const month = new Date(routine.createdAt).toLocaleString('default', {
      month: 'long',
    });
    return month === selectedMonth;
  });

  const toggleRoutine = (routineId: string) => {
    if (expandedRoutines.includes(routineId)) {
      setExpandedRoutines(expandedRoutines.filter((r) => r !== routineId));
    } else {
      setExpandedRoutines([...expandedRoutines, routineId]);
    }
  };

  const handleAddNewRoutine = () => {
    // Redirige al componente RoutineManager, que en este caso se mostrará como modal.
    // La implementación exacta dependerá de tu flujo de navegación; por ejemplo,
    // podrías usar un estado global para mostrar el modal o redirigir a una ruta dedicada.
    router.push('/routine-manager'); // Ejemplo de redirección
  };

  return (
    <div>
      {/* Month selector */}
      <div className="mb-4">
        <label htmlFor="month-select" className="mr-2 font-semibold">
          Month:
        </label>
        <select
          id="month-select"
          className="border px-2 py-1 rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">All</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>

      {/* If no routines found, show message and button */}
      {filteredRoutines.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No routines found.</p>
          <button
            onClick={handleAddNewRoutine}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add New Routine
          </button>
        </div>
      ) : (
        <>
          {/* List of routines */}
          <div className="space-y-4">
            {filteredRoutines.map((routine) => (
              <div key={routine.routine_id} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-lg">{routine.name}</h4>
                    <p className="text-xs text-gray-500">
                      Created:{' '}
                      {new Date(routine.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRoutine(routine.routine_id)}
                    className="text-blue-600 focus:outline-none"
                  >
                    {expandedRoutines.includes(routine.routine_id)
                      ? 'Close'
                      : 'Open'}
                  </button>
                </div>
                <div
                  className={`mt-4 transition-all duration-300 ease-in-out ${
                    expandedRoutines.includes(routine.routine_id)
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  {routine.exercises && routine.exercises.length > 0 ? (
                    routine.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex justify-between items-center mb-2"
                      >
                        <p className="font-semibold">{exercise.name}</p>
                        <button
                          onClick={() =>
                            onEditExercise(routine.routine_id, exercise)
                          }
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No exercises in this routine.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Always show Add New Routine button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleAddNewRoutine}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Add New Routine
            </button>
          </div>
        </>
      )}
    </div>
  );
}
