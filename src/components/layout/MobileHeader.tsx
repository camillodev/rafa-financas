
import React from 'react';
import { MobileToggle } from './sidebar/MobileToggle';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHeaderProps {
  menuOpen: boolean;
  toggleMenu: () => void;
}

export function MobileHeader({ menuOpen, toggleMenu }: MobileHeaderProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <header className={cn(
      "h-14 bg-background border-b sticky top-0 z-50 w-full flex items-center px-4",
      "transition-all duration-300"
    )}>
      <MobileToggle onClick={toggleMenu} />
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg font-medium">Rafa Finanças</h1>
      </div>
    </header>
  );
}
