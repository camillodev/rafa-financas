
import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const MobileHeader = ({ onMenuClick, title }: MobileHeaderProps) => {
  const location = useLocation();
  
  // Determine page title based on current route
  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/transactions') return 'Transações';
    if (path === '/bills') return 'Contas a Pagar';
    if (path === '/budgets') return 'Orçamentos';
    if (path === '/reports') return 'Relatórios';
    if (path === '/categories') return 'Categorias';
    if (path === '/institutions') return 'Instituições';
    if (path === '/cards') return 'Cartões';
    if (path === '/goals') return 'Metas';
    if (path === '/settings') return 'Configurações';
    
    return 'Rafa Finanças';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 flex items-center px-4">
      <button
        onClick={onMenuClick}
        className="mr-4 p-2 rounded-md hover:bg-accent flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <Menu size={24} className="text-foreground" />
      </button>
      <h1 className="text-lg font-medium">{getPageTitle()}</h1>
    </header>
  );
};
