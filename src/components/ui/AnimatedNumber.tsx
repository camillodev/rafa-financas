
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  className,
  formatter,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = startValue + progress * (endValue - startValue);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
    
    return () => {
      startTimestamp = null;
    };
  }, [value, duration, displayValue]);
  
  const formatValue = (val: number) => {
    if (formatter) return formatter(val);
    
    const fixedValue = val.toFixed(decimalPlaces);
    
    if (val >= 1000000) {
      return (val / 1000000).toFixed(decimalPlaces) + 'M';
    } else if (val >= 1000) {
      return (val / 1000).toFixed(decimalPlaces) + 'K';
    }
    
    return fixedValue;
  };
  
  return (
    <span className={cn("tabular-nums transition-colors", className)}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
}

export default AnimatedNumber;
