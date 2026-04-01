"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import type { EpicTask, EpicTaskStatus } from "@/lib/types";

interface TaskModalProps {
  task?: EpicTask;
  epicId: string;
  onClose: () => void;
  onSave: (data: {
    name: string;
    completion_percentage: number;
    assigned_to?: string;
    status: EpicTaskStatus;
  }) => Promise<void>;
}

const statusOptions: { value: EpicTaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "QA", label: "QA" },
];

export function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [name, setName] = useState(task?.name || "");
  const [completionPercentage, setCompletionPercentage] = useState(task?.completion_percentage || 0);
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || "");
  const [status, setStatus] = useState<EpicTaskStatus>(task?.status || "backlog");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setCompletionPercentage(task.completion_percentage);
      setAssignedTo(task.assigned_to || "");
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        completion_percentage: completionPercentage,
        assigned_to: assignedTo.trim() || undefined,
        status,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Error al guardar sub-tarea");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {task ? "Editar Sub-tarea" : "Nueva Sub-tarea"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ej: Diseño"
              required
            />
          </div>

          <div>
            <label htmlFor="completion" className="mb-1.5 block text-sm font-medium text-foreground">
              Completitud (%)
            </label>
            <input
              id="completion"
              type="number"
              min="0"
              max="100"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="assigned" className="mb-1.5 block text-sm font-medium text-foreground">
              Asignado a
            </label>
            <input
              id="assigned"
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Nombre del agente"
            />
          </div>

          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-foreground">
              Estado
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EpicTaskStatus)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving ? "Guardando..." : task ? "Actualizar" : "Crear"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
