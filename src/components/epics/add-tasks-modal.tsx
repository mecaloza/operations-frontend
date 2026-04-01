"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

interface AddTasksModalProps {
  projectId: number;
  existingTaskIds: number[];
  availableTasks: Task[];
  onAdd: (taskIds: number[]) => Promise<void>;
  onClose: () => void;
}

export function AddTasksModal({
  projectId,
  existingTaskIds,
  availableTasks,
  onAdd,
  onClose,
}: AddTasksModalProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tasks: same project, not already in epic
  const filteredTasks = availableTasks
    .filter((t) => Number(t.project_id) === projectId)
    .filter((t) => !existingTaskIds.includes(Number(t.id)))
    .filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleToggle = (taskId: number) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSubmit = async () => {
    if (selectedTaskIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await onAdd(selectedTaskIds);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Agregar Tareas</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 border-b">
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay tareas disponibles
            </p>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.includes(Number(task.id))}
                    onChange={() => handleToggle(Number(task.id))}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {task.assigned_to && (
                        <span className="text-xs text-gray-500">
                          👤 {task.assigned_to}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {task.status}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedTaskIds.length} tarea(s) seleccionada(s)
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedTaskIds.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Agregando..." : "Agregar seleccionadas"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
