
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export const SidebarLink = ({ 
  icon, 
  label, 
  href, 
  active, 
  isCollapsed, 
  onClick 
}: SidebarLinkProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
        active 
          ? "bg-sidebar-accent text-sidebar-primary font-medium" 
          : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
      )}
      onClick={onClick}
    >
      <div className="text-current">{icon}</div>
      {!isCollapsed && <span className="text-sm">{label}</span>}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover rounded-md shadow-md text-sm text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          {label}
        </div>
      )}
    </Link>
  );
};
