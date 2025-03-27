
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number;
  max: number;
  showPercentage?: boolean;
  className?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  formatValue?: (value: number) => string;
  formatMax?: (max: number) => string;
  showRemaining?: boolean;
}

const ProgressIndicator = ({
  value,
  max,
  showPercentage = true,
  className,
  warningThreshold = 80,
  dangerThreshold = 100,
  formatValue,
  formatMax,
  showRemaining = false
}: ProgressIndicatorProps) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  let progressColor = 'bg-primary';
  if (percentage >= dangerThreshold) {
    progressColor = 'bg-destructive';
  } else if (percentage >= warningThreshold) {
    progressColor = 'bg-orange-500';
  }
  
  return (
    <div className={cn("space-y-1", className)}>
      <Progress 
        value={percentage} 
        className="h-2"
        indicatorClassName={progressColor}
      />
      {showPercentage && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{percentage}%</span>
          {showRemaining && (
            <span>
              {formatValue ? formatValue(Math.max(max - value, 0)) : Math.max(max - value, 0)} 
              {formatMax && max ? ` / ${formatMax(max)}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
