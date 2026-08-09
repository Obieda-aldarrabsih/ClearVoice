import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, FileCheck2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
  <Link to={path} className={cn(
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
    active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  )}>
    <Icon className={cn("w-5 h-5", active ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full" />
    )}
  </Link>
);

export const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-lg">
            <FileCheck2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ClearVoice</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-6">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" active={location.pathname === '/dashboard'} />
          <SidebarItem icon={FileText} label="Invoices" path="/invoices" active={location.pathname === '/invoices'} />
          <SidebarItem icon={Settings} label="Settings" path="/settings" active={location.pathname === '/settings'} />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-left text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            {location.pathname === '/dashboard' ? 'Overview' : location.pathname === '/invoices' ? 'Invoices' : 'Settings'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
