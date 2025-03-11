
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-accent/40">
      <Sidebar />
      <main className={cn("flex-1 overflow-auto pb-6", className)}>
        <div className="container mx-auto py-6 px-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
