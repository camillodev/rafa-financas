
import React from 'react';
import { Menu } from 'lucide-react';

interface MobileToggleProps {
  onClick: () => void;
}

export const MobileToggle = ({ onClick }: MobileToggleProps) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-md hover:bg-accent"
      aria-label="Toggle menu"
    >
      <Menu size={20} className="text-foreground" />
    </button>
  );
};
