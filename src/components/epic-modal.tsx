"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import type { Epic } from "@/lib/types";

interface EpicModalProps {
  epic?: Epic;
  projectId: string;
  projects: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: {
    project_id: string;
    title: string;
    description?: string;
    target_percentage: number;
  }) => Promise<void>;
}

export function EpicModal({ epic, projectId, projects, onClose, onSave }: EpicModalProps) {
  const [title, setTitle] = useState(epic?.title || "");
  const [description, setDescription] = useState(epic?.description || "");
  const [targetPercentage, setTargetPercentage] = useState(epic?.progress || 100);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (epic) {
      setTitle(epic.title);
      setDescription(epic.description || "");
      setTargetPercentage(epic.progress);
      setSelectedProjectId(String(epic.project_id));
    }
  }, [epic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        project_id: selectedProjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        target_percentage: targetPercentage,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save epic:", error);
      alert("Error al guardar épica");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {epic ? "Editar Épica" : "Nueva Épica"}
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
            <label htmlFor="project" className="mb-1.5 block text-sm font-medium text-foreground">
              Proyecto
            </label>
            <select
              id="project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={!!epic}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ej: Ventas de membresías y servicios"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Descripción opcional de la épica"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="target" className="mb-1.5 block text-sm font-medium text-foreground">
              Meta de Completitud (%)
            </label>
            <input
              id="target"
              type="number"
              min="0"
              max="100"
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving ? "Guardando..." : epic ? "Actualizar" : "Crear"}
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
