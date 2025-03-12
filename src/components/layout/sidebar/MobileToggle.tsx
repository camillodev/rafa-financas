
import React from 'react';
import { Menu } from 'lucide-react';

interface MobileToggleProps {
  onClick: () => void;
}

export const MobileToggle = ({ onClick }: MobileToggleProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed z-50 top-4 left-4 p-2 bg-background rounded-md border shadow-sm"
      aria-label="Toggle menu"
    >
      <Menu size={20} className="text-foreground" />
    </button>
  );
};
