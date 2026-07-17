import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  History, 
  Activity, 
  Settings,
  TableProperties,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Folder", icon: FolderOpen, path: "/folders" },
  { name: "Team", icon: Users, path: "/team" },
  { name: "History", icon: History, path: "/history" },
  { name: "Monitoring", icon: Activity, path: "/monitoring" },
  { name: "Setting", icon: Settings, path: "/settings" },
];

export function SidebarLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:flex",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center">
            <TableProperties className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
            <span className="font-semibold text-lg tracking-tight">CloudSheet</span>
          </div>
          {/* Close button for mobile */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={closeMobileMenu}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-200",
              )} />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium leading-none truncate">Account</span>
                <span className="text-xs text-slate-500 mt-1 truncate">{user?.email}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center px-4 md:px-8 justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center">
            {/* Hamburger menu for mobile */}
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Online" />
              <span className="text-xs font-medium text-slate-500 hidden md:inline">System Online</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto w-full h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
