
import React, { useState } from 'react';
import { MobileToggle } from './sidebar/MobileToggle';

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <header className="h-14 bg-background border-b sticky top-0 z-40 w-full flex items-center px-4">
      <MobileToggle onClick={toggleMenu} />
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg font-medium">Rafa Finanças</h1>
      </div>
    </header>
  );
}
