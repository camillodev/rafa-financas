
import React from 'react';
import { cn } from '@/lib/utils';

interface StatValueProps {
  title: string;
  value: number;
  formatValue: (value: number) => string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatValue = ({ 
  title, 
  value, 
  formatValue, 
  icon, 
  trend = 'neutral',
  className 
}: StatValueProps) => {
  // Determine text color based on trend
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-500';
      case 'down':
        return 'text-rose-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>
      <div className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span className={cn("text-lg font-semibold", getTrendColor())}>
          {formatValue(value)}
        </span>
      </div>
    </div>
  );
};

export default StatValue;
