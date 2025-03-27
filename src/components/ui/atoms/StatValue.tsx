
import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

interface StatValueProps {
  value: number;
  formatter: (value: number) => string;
  className?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatValue = ({ value, formatter, className, icon, trend }: StatValueProps) => {
  const trendColor = trend === 'up' 
    ? 'text-green-500' 
    : trend === 'down' 
      ? 'text-red-500' 
      : '';
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {icon && <span className={trendColor}>{icon}</span>}
      <AnimatedNumber
        value={value}
        formatter={formatter}
        className={cn("font-semibold", trendColor)}
      />
    </div>
  );
};

export default StatValue;
