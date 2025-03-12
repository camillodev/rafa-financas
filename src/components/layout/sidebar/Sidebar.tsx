
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarLink } from './SidebarLink';
import { sidebarLinks, settingsLink } from './sidebarConfig';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [location, isMobile]);

  useEffect(() => {
    // Handle body scroll when mobile menu is open
    if (isMobile) {
      if (mobileOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, isMobile]);

  const handleLinkClick = () => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  };
  
  return (
    <>
      <div 
        className={cn(
          "h-screen flex flex-col border-r transition-all duration-300 ease-in-out z-40",
          collapsed ? "w-16" : "w-64",
          isMobile && !mobileOpen && "w-0 -translate-x-full opacity-0",
          isMobile && mobileOpen && "fixed left-0 top-0 w-64 shadow-xl",
          "bg-sidebar-background dark:bg-sidebar-background text-sidebar-foreground border-sidebar-border"
        )}
      >
        <div className="flex items-center justify-between p-4">
          {(!collapsed || (isMobile && mobileOpen)) && (
            <div className="flex items-center gap-2">
              <Home className="text-sidebar-primary h-6 w-6" />
              <span className="font-medium text-lg text-sidebar-foreground">Rafa Finanças</span>
            </div>
          )}
          {collapsed && !isMobile && <Home className="text-sidebar-primary h-6 w-6 mx-auto" />}
          
          {!isMobile && (
            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="p-1 rounded-full hover:bg-sidebar-accent transition-colors absolute -right-3 top-6 bg-background border"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        
        <div className="mt-6 flex flex-col gap-1 px-3 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <SidebarLink
              key={link.href}
              icon={<link.icon size={20} />}
              label={link.label}
              href={link.href}
              active={location.pathname === link.href}
              isCollapsed={collapsed && !mobileOpen}
              onClick={handleLinkClick}
            />
          ))}
        </div>
        
        <div className="mt-auto px-3 mb-6">
          <SidebarLink
            icon={<settingsLink.icon size={20} />}
            label={settingsLink.label}
            href={settingsLink.href}
            active={location.pathname === settingsLink.href}
            isCollapsed={collapsed && !mobileOpen}
            onClick={handleLinkClick}
          />
        </div>
      </div>
      
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
