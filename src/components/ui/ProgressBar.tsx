import React from 'react';

export interface ProgressBarProps {
  value: number; // percentage, e.g. 75, 90, 115
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  warningThreshold?: number; // default 80
  dangerThreshold?: number; // default 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 'md',
  showLabel = false,
  className = '',
  warningThreshold = 80,
  dangerThreshold = 100,
}) => {
  const clampedDisplayWidth = Math.min(Math.max(value, 0), 100);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  let fillColor = 'bg-emerald-500 dark:bg-emerald-400';
  if (value >= dangerThreshold) {
    fillColor = 'bg-rose-500 dark:bg-rose-400';
  } else if (value >= warningThreshold) {
    fillColor = 'bg-amber-500 dark:bg-amber-400';
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[height]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillColor}`}
          style={{ width: `${clampedDisplayWidth}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mt-1 text-slate-500 dark:text-slate-400 tabular-nums">
          <span>{value.toFixed(0)}% used</span>
          <span>{value > 100 ? `${(value - 100).toFixed(0)}% over budget` : ''}</span>
        </div>
      )}
    </div>
  );
};
