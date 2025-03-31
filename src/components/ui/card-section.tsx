
import React from 'react';
import { cn } from '@/lib/utils';

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardSection({
  title,
  description,
  action,
  className,
  children,
  ...props
}: CardSectionProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export default CardSection;
