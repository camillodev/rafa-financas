
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number;
  max: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const ProgressIndicator = ({
  value,
  max,
  showPercentage = true,
  size = 'md',
  label,
  className
}: ProgressIndicatorProps) => {
  const percentage = Math.min(Math.floor((value / max) * 100), 100);
  
  const getProgressColor = () => {
    if (percentage >= 90) {
      return 'bg-emerald-500';
    } else if (percentage >= 60) {
      return 'bg-amber-500';
    } else {
      return 'bg-sky-500';
    }
  };
  
  const getProgressHeight = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{percentage}%</span>}
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn(getProgressHeight(), "w-full")}
        indicatorClassName={getProgressColor()}
      />
    </div>
  );
};

export default ProgressIndicator;
