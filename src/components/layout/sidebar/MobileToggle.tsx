
import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileToggleProps {
  onClick: () => void;
  isOpen?: boolean;
}

export const MobileToggle = ({ onClick, isOpen }: MobileToggleProps) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-md hover:bg-accent transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? (
        <X size={20} className="text-foreground" />
      ) : (
        <Menu size={20} className="text-foreground" />
      )}
    </button>
  );
};
