import type { Epic, Project, EpicDetail } from "@/lib/types";
import { PriorityBadge } from "./priority-badge";
import { ProgressBar } from "./progress-bar";

interface EpicCardProps {
  epic: Epic | EpicDetail;
  project?: Project;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EpicCard({ epic, project, onView, onEdit, onDelete }: EpicCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{epic.title}</h3>
          {project && (
            <p className="text-sm text-gray-500">📁 {project.name}</p>
          )}
        </div>
        <PriorityBadge priority={epic.priority} />
      </div>

      {epic.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {epic.description}
        </p>
      )}

      <ProgressBar progress={epic.progress} className="mb-3" />

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>📝 {epic.task_count || 0} tareas</span>
        {epic.target_date && (
          <span>📅 {new Date(epic.target_date).toLocaleDateString()}</span>
        )}
      </div>

      {/* Evaluation points stats */}
      {"evaluation_points" in epic && epic.evaluation_points && epic.evaluation_points.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              📊 {epic.evaluation_points.length} categorías
            </span>
            {epic.avg_evaluation_progress !== undefined && (
              <span className="text-gray-600">
                Promedio: {epic.avg_evaluation_progress.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {epic.evaluation_points.slice(0, 3).map((ep) => (
              <div key={ep.id} className="flex items-center gap-2 text-xs">
                <span className="text-gray-600 min-w-[80px] truncate">
                  {ep.category}
                </span>
                <ProgressBar
                  progress={ep.progress}
                  size="sm"
                  showLabel={false}
                  className="flex-1"
                />
                <span className="text-gray-500 min-w-[35px] text-right">
                  {ep.progress.toFixed(0)}%
                </span>
              </div>
            ))}
            {epic.evaluation_points.length > 3 && (
              <p className="text-xs text-gray-500 text-center pt-1">
                +{epic.evaluation_points.length - 3} más...
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={onView}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          Ver detalle
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
