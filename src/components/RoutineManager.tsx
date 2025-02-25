// components/RoutineManager.tsx
'use client';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useRoutineStore } from '@/store/routineStore';
import { useUserStore } from '@/store/userStore';
import { Routine } from '@/types/routine';
import ExerciseModal from '@/components/ExerciseModal';

interface RoutineManagerProps {
  onClose: () => void;
}

export default function RoutineManager({ onClose }: RoutineManagerProps) {
  const { selectedRoutine, updateRoutine, createRoutine } = useRoutineStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const currentUserId = currentUser?.user_id || '';

  const [routineName, setRoutineName] = useState(selectedRoutine?.name || '');
  const [routineDescription, setRoutineDescription] = useState(
    selectedRoutine?.description || ''
  );
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const handleSave = async () => {
    try {
      if (selectedRoutine) {
        // Actualizar rutina existente
        await updateRoutine(selectedRoutine.routine_id, {
          name: routineName,
          description: routineDescription,
        });
      } else {
        // Crear rutina nueva: se asigna routine_id como cadena vacía (backend lo genera)
        const newRoutine: Routine = {
          routine_id: '',
          user_id: currentUserId,
          name: routineName,
          description: routineDescription,
          exercises: [],
          weight: 0,
          sets: 0,
          reps: 0,
          created_by: currentUserId,
          updated_by: currentUserId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await createRoutine(newRoutine);
      }
      onClose();
    } catch (error) {
      console.error('Error saving routine:', error);
      // Aquí podrías mostrar una notificación o alerta
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-gray-800"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Routine Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            &times;
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
        {/* Sección para ejercicios */}
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
        {showExerciseModal && (
          <ExerciseModal
            onClose={() => setShowExerciseModal(false)}
            routineId={selectedRoutine?.routine_id || ''}
            onAddExercise={(exercise) => {
              // Añade el ejercicio a la rutina usando la función del store
              useRoutineStore
                .getState()
                .addExercise(exercise, selectedRoutine?.routine_id || '');
            }}
          />
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
