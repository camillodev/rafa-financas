
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  Target, 
  CreditCard, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  isCollapsed?: boolean;
}

const SidebarLink = ({ icon, label, href, active, isCollapsed }: SidebarLinkProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
        active 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
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

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  return (
    <div 
      className={cn(
        "h-screen flex flex-col border-r transition-all duration-300 ease-in-out bg-white relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Home className="text-primary h-6 w-6" />
            <span className="font-medium text-lg">Rafa Finanças</span>
          </div>
        )}
        {collapsed && <Home className="text-primary h-6 w-6 mx-auto" />}
        
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="p-1 rounded-full hover:bg-accent transition-colors absolute -right-3 top-6 bg-background border"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
      
      <div className="mt-6 flex flex-col gap-1 px-3">
        <SidebarLink 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          href="/" 
          active={location.pathname === '/'} 
          isCollapsed={collapsed} 
        />
        <SidebarLink 
          icon={<ArrowRightLeft size={20} />} 
          label="Transactions" 
          href="/transactions" 
          active={location.pathname === '/transactions'} 
          isCollapsed={collapsed} 
        />
        <SidebarLink 
          icon={<BarChart3 size={20} />} 
          label="Budgets" 
          href="/budgets" 
          active={location.pathname === '/budgets'} 
          isCollapsed={collapsed} 
        />
        <SidebarLink 
          icon={<PieChart size={20} />} 
          label="Analytics" 
          href="/analytics" 
          active={location.pathname === '/analytics'} 
          isCollapsed={collapsed} 
        />
        <SidebarLink 
          icon={<Target size={20} />} 
          label="Goals" 
          href="/goals" 
          active={location.pathname === '/goals'} 
          isCollapsed={collapsed} 
        />
        <SidebarLink 
          icon={<CreditCard size={20} />} 
          label="Accounts" 
          href="/accounts" 
          active={location.pathname === '/accounts'} 
          isCollapsed={collapsed} 
        />
      </div>
      
      <div className="mt-auto px-3 mb-6">
        <SidebarLink 
          icon={<Settings size={20} />} 
          label="Settings" 
          href="/settings" 
          active={location.pathname === '/settings'} 
          isCollapsed={collapsed} 
        />
      </div>
    </div>
  );
}

export default Sidebar;
