'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Routine, Exercise } from '@/types/routine';
import ExerciseModal from '@/components/ExerciseModal';
import { useRoutineStore } from '@/store/routineStore';
import { useUserStore } from '@/store/userStore';

interface RoutineManagerProps {
  routine: Routine | null;
  onClose: () => void;
  clientId?: string;
}

export default function RoutineManager({
  routine,
  onClose,
  clientId,
}: RoutineManagerProps) {
  const {
    updateRoutine,
    createRoutine,
    addExercise,
    updateExercise,
    deleteRoutine,
  } = useRoutineStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const currentUserId = clientId || currentUser?.user_id || '';

  const initialStep = routine ? 2 : 1;
  const [step, setStep] = useState<number>(initialStep);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Campos del formulario de rutina (nombre obligatorio y descripción opcional)
  const [routineName, setRoutineName] = useState<string>(
    routine ? routine.name : ''
  );
  const [routineDescription, setRoutineDescription] = useState<string>(
    routine?.description ?? ''
  );

  const [currentRoutine, setCurrentRoutine] = useState<Routine>(
    routine || {
      routine_id: '',
      user_id: currentUserId,
      name: '',
      description: '',
      exercises: [],
      created_by: currentUserId,
      updated_by: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [selectedDay, setSelectedDay] = useState<number>(1);

  const [showExerciseModal, setShowExerciseModal] = useState<boolean>(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [showDaySelectorInModal, setShowDaySelectorInModal] =
    useState<boolean>(false);

  const [showEditRoutineModal, setShowEditRoutineModal] =
    useState<boolean>(false);

  useEffect(() => {
    if (routine) {
      setRoutineName(routine.name);
      setRoutineDescription(routine.description ?? '');
      setCurrentRoutine({
        ...routine,
        exercises: routine.exercises || [],
      });
      setStep(2);
    } else {
      setRoutineName('');
      setRoutineDescription('');
      setCurrentRoutine({
        routine_id: '',
        user_id: currentUserId,
        name: '',
        description: '',
        exercises: [],
        created_by: currentUserId,
        updated_by: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setStep(1);
    }
  }, [routine, currentUserId]);

  const validateRoutine = (): boolean => {
    if (!routineName.trim()) {
      setError('Routine name is required');
      return false;
    }
    return true;
  };

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setError('');
    if (!validateRoutine()) return;
    setLoading(true);
    try {
      if (!currentRoutine.routine_id) {
        const newRoutine: Routine = {
          ...currentRoutine,
          name: routineName,
          description: routineDescription,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const createdRoutine = await createRoutine(newRoutine);
        setCurrentRoutine(createdRoutine);
      } else {
        await updateRoutine(currentRoutine.routine_id, {
          name: routineName,
          description: routineDescription,
          exercises: currentRoutine.exercises,
        });
      }
      setStep(2);
    } catch (err) {
      console.error('Error saving routine:', err);
      setError(err instanceof Error ? err.message : 'Error saving routine');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setError('');
    if (!validateRoutine()) return;
    setLoading(true);
    try {
      if (currentRoutine.routine_id) {
        await updateRoutine(currentRoutine.routine_id, {
          name: routineName,
          description: routineDescription,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving routine:', err);
      setError(err instanceof Error ? err.message : 'Error saving routine');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar la rutina con confirmación
  const handleDeleteRoutine = async () => {
    if (!currentRoutine.routine_id) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this routine? This action cannot be undone.'
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteRoutine(currentRoutine.routine_id);
      onClose();
    } catch (err) {
      console.error('Error deleting routine:', err);
      setError('Error deleting routine');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddExercise = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExerciseToEdit(null);
    setShowDaySelectorInModal(false);
    setShowExerciseModal(true);
  };

  const handleOpenAddDay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExerciseToEdit(null);
    setShowDaySelectorInModal(true);
    setShowExerciseModal(true);
  };

  const handleEditExercise = (
    exercise: Exercise,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setExerciseToEdit(exercise);
    setShowDaySelectorInModal(false);
    setShowExerciseModal(true);
  };

  // Nueva función para eliminar un ejercicio con confirmación
  const handleDeleteExercise = (
    exercise: Exercise,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      'Are you sure you want to delete this exercise?'
    );
    if (!confirmed) return;
    const updatedExercises = (currentRoutine.exercises || []).filter(
      (ex) => ex.id !== exercise.id
    );
    setCurrentRoutine({ ...currentRoutine, exercises: updatedExercises });
    // Si tienes deleteExercise en tu store, también podrías llamarlo:
    // deleteExercise(exercise.id, currentRoutine.routine_id);
  };

  const onAddExercise = (exercise: Exercise) => {
    if (exerciseToEdit === null && exercise.day === undefined) {
      exercise.day = showDaySelectorInModal ? exercise.day : selectedDay;
    }
    if (exerciseToEdit) {
      updateExercise(exercise, currentRoutine.routine_id);
      const updatedExercises = (currentRoutine.exercises || []).map((ex) =>
        ex.id === exercise.id ? exercise : ex
      );
      setCurrentRoutine({ ...currentRoutine, exercises: updatedExercises });
    } else {
      addExercise(exercise, currentRoutine.routine_id);
      setCurrentRoutine({
        ...currentRoutine,
        exercises: [exercise, ...(currentRoutine.exercises || [])],
      });
    }
  };

  const uniqueDays = Array.from(
    new Set((currentRoutine.exercises || []).map((ex) => ex.day))
  ).sort((a, b) => a - b);
  const dayOptions = uniqueDays.length > 0 ? uniqueDays : [selectedDay];

  const exercisesForDay = (currentRoutine.exercises || []).filter(
    (ex) => ex.day === selectedDay
  );

  const EditRoutineModal = () => {
    const [tempName, setTempName] = useState(routineName);
    const [tempDescription, setTempDescription] = useState(routineDescription);

    const handleSave = () => {
      setRoutineName(tempName);
      setRoutineDescription(tempDescription);
      setShowEditRoutineModal(false);
    };

    return (
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50"
        onClick={() => setShowEditRoutineModal(false)}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-4">Edit Routine</h3>
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-1">
              Routine Name
            </label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-1">
              Routine Description (optional)
            </label>
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowEditRoutineModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 text-gray-800"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 flex items-center justify-between">
          {step === 2 ? (
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white">{routineName}</h2>
              <button
                onClick={() => setShowEditRoutineModal(true)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M4 13.5V20h6.5l9.9-9.9-6.5-6.5L4 13.5z"
                  />
                </svg>
              </button>
              <button
                onClick={handleDeleteRoutine}
                className="text-red-400 hover:text-red-600"
                title="Delete Routine"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-white">Routine Manager</h2>
          )}
          <button
            onClick={onClose}
            className="text-white text-3xl hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        {loading && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-white bg-opacity-75">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          </div>
        )}
        <div className="p-6">
          {error && <p className="mb-4 text-red-600">{error}</p>}
          {/* Step 1: Datos de rutina */}
          <div
            className={`transition-all duration-500 ${
              step === 1
                ? 'opacity-100 max-h-full'
                : 'opacity-0 max-h-0 overflow-hidden'
            }`}
          >
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">
                Routine Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Enter routine name"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">
                Routine Description
              </label>
              <textarea
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                placeholder="Enter routine description"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          {/* Step 2: Ejercicios */}
          <div
            className={`transition-all duration-500 ${
              step === 2
                ? 'opacity-100 max-h-full'
                : 'opacity-0 max-h-0 overflow-hidden'
            }`}
          >
            <div className="mb-6 flex items-end">
              <div className="flex-grow">
                <label className="block text-lg font-semibold mb-2">
                  Select Day
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>
                      {`Day ${day}`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleOpenAddDay}
                disabled={loading}
                className="ml-4 px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition disabled:opacity-50"
              >
                Add Day
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-4">
                Exercises for Day {selectedDay}
              </h3>
              {/* Contenedor con scroll vertical */}
              <div className="max-h-96 overflow-y-auto">
                <ul className="space-y-4">
                  {exercisesForDay.map((exercise, index) => (
                    <li
                      key={`${exercise.id}-${index}`}
                      className="px-3 py-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">
                          {exercise.name}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEditExercise(exercise, e)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteExercise(exercise, e)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Exercise"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-around mt-1">
                        {exercise.weight > 0 && (
                          <div className="w-16 bg-blue-50 p-1 rounded flex flex-col items-center">
                            <span className="text-xs text-gray-600 font-semibold">
                              Weight
                            </span>
                            <span className="mt-1 text-xs font-medium text-blue-600">
                              {exercise.weight}
                            </span>
                          </div>
                        )}
                        {exercise.reps > 0 && (
                          <div className="w-16 bg-blue-50 p-1 rounded flex flex-col items-center">
                            <span className="text-xs text-gray-600 font-semibold">
                              Reps
                            </span>
                            <span className="mt-1 text-xs font-medium text-blue-600">
                              {exercise.reps}
                            </span>
                          </div>
                        )}
                        {exercise.sets > 0 && (
                          <div className="w-16 bg-blue-50 p-1 rounded flex flex-col items-center">
                            <span className="text-xs text-gray-600 font-semibold">
                              Sets
                            </span>
                            <span className="mt-1 text-xs font-medium text-blue-600">
                              {exercise.sets}
                            </span>
                          </div>
                        )}
                        {exercise.time &&
                          exercise.time !== '00:00' &&
                          exercise.time !== '0:00' && (
                            <div className="w-16 bg-blue-50 p-1 rounded flex flex-col items-center">
                              <span className="text-xs text-gray-600 font-semibold">
                                Duration
                              </span>
                              <span className="mt-1 text-xs font-medium text-blue-600">
                                {exercise.time}
                              </span>
                            </div>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleOpenAddExercise}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                >
                  Add Exercise
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Save Routine
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showExerciseModal && (
        <ExerciseModal
          onClose={() => {
            setShowExerciseModal(false);
            setExerciseToEdit(null);
          }}
          routineId={currentRoutine.routine_id}
          onAddExercise={onAddExercise}
          exercise={exerciseToEdit || undefined}
          showDaySelector={showDaySelectorInModal}
          defaultDay={selectedDay}
          existingDays={uniqueDays}
        />
      )}
      {showEditRoutineModal && <EditRoutineModal />}
    </div>,
    document.body
  );
}
