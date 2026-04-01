"use client";

import { useState } from "react";
import type { EpicDetail, Project, Task, EvaluationPoint } from "@/lib/types";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { ProgressBar } from "./progress-bar";
import { AddTasksModal } from "./add-tasks-modal";
import { EvaluationPointForm } from "./evaluation-point-form";
import { api } from "@/lib/api";

interface EpicDetailModalProps {
  epic: EpicDetail;
  project?: Project;
  allTasks: Task[];
  onUpdate: (epicId: number, data: Partial<EpicDetail>) => Promise<void>;
  onEdit: () => void;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

type TabType = "info" | "categories" | "tasks" | "progress";

export function EpicDetailModal({
  epic,
  project,
  allTasks,
  onUpdate,
  onEdit,
  onClose,
  onRefresh,
}: EpicDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [showAddTasks, setShowAddTasks] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EvaluationPoint | undefined>();
  const [newProgress, setNewProgress] = useState(epic.progress);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const canMarkAsDone = epic.progress >= 95 && epic.status !== "done";

  const handleUpdateProgress = async () => {
    setIsUpdatingProgress(true);
    try {
      await onUpdate(epic.id, { progress: newProgress });
      await onRefresh();
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleMarkAsDone = async () => {
    await onUpdate(epic.id, { status: "done", progress: 100 });
    await onRefresh();
  };

  const handleRemoveTask = async (taskId: number) => {
    try {
      await api.epics.removeTask(epic.id, taskId);
      await onRefresh();
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };

  const handleAddTasks = async (taskIds: number[]) => {
    try {
      await api.epics.addTasks(epic.id, taskIds);
      await onRefresh();
    } catch (error) {
      console.error("Error adding tasks:", error);
      throw error;
    }
  };

  const handleEditCategory = (ep: EvaluationPoint) => {
    setEditingCategory(ep);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await api.evaluationPoints.delete(id);
      await onRefresh();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleCategorySaved = () => {
    setShowAddCategory(false);
    setEditingCategory(undefined);
  };

  const handleCloseCategoryForm = () => {
    setShowAddCategory(false);
    setEditingCategory(undefined);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{epic.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <PriorityBadge priority={epic.priority} />
                <StatusBadge status={epic.status} />
                {project && (
                  <span className="text-sm text-gray-500">
                    📁 {project.name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "info"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Información
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "categories"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Categorías ({epic.evaluation_points?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "tasks"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Tareas ({epic.tasks?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "progress"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Progreso
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {activeTab === "info" && (
              <div className="space-y-4">
                {epic.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </h3>
                    <p className="text-sm text-gray-600">{epic.description}</p>
                  </div>
                )}

                {epic.goal && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Objetivo
                    </h3>
                    <p className="text-sm text-gray-600">{epic.goal}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Progreso
                  </h3>
                  <ProgressBar progress={epic.progress} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {epic.start_date && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Fecha inicio
                      </h3>
                      <p className="text-sm text-gray-600">{epic.start_date}</p>
                    </div>
                  )}

                  {epic.target_date && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        Fecha objetivo
                      </h3>
                      <p className="text-sm text-gray-600">{epic.target_date}</p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Creada: {new Date(epic.created_at).toLocaleDateString()}
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Puntos de Evaluación
                    </h3>
                    {epic.avg_evaluation_progress !== undefined && (
                      <p className="text-sm text-gray-600">
                        Promedio: {epic.avg_evaluation_progress.toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    + Agregar categoría
                  </button>
                </div>

                {/* Lista de evaluation points */}
                {!epic.evaluation_points || epic.evaluation_points.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No hay categorías definidas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {epic.evaluation_points.map((ep) => (
                      <div
                        key={ep.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {ep.category}
                            </h4>
                            {ep.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {ep.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCategory(ep)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(ep.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        {/* Responsable */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                          <span>👤</span>
                          <span>{ep.assigned_to_name || `User #${ep.assigned_to}`}</span>
                        </div>

                        {/* Barra de progreso */}
                        <ProgressBar progress={ep.progress} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700">
                    Tareas asociadas
                  </h3>
                  <button
                    onClick={() => setShowAddTasks(true)}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    + Agregar tareas
                  </button>
                </div>

                {epic.tasks && epic.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {epic.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {task.title}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              {task.assigned_to && (
                                <span>👤 {task.assigned_to}</span>
                              )}
                              <span className="capitalize">{task.status}</span>
                              {task.task_progress !== undefined && (
                                <span>{task.task_progress}%</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveTask(Number(task.id))}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No hay tareas asociadas
                  </p>
                )}
              </div>
            )}

            {activeTab === "progress" && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    📊 Gráfica histórica de progreso (disponible en Fase 4)
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Progreso actual
                  </h3>
                  <ProgressBar progress={epic.progress} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newProgress}
                onChange={(e) => setNewProgress(Number(e.target.value))}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleUpdateProgress}
                disabled={isUpdatingProgress || newProgress === epic.progress}
                className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
              >
                {isUpdatingProgress ? "Actualizando..." : "Actualizar %"}
              </button>
            </div>

            <div className="flex gap-3">
              {canMarkAsDone && (
                <button
                  onClick={handleMarkAsDone}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Marcar como Done
                </button>
              )}
              <button
                onClick={onEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Editar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddTasks && (
        <AddTasksModal
          projectId={epic.project_id}
          existingTaskIds={epic.tasks?.map((t) => Number(t.id)) || []}
          availableTasks={allTasks}
          onAdd={handleAddTasks}
          onClose={() => setShowAddTasks(false)}
        />
      )}

      {showAddCategory && (
        <EvaluationPointForm
          epicId={epic.id}
          evaluationPoint={editingCategory}
          onClose={handleCloseCategoryForm}
          onSave={handleCategorySaved}
        />
      )}
    </>
  );
}
