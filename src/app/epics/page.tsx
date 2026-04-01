"use client";

import { useState, useEffect } from "react";
import type { Epic, EpicDetail, Project, Task, EpicStatus } from "@/lib/types";
import { api } from "@/lib/api";
import { EpicCard } from "@/components/epics/epic-card";
import { EpicDetailModal } from "@/components/epics/epic-detail-modal";
import { EpicForm } from "@/components/epics/epic-form";

type SortBy = "progress" | "priority" | "created_at";

export default function EpicsPage() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterProjectId, setFilterProjectId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<EpicStatus | "all">("all");
  const [filterProgressMin, setFilterProgressMin] = useState(0);
  const [filterProgressMax, setFilterProgressMax] = useState(100);

  // Sort
  const [sortBy, setSortBy] = useState<SortBy>("progress");

  // Modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [selectedEpic, setSelectedEpic] = useState<EpicDetail | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [epicsData, projectsData, tasksData] = await Promise.all([
        api.epics.list(),
        api.projects.list(),
        api.tasks.list(),
      ]);
      setEpics(epicsData);
      setProjects(projectsData);
      setAllTasks(tasksData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEpics = epics
    .filter((e) => {
      if (filterProjectId && e.project_id !== filterProjectId) return false;
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      if (e.progress < filterProgressMin || e.progress > filterProgressMax) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "progress") return a.progress - b.progress; // Lowest first
      if (sortBy === "priority") {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "created_at") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

  const handleCreateEpic = async (data: Partial<Epic>) => {
    try {
      await api.epics.create(data);
      await loadData();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating epic:", error);
    }
  };

  const handleUpdateEpic = async (id: number, data: Partial<Epic>) => {
    try {
      await api.epics.update(id, data);
      await loadData();
      setEditingEpic(null);
      if (selectedEpic) {
        const updated = await api.epics.get(id);
        setSelectedEpic(updated);
      }
    } catch (error) {
      console.error("Error updating epic:", error);
    }
  };

  const handleDeleteEpic = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta épica? Las tareas quedarán sin épica.")) {
      return;
    }
    try {
      await api.epics.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting epic:", error);
    }
  };

  const handleViewEpic = async (epic: Epic) => {
    try {
      const detail = await api.epics.get(epic.id);
      setSelectedEpic(detail);
    } catch (error) {
      console.error("Error loading epic detail:", error);
    }
  };

  const refreshSelectedEpic = async () => {
    if (selectedEpic) {
      const updated = await api.epics.get(selectedEpic.id);
      setSelectedEpic(updated);
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Épicas</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Nueva Épica
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Proyecto</label>
              <select
                value={filterProjectId || ""}
                onChange={(e) => setFilterProjectId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as EpicStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="not_started">No iniciada</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">% Min</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filterProgressMin}
                onChange={(e) => setFilterProgressMin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">% Max</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filterProgressMax}
                onChange={(e) => setFilterProgressMax(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="text-xs text-gray-600">Ordenar por:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("progress")}
                className={`px-3 py-1 text-xs rounded-md ${
                  sortBy === "progress"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                % (más bajo primero)
              </button>
              <button
                onClick={() => setSortBy("priority")}
                className={`px-3 py-1 text-xs rounded-md ${
                  sortBy === "priority"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Prioridad
              </button>
              <button
                onClick={() => setSortBy("created_at")}
                className={`px-3 py-1 text-xs rounded-md ${
                  sortBy === "created_at"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Fecha
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredEpics.length}</div>
              <div className="text-xs text-gray-600">Épicas totales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredEpics.filter((e) => e.status === "done").length}
              </div>
              <div className="text-xs text-gray-600">Completadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredEpics.filter((e) => e.status === "in_progress").length}
              </div>
              <div className="text-xs text-gray-600">En progreso</div>
            </div>
          </div>
        </div>

        {/* Epics Grid */}
        {filteredEpics.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No hay épicas que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEpics.map((epic) => {
              const project = projects.find((p) => Number(p.id) === epic.project_id);
              return (
                <EpicCard
                  key={epic.id}
                  epic={epic}
                  project={project}
                  onView={() => handleViewEpic(epic)}
                  onEdit={() => setEditingEpic(epic)}
                  onDelete={() => handleDeleteEpic(epic.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Épica</h2>
            <EpicForm
              projects={projects}
              onSubmit={handleCreateEpic}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEpic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Épica</h2>
            <EpicForm
              epic={editingEpic}
              projects={projects}
              onSubmit={async (data) => {
                await handleUpdateEpic(editingEpic.id, data);
              }}
              onCancel={() => setEditingEpic(null)}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEpic && (
        <EpicDetailModal
          epic={selectedEpic}
          project={projects.find((p) => Number(p.id) === selectedEpic.project_id)}
          allTasks={allTasks}
          onUpdate={handleUpdateEpic}
          onEdit={() => {
            setEditingEpic(selectedEpic);
            setSelectedEpic(null);
          }}
          onClose={() => setSelectedEpic(null)}
          onRefresh={refreshSelectedEpic}
        />
      )}
    </div>
  );
}
