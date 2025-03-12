
import React, { ReactNode } from 'react';
import { Sidebar } from './sidebar/Sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen bg-accent/40">
      <Sidebar />
      <main className={cn(
        "flex-1 overflow-x-hidden pb-6", 
        isMobile && "pt-16", // Add padding top on mobile to account for the toggle button
        className
      )}>
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
