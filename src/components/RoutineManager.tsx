// components/RoutineManager.tsx
'use client';

import React, { useState } from 'react';
import { useRoutineStore } from '@/store/routineStore';
import { Routine } from '@/types/routine';
import ExerciseModal from '@/components/ExerciseModal';

interface RoutineManagerProps {
  onClose: () => void;
}

export default function RoutineManager({ onClose }: RoutineManagerProps) {
  // Obtenemos la rutina seleccionada (si estamos editando una rutina existente)
  const { selectedRoutine, updateRoutine } = useRoutineStore();
  const [routineName, setRoutineName] = useState(selectedRoutine?.name || '');
  const [routineDescription, setRoutineDescription] = useState(
    selectedRoutine?.description || ''
  );
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const handleSave = () => {
    if (selectedRoutine) {
      const updatedRoutine: Routine = {
        ...selectedRoutine,
        name: routineName,
        description: routineDescription,
      };
      updateRoutine(updatedRoutine);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Routine Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            X
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Routine Name</label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Routine Description
          </label>
          <textarea
            value={routineDescription}
            onChange={(e) => setRoutineDescription(e.target.value)}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>
        {/* Lista de ejercicios */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Exercises</h3>
          {selectedRoutine?.exercises &&
          selectedRoutine.exercises.length > 0 ? (
            <ul className="space-y-2">
              {selectedRoutine.exercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{exercise.name}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No exercises available.</div>
          )}
          <button
            onClick={() => setShowExerciseModal(true)}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Add Exercise
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
      {showExerciseModal && (
        <ExerciseModal
          onClose={() => setShowExerciseModal(false)}
          routineId={selectedRoutine?.routine_id || ''}
        />
      )}
    </div>
  );
}
