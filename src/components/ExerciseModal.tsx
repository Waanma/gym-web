// components/ExerciseModal.tsx
'use client';

import React, { useState } from 'react';
import { useRoutineStore } from '@/store/routineStore';
import { Exercise } from '@/types/routine';

interface ExerciseModalProps {
  onClose: () => void;
  routineId: string;
}

export default function ExerciseModal({
  onClose,
  routineId,
}: ExerciseModalProps) {
  const { addExercise } = useRoutineStore();
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseWeight, setExerciseWeight] = useState<number>(0);
  const [exerciseReps, setExerciseReps] = useState<number>(0);
  const [exerciseSets, setExerciseSets] = useState<number>(0);

  const handleSaveExercise = () => {
    if (!exerciseName.trim()) return;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      weight: exerciseWeight,
      reps: exerciseReps,
      sets: exerciseSets,
      // Agrega otras propiedades si es necesario
    };
    addExercise(newExercise, routineId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Exercise</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            X
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Exercise Name</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Weight</label>
          <input
            type="number"
            value={exerciseWeight}
            onChange={(e) => setExerciseWeight(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Reps</label>
          <input
            type="number"
            value={exerciseReps}
            onChange={(e) => setExerciseReps(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Sets</label>
          <input
            type="number"
            value={exerciseSets}
            onChange={(e) => setExerciseSets(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSaveExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
