import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarLink } from './SidebarLink';
import { MobileHeader } from '../header/MobileHeader';
import { sidebarLinks, settingsLink } from './sidebarConfig';
import { UserButton } from '@clerk/clerk-react';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { isFeatureEnabled } = useFeatureFlags();
  
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

  const handleLinkClick = () => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  };
  
  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Filter links based on feature flags
  const filteredLinks = sidebarLinks.filter(link => {
    // If there's no feature flag specified, always show the link
    if (!link.featureFlag) return true;

    // Otherwise, check if the feature is enabled
    return isFeatureEnabled(link.featureFlag);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile header */}
      {isMobile && (
        <MobileHeader
          onMenuClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border h-screen flex flex-col z-40 fixed transition-all duration-300 ease-in-out",
          isMobile
            ? cn(
              "w-64 lg:w-72 top-0 bottom-0",
              mobileOpen ? "left-0" : "-left-full"
            )
            : cn(
              collapsed ? "w-[72px]" : "w-64 lg:w-72"
            )
        )}
      >
        {/* Sidebar header */}
        <div className="px-4 h-14 flex items-center justify-between border-b border-sidebar-border relative">
          {!collapsed || (isMobile && mobileOpen) ? (
            <h2 className="text-xl font-semibold text-sidebar-foreground">Finanças</h2>
          ) : (
            <div className="w-full flex justify-center">
              <Home className="w-6 h-6 text-sidebar-primary" />
            </div>
          )}

          {isMobile && mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="p-1 rounded-full hover:bg-sidebar-accent transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}

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
        
        {/* User profile button at top */}
        <div className="px-4 py-2 flex justify-center items-center border-b border-sidebar-border">
          {!collapsed || (isMobile && mobileOpen) ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-sm text-sidebar-foreground">Minha conta</span>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          ) : (
            <UserButton afterSignOutUrl="/sign-in" />
          )}
        </div>
        
        {/* Navigation links */}
        <div className="mt-6 flex flex-col gap-1 px-3 overflow-y-auto flex-1">
          {filteredLinks.map((link) => (
            <SidebarLink
              key={link.href}
              icon={link.icon}
              label={link.label}
              href={link.href}
              active={location.pathname === link.href}
              isCollapsed={collapsed && !mobileOpen}
              onClick={handleLinkClick}
              submenu={link.submenu}
            />
          ))}
        </div>
        
        {/* Settings link at the bottom */}
        <div className="px-3 mb-6 mt-auto">
          <SidebarLink
            icon={settingsLink.icon}
            label={settingsLink.label}
            href={settingsLink.href}
            active={location.pathname === settingsLink.href}
            isCollapsed={collapsed && !mobileOpen}
            onClick={handleLinkClick}
          />
        </div>
      </aside>
      
      {/* Main content wrapper with padding */}
      <main className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        isMobile
          ? "pl-0 pt-14"
          : cn(
            collapsed ? "pl-[72px]" : "pl-64 lg:pl-72"
          )
      )}>
        {/* Children content */}
      </main>
    </>
  );
}

export default Sidebar;
