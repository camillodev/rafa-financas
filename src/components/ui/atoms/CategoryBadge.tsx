
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  name: string;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const CategoryBadge = ({
  name,
  color,
  isSelected = false,
  onClick,
  className
}: CategoryBadgeProps) => {
  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className={cn(
        "cursor-pointer transition-colors", 
        className
      )}
      style={{ 
        backgroundColor: isSelected ? color : 'transparent',
        borderColor: color,
        color: isSelected ? 'white' : color
      }}
      onClick={onClick}
    >
      {name}
    </Badge>
  );
};

export default CategoryBadge;
