interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getProgressColor(progress: number): string {
  if (progress < 25) return "bg-red-500";
  if (progress < 50) return "bg-orange-500";
  if (progress < 75) return "bg-yellow-500";
  return "bg-green-500";
}

export function ProgressBar({ progress, className = "", showLabel = true, size = 'md' }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const colorClass = getProgressColor(clampedProgress);
  
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`flex-1 bg-gray-200 rounded-full ${heightClass} overflow-hidden`}>
          <div
            className={`${heightClass} ${colorClass} transition-all duration-300`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-gray-700 min-w-[3rem] text-right">
            {clampedProgress.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
