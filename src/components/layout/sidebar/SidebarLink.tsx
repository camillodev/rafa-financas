
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  submenu?: Array<{
    icon: React.ReactNode;
    label: string;
    href: string;
  }>;
}

export const SidebarLink = ({ 
  icon, 
  label, 
  href, 
  active, 
  isCollapsed, 
  onClick,
  submenu 
}: SidebarLinkProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasSubmenu = submenu && submenu.length > 0;
  
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const isActiveSubmenu = active || (submenu?.some(item => window.location.pathname === item.href) || false);
  
  return (
    <div className="flex flex-col">
      <Link
        to={hasSubmenu ? '#' : href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
          (isActiveSubmenu || active)
            ? "bg-sidebar-accent text-sidebar-primary font-medium" 
            : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
        )}
        onClick={hasSubmenu ? toggleSubmenu : onClick}
      >
        <div className="text-current">{icon}</div>
        {!isCollapsed && (
          <>
            <span className="text-sm flex-1">{label}</span>
            {hasSubmenu && (
              <div className="text-current">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
          </>
        )}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover rounded-md shadow-md text-sm text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            {label}
          </div>
        )}
      </Link>
      
      {hasSubmenu && !isCollapsed && isOpen && (
        <div className="pl-10 ml-1 mt-1 flex flex-col gap-1 border-l border-sidebar-border">
          {submenu.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors",
                window.location.pathname === item.href
                  ? "bg-sidebar-accent/60 text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
              )}
              onClick={onClick}
            >
              <div className="text-current">{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
