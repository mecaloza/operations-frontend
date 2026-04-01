import type { EpicStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: EpicStatus;
  className?: string;
}

const statusColors: Record<EpicStatus, string> = {
  not_started: "bg-gray-100 text-gray-700 border-gray-300",
  in_progress: "bg-blue-100 text-blue-700 border-blue-300",
  done: "bg-green-100 text-green-700 border-green-300",
};

const statusLabels: Record<EpicStatus, string> = {
  not_started: "No iniciada",
  in_progress: "En progreso",
  done: "Completada",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColors[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
