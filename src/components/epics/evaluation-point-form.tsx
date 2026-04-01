"use client";

import { useState, useEffect } from "react";
import type { EvaluationPoint } from "@/lib/types";
import { api } from "@/lib/api";

interface EvaluationPointFormProps {
  epicId: number;
  evaluationPoint?: EvaluationPoint;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORY_SUGGESTIONS = [
  "Backend",
  "Admin",
  "Landing",
  "App",
  "Diseño Landing",
  "Diseño App",
  "QA",
  "Frontend",
  "API",
  "Database",
];

export function EvaluationPointForm({
  epicId,
  evaluationPoint,
  onClose,
  onSave,
}: EvaluationPointFormProps) {
  const [category, setCategory] = useState(evaluationPoint?.category || "");
  const [description, setDescription] = useState(
    evaluationPoint?.description || ""
  );
  const [assignedTo, setAssignedTo] = useState(
    evaluationPoint?.assigned_to || 0
  );
  const [progress, setProgress] = useState(evaluationPoint?.progress || 0);
  const [users, setUsers] = useState<Array<{ id: string | number; full_name?: string; name?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cargar usuarios
    api.users
      .list()
      .then(setUsers)
      .catch((err) => {
        console.error("Error loading users:", err);
        setError("No se pudieron cargar los usuarios");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = {
        category,
        description: description || undefined,
        assigned_to: assignedTo,
        progress,
      };

      if (evaluationPoint) {
        await api.evaluationPoints.update(evaluationPoint.id, data);
      } else {
        await api.evaluationPoints.create(epicId, data);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving evaluation point:", err);
      setError("Error al guardar la categoría");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {evaluationPoint ? "Editar Categoría" : "Agregar Categoría"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Backend, Admin, Landing..."
              list="category-suggestions"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable <span className="text-red-500">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Progreso inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progreso inicial: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qué involucra esta categoría..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading
                ? "Guardando..."
                : evaluationPoint
                ? "Actualizar"
                : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
