
import React, { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar/Sidebar';
import { MobileHeader } from './MobileHeader';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="flex min-h-screen bg-accent/40">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <MobileHeader menuOpen={menuOpen} toggleMenu={toggleMenu} />
        <main className={cn(
          "flex-1 overflow-x-hidden pb-6",
          className
        )}>
          <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
