
import React from 'react';
import { cn } from '@/lib/utils';

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default CardHeader;
