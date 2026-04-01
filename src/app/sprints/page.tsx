"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Epic, EpicTask, Project } from "@/lib/types";
import { Plus, ArrowLeft, Edit2, Trash2, TrendingUp } from "lucide-react";
import { EpicModal } from "@/components/epic-modal";
import { TaskModal } from "@/components/task-modal";

export default function SprintsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [epicTasks, setEpicTasks] = useState<EpicTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEpicModal, setShowEpicModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | undefined>();
  const [editingTask, setEditingTask] = useState<EpicTask | undefined>();

  // Load projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const projectsData = await api.projects.list();
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    }
    loadProjects();
  }, []);

  // Load epics when project changes
  useEffect(() => {
    if (!selectedProjectId) return;

    async function loadEpics() {
      setIsLoading(true);
      try {
        const epicsData = await api.epics.list({ project_id: Number(selectedProjectId) });
        
        // Calculate current percentage for each epic from tasks
        const epicsWithProgress = await Promise.all(
          epicsData.map(async (epic: Epic) => {
            try {
              // Legacy: getTasks now returns Task[], not EpicTask[]
              // Use epic.progress from backend instead
              return { ...epic, tasks: [], progress: Math.round(epic.progress || 0) };
            } catch {
              return { ...epic, tasks: [], progress: 0 };
            }
          })
        );

        setEpics(epicsWithProgress);
      } catch (error) {
        console.error("Failed to load epics:", error);
        setEpics([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadEpics();
  }, [selectedProjectId]);

  // Load tasks when epic is selected
  useEffect(() => {
    if (!selectedEpic) return;

    async function loadTasks() {
      if (!selectedEpic) return;
      try {
        // Legacy: getTasks now returns Task[] (Phase 2 migration)
        // This Sprints view uses legacy EpicTask[] - needs refactor
        setEpicTasks([]);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        setEpicTasks([]);
      }
    }

    loadTasks();
  }, [selectedEpic]);

  const totalProgress = epics.length > 0
    ? Math.round(epics.reduce((sum, e) => sum + (e.progress || 0), 0) / epics.length)
    : 0;

  const handleCreateEpic = () => {
    setEditingEpic(undefined);
    setShowEpicModal(true);
  };

  const handleEditEpic = (epic: Epic) => {
    setEditingEpic(epic);
    setShowEpicModal(true);
  };

  const handleDeleteEpic = async (epic: Epic) => {
    if (!confirm(`¿Eliminar épica "${epic.title}"?`)) return;

    try {
      await api.epics.delete(epic.id);
      setEpics((prev) => prev.filter((e) => e.id !== epic.id));
      if (selectedEpic?.id === epic.id) {
        setSelectedEpic(null);
      }
    } catch (error) {
      console.error("Failed to delete epic:", error);
      alert("Error al eliminar épica");
    }
  };

  const handleSaveEpic = async (data: {
    project_id: string;
    title: string;
    description?: string;
    target_percentage: number;
  }) => {
    // Convert project_id to number for new API, map target_percentage to progress
    const epicData = { ...data, project_id: Number(data.project_id), progress: data.target_percentage };
    if (editingEpic) {
      // Update
      await api.epics.update(Number(editingEpic.id), epicData);
      setEpics((prev) =>
        prev.map((e) =>
          e.id === editingEpic.id ? { ...e, ...epicData } : e
        )
      );
    } else {
      // Create
      const newEpic = await api.epics.create(epicData);
      setEpics((prev) => [...prev, { ...newEpic, tasks: [] }]);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: EpicTask) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (task: EpicTask) => {
    if (!confirm(`¿Eliminar sub-tarea "${task.name}"?`)) return;

    try {
      // Legacy: deleteTask removed in Phase 2
      // Use new /epics view for task management
      alert("Usar la vista /epics para gestionar tareas (Phase 2)");
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Error al eliminar sub-tarea");
    }
  };

  const handleSaveTask = async () => {
    if (!selectedEpic) return;

    // Legacy: createTask/updateTask removed in Phase 2
    // Use new /epics view for task management
    alert("Usar la vista /epics para gestionar tareas (Phase 2)");
  };

  const getProgressColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.9) return "text-green-600";
    if (ratio >= 0.7) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressBarColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.9) return "bg-green-500";
    if (ratio >= 0.7) return "bg-amber-500";
    return "bg-red-500";
  };

  if (selectedEpic) {
    // Detail View
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedEpic(null)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{selectedEpic.title}</h1>
              {selectedEpic.description && (
                <p className="text-sm text-muted-foreground">{selectedEpic.description}</p>
              )}
            </div>
          </div>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4" />
            Agregar Sub-tarea
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Progreso de la Épica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {selectedEpic.progress || 0}% / {selectedEpic.progress}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                className={`h-3 rounded-full transition-all ${getProgressBarColor(
                  selectedEpic.progress || 0,
                  selectedEpic.progress
                )}`}
                style={{ width: `${Math.min((selectedEpic.progress || 0), 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Sub-tareas</CardTitle>
          </CardHeader>
          <CardContent>
            {epicTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay sub-tareas todavía</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Nombre</th>
                      <th className="pb-2 font-medium text-muted-foreground">Completitud</th>
                      <th className="pb-2 font-medium text-muted-foreground">Asignado</th>
                      <th className="pb-2 font-medium text-muted-foreground">Estado</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {epicTasks.map((task) => (
                      <tr key={task.id} className="border-b border-border last:border-0">
                        <td className="py-3">{task.name}</td>
                        <td className="py-3">{task.completion_percentage}%</td>
                        <td className="py-3">{task.assigned_to || "Sin asignar"}</td>
                        <td className="py-3">
                          <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {showTaskModal && (
          <TaskModal
            task={editingTask}
            epicId={String(selectedEpic.id)}
            onClose={() => setShowTaskModal(false)}
            onSave={handleSaveTask}
          />
        )}
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sprints - Dashboard de Épicas</h1>
          <p className="text-sm text-muted-foreground">Seguimiento visual de épicas y sub-tareas</p>
        </div>
        <Button onClick={handleCreateEpic}>
          <Plus className="h-4 w-4" />
          Nueva Épica
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="project-select" className="text-sm font-medium text-foreground">
          Proyecto:
        </label>
        <select
          id="project-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Avance Total del Proyecto</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-foreground">{totalProgress}%</span>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando épicas...</p>
      ) : epics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No hay épicas para este proyecto todavía</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {epics.map((epic) => {
            const currentPct = epic.progress || 0;
            const targetPct = epic.progress;
            return (
              <Card
                key={epic.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEpic(epic)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{epic.title}</h3>
                      {epic.description && (
                        <p className="text-sm text-muted-foreground">{epic.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEpic(epic);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEpic(epic);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Avance: {currentPct}% | Meta: {targetPct}%</span>
                      <span className={`font-semibold ${getProgressColor(currentPct, targetPct)}`}>
                        {currentPct >= targetPct * 0.9 ? "✓" : currentPct >= targetPct * 0.7 ? "~" : "!"}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressBarColor(currentPct, targetPct)}`}
                        style={{ width: `${Math.min(currentPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Legacy: tasks removed in Phase 2 - use /epics view */}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showEpicModal && (
        <EpicModal
          epic={editingEpic}
          projectId={selectedProjectId}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          onClose={() => setShowEpicModal(false)}
          onSave={handleSaveEpic}
        />
      )}
    </div>
  );
}
