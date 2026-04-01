import type { EpicPriority } from "@/lib/types";

interface PriorityBadgeProps {
  priority: EpicPriority;
  className?: string;
}

const priorityColors: Record<EpicPriority, string> = {
  low: "bg-gray-100 text-gray-700 border-gray-300",
  medium: "bg-blue-100 text-blue-700 border-blue-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
};

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[priority]} ${className}`}
    >
      {priority.toUpperCase()}
    </span>
  );
}
