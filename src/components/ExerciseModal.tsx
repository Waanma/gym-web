'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '@/types/routine';
import exercisesList from '@/public/data/exercises.json';

interface ExerciseModalProps {
  onClose: () => void;
  routineId: string;
  onAddExercise: (exercise: Exercise) => void;
  // Nuevo prop opcional para eliminar el ejercicio (al editar)
  onDeleteExercise?: (exerciseId: string) => void;
  exercise?: Exercise;
  showDaySelector: boolean;
  defaultDay: number;
  existingExerciseNames?: string[];
  existingDays?: number[];
}

interface Errors {
  name: string;
  weight: string;
  reps: string;
  sets: string;
  day: string;
}

const predefinedExercises: { name: string }[] = [
  { name: 'Custom' },
  ...exercisesList,
];

const dayOptions = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];

// Helper: formatea segundos a "MM:SS"
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
function parseDuration(duration: string): number {
  const parts = duration.split(':');
  if (parts.length !== 2) return 0;
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  return minutes * 60 + seconds;
}

export default function ExerciseModal({
  onClose,
  onAddExercise,
  onDeleteExercise,
  exercise,
  showDaySelector,
  defaultDay,
  existingExerciseNames = [],
  existingDays = [],
}: ExerciseModalProps) {
  const [selectedPredefined, setSelectedPredefined] =
    useState<string>('Custom');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseWeight, setExerciseWeight] = useState<number>(0);
  const [exerciseReps, setExerciseReps] = useState<number>(0);
  const [exerciseSets, setExerciseSets] = useState<number>(0);
  // Para duration, usamos segundos (por ejemplo, 30 para 0:30).
  const [exerciseTime, setExerciseTime] = useState<number>(
    exercise && exercise.time ? parseDuration(exercise.time) : 0
  );

  // Usamos defaultDay directamente para la inicialización.
  const [exerciseDay, setExerciseDay] = useState<number>(
    exercise ? exercise.day : defaultDay
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownQuery, setDropdownQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<Errors>({
    name: '',
    weight: '',
    reps: '',
    sets: '',
    day: '',
  });

  const availableDays = exercise
    ? dayOptions.filter(
        (day) => day === exerciseDay || !existingDays.includes(day)
      )
    : dayOptions.filter((day) => !existingDays.includes(day));

  // Manejo de cambios en Weight, Sets y Reps
  const handleChangeWeight = (value: string) => {
    const numeric = parseInt(value, 10);
    setExerciseWeight(isNaN(numeric) ? 0 : numeric);
  };
  const handleChangeSets = (value: string) => {
    const numeric = parseInt(value, 10);
    setExerciseSets(isNaN(numeric) ? 0 : numeric);
  };
  const handleChangeReps = (value: string) => {
    const numeric = parseInt(value, 10);
    setExerciseReps(isNaN(numeric) ? 0 : numeric);
  };

  useEffect(() => {
    if (selectedPredefined !== 'Custom') {
      setExerciseName(selectedPredefined);
    }
  }, [selectedPredefined]);

  useEffect(() => {
    if (exercise) {
      setExerciseName(exercise.name);
      setExerciseWeight(exercise.weight);
      setExerciseReps(exercise.reps);
      setExerciseSets(exercise.sets);
      setExerciseTime(exercise.time ? parseDuration(exercise.time) : 0);
      setExerciseDay(exercise.day);
      if (
        predefinedExercises.some(
          (ex) => ex.name === exercise.name && ex.name !== 'Custom'
        )
      ) {
        setSelectedPredefined(exercise.name);
      } else {
        setSelectedPredefined('Custom');
      }
    }
  }, [exercise]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredExercises = predefinedExercises.filter((ex) => {
    const matchQuery = ex.name
      .toLowerCase()
      .includes(dropdownQuery.toLowerCase());
    if (exercise && ex.name === exercise.name) return matchQuery;
    return matchQuery && !existingExerciseNames.includes(ex.name);
  });

  const handleSelectExercise = (name: string) => {
    setSelectedPredefined(name);
    setIsDropdownOpen(false);
    setDropdownQuery('');
    if (name !== 'Custom') {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && dropdownQuery.trim() !== '') {
      setSelectedPredefined('Custom');
      setExerciseName(dropdownQuery.trim());
      setIsDropdownOpen(false);
    }
  };

  // Funciones de incremento/decremento para Weight, Sets, Reps y Duration
  const incrementWeight = () => setExerciseWeight((prev) => prev + 1);
  const decrementWeight = () =>
    setExerciseWeight((prev) => Math.max(0, prev - 1));
  const incrementSets = () => setExerciseSets((prev) => prev + 1);
  const decrementSets = () => setExerciseSets((prev) => Math.max(0, prev - 1));
  const incrementReps = () => setExerciseReps((prev) => prev + 1);
  const decrementReps = () => setExerciseReps((prev) => Math.max(0, prev - 1));
  // Incrementar o decrementar Duration en 15 segundos
  const incrementDuration = () => setExerciseTime((prev) => prev + 15);
  const decrementDuration = () =>
    setExerciseTime((prev) => Math.max(0, prev - 15));

  const validate = (): boolean => {
    let valid = true;
    const newErrors: Errors = {
      name: '',
      weight: '',
      reps: '',
      sets: '',
      day: '',
    };

    if (!exerciseName.trim()) {
      newErrors.name = 'Exercise name is required';
      valid = false;
    }

    // Solo validar weight, sets y reps si no se ha definido un tiempo.
    if (exerciseTime === 0) {
      if (exerciseWeight <= 0) {
        newErrors.weight = 'Weight must be greater than 0';
        valid = false;
      }
      if (exerciseReps <= 0) {
        newErrors.reps = 'Reps must be greater than 0';
        valid = false;
      }
      if (exerciseSets <= 0) {
        newErrors.sets = 'Sets must be greater than 0';
        valid = false;
      }
    }

    if (showDaySelector && (exerciseDay < 1 || exerciseDay > 7)) {
      newErrors.day = 'Please select a valid day (1-7)';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSaveExercise = () => {
    if (!validate()) return;

    const newExercise: Exercise = {
      id: exercise ? exercise.id : Date.now().toString(),
      name: exerciseName.trim(),
      day: showDaySelector ? exerciseDay : defaultDay,
      time: formatDuration(exerciseTime),
      weight: exerciseWeight,
      reps: exerciseReps,
      sets: exerciseSets,
    };

    console.log('Payload a enviar:', newExercise);
    onAddExercise(newExercise);
    onClose();
  };

  // Si se está editando, mostramos el botón de eliminar ejercicio
  const handleDelete = () => {
    if (onDeleteExercise && exercise) {
      const confirmed = window.confirm(
        'Are you sure you want to delete this exercise?'
      );
      if (confirmed) {
        onDeleteExercise(exercise.id);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {exercise ? 'Edit Exercise' : 'Add New Exercise'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            X
          </button>
        </div>

        {showDaySelector && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Day</label>
            <select
              value={exerciseDay}
              onChange={(e) => setExerciseDay(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {availableDays.map((day) => (
                <option key={day} value={day}>
                  {`Day ${day}`}
                </option>
              ))}
            </select>
            {errors.day && (
              <p className="text-red-500 text-xs mt-1">{errors.day}</p>
            )}
          </div>
        )}

        {exercise && (
          <div className="mb-4">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Delete Exercise
            </button>
          </div>
        )}

        <div className="mb-4 relative" ref={dropdownRef}>
          <label className="block font-semibold mb-1">
            Select Predefined Exercise
          </label>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full p-2 border rounded text-left"
          >
            {selectedPredefined === 'Custom' && !exerciseName
              ? 'Select Exercise'
              : selectedPredefined === 'Custom'
              ? 'Custom'
              : selectedPredefined}
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full bg-white border rounded mt-1">
              <input
                type="text"
                placeholder="Search..."
                value={dropdownQuery}
                onChange={(e) => setDropdownQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border-b"
              />
              <ul className="max-h-60 overflow-auto">
                {filteredExercises.map((ex) => (
                  <li
                    key={ex.name}
                    onClick={() => handleSelectExercise(ex.name)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {ex.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {selectedPredefined === 'Custom' && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Exercise Name</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Enter exercise name"
              className="w-full p-2 border rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
        )}

        {/* Controles personalizados para Weight, Sets, Reps, Duration */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Details</label>
          <div className="flex space-x-4">
            {/* Weight */}
            <div className="w-1/4">
              <div className="w-full bg-blue-200 border border-blue-300 rounded-t-md text-center text-sm font-medium text-gray-500">
                Weight
              </div>
              <div className="relative w-full h-10 border border-blue-300 rounded-b-md">
                <input
                  type="text"
                  className="w-full h-full text-center pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={exerciseWeight === 0 ? '' : exerciseWeight}
                  onChange={(e) => handleChangeWeight(e.target.value)}
                  placeholder="0"
                />
                <div className="absolute right-0 top-0 h-full w-6 flex flex-col border-l border-blue-300 bg-gray-100 rounded-tr-md rounded-br-md">
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={incrementWeight}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={decrementWeight}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
              )}
            </div>
            {/* Reps */}
            <div className="w-1/4">
              <div className="w-full bg-blue-200 border border-blue-300 rounded-t-md text-center text-sm font-medium text-gray-500">
                Reps
              </div>
              <div className="relative w-full h-10 border border-blue-300 rounded-b-md">
                <input
                  type="text"
                  className="w-full h-full text-center pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={exerciseReps === 0 ? '' : exerciseReps}
                  onChange={(e) => handleChangeReps(e.target.value)}
                  placeholder="0"
                />
                <div className="absolute right-0 top-0 h-full w-6 flex flex-col border-l border-blue-300 bg-gray-100 rounded-tr-md rounded-br-md">
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={incrementReps}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={decrementReps}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.reps && (
                <p className="text-red-500 text-xs mt-1">{errors.reps}</p>
              )}
            </div>
            {/* Sets */}
            <div className="w-1/4">
              <div className="w-full bg-blue-200 border border-blue-300 rounded-t-md text-center text-sm font-medium text-gray-500">
                Sets
              </div>
              <div className="relative w-full h-10 border border-blue-300 rounded-b-md">
                <input
                  type="text"
                  className="w-full h-full text-center pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={exerciseSets === 0 ? '' : exerciseSets}
                  onChange={(e) => handleChangeSets(e.target.value)}
                  placeholder="0"
                />
                <div className="absolute right-0 top-0 h-full w-6 flex flex-col border-l border-blue-300 bg-gray-100 rounded-tr-md rounded-br-md">
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={incrementSets}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={decrementSets}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {errors.sets && (
                <p className="text-red-500 text-xs mt-1">{errors.sets}</p>
              )}
            </div>
            {/* Duration */}
            <div className="w-1/4">
              <div className="w-full bg-blue-200 border border-blue-300 rounded-t-md text-center text-sm font-medium text-gray-500">
                Duration
              </div>
              <div className="relative w-full h-10 border border-blue-300 rounded-b-md">
                <input
                  type="text"
                  readOnly
                  value={formatDuration(exerciseTime)}
                  className="w-full h-full text-center pr-6 focus:outline-none"
                  placeholder="0:00"
                />
                <div className="absolute right-0 top-0 h-full w-6 flex flex-col border-l border-blue-300 bg-gray-100 rounded-tr-md rounded-br-md">
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={incrementDuration}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    onClick={decrementDuration}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Duration es opcional */}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {exercise ? 'Update Exercise' : 'Save Exercise'}
          </button>
        </div>
      </div>
    </div>
  );
}
