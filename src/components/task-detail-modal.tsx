"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, AlertCircle, Folder } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import type { Task, Epic, EpicTask, Project } from "@/lib/types";
import { api } from "@/lib/api";

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  onEdit?: (taskId: string) => void;
}

const statusStyles: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-700 border-gray-300",
  in_progress: "bg-amber-100 text-amber-700 border-amber-300",
  done: "bg-emerald-100 text-emerald-700 border-emerald-300",
  blocked: "bg-red-100 text-red-700 border-red-300",
  QA: "bg-blue-100 text-blue-700 border-blue-300",
};

const priorityStyles: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

export function TaskDetailModal({ taskId, onClose, onEdit }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [epic, setEpic] = useState<Epic | null>(null);
  const [epicTasks, setEpicTasks] = useState<EpicTask[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTaskDetails() {
      try {
        setIsLoading(true);
        setError(null);

        // Load task
        const taskData = await api.tasks.get(taskId);
        setTask(taskData);

        // Load project
        if (taskData.project_id) {
          const projectData = await api.projects.get(taskData.project_id);
          setProject(projectData);
        }

        // Load epic and subtasks if task belongs to an epic
        if (taskData.epic_id) {
          const epicData = await api.epics.get(Number(taskData.epic_id));
          setEpic(epicData);
          // Legacy: getTasks now returns Task[] (Phase 2)
          setEpicTasks([]);
        }
      } catch (err) {
        console.error("Failed to load task details:", err);
        setError(err instanceof Error ? err.message : "Error al cargar los detalles de la tarea");
      } finally {
        setIsLoading(false);
      }
    }

    loadTaskDetails();
  }, [taskId]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(taskId);
    }
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl p-8">
          <p className="text-center text-muted-foreground">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl p-8">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Error</p>
          </div>
          <p className="text-muted-foreground mb-6">{error || "No se pudo cargar la tarea"}</p>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    );
  }

  const totalCompletion = epicTasks.length > 0
    ? Math.round(epicTasks.reduce((sum, t) => sum + t.completion_percentage, 0) / epicTasks.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {task.title}
            </h2>
            <Badge variant="secondary" className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              #{task.id}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Info Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Descripción</h3>
              {task.description ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin descripción</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <AlertCircle className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge variant="outline" className={`text-xs mt-0.5 ${statusStyles[task.status] || ""}`}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {task.priority && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prioridad</p>
                    <Badge variant="outline" className={`text-xs mt-0.5 ${priorityStyles[task.priority] || ""}`}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              )}

              {task.assigned_to && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Asignado a</p>
                    <p className="text-sm font-medium text-foreground">{task.assigned_to}</p>
                  </div>
                </div>
              )}

              {project && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                    <Folder className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Proyecto</p>
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Creado</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Actualizado</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(task.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Subtareas</h3>
            
            {epic ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Épica: {epic.title}</p>
                    {epic.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{epic.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Progreso total</p>
                    <p className="text-lg font-semibold text-foreground">{totalCompletion}%</p>
                  </div>
                </div>

                {epicTasks.length > 0 ? (
                  <div className="space-y-2">
                    {epicTasks.map((subtask) => (
                      <Card key={subtask.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{subtask.name}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className={`text-xs ${statusStyles[subtask.status] || ""}`}>
                                  {subtask.status}
                                </Badge>
                                {subtask.assigned_to && (
                                  <span className="text-xs text-muted-foreground">
                                    → {subtask.assigned_to}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-foreground">
                                {subtask.completion_percentage}%
                              </p>
                              <div className="mt-1 w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all"
                                  style={{ width: `${subtask.completion_percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Esta épica no tiene subtareas aún
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  Esta tarea no tiene subtareas
                </p>
                {/* Optional: "Convertir en épica" button - nice to have */}
                {/* <Button variant="outline" size="sm">
                  Convertir en épica
                </Button> */}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border px-6 py-4">
          {onEdit && (
            <Button onClick={handleEdit}>
              Editar
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
