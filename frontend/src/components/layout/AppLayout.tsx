import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, ChevronDown, User as UserIcon, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

const SidebarItem = ({ icon: Icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
  <Link to={path} className={cn(
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
    active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  )}>
    <Icon className={cn("w-5 h-5", active ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div layoutId="active-nav" className="absolute ltr:left-0 rtl:right-0 top-0 w-1 h-full bg-primary-600 ltr:rounded-r-full rtl:rounded-l-full" />
    )}
  </Link>
);

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export const AppLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setUserEmail(decoded.email || '');
        setUserRole(decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '');
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="px-6 flex items-center justify-center overflow-hidden h-16">
          <img src="/logo.jpg" alt={t('layout.brand')} className="w-full scale-[0.9] mix-blend-multiply" />
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-6">
          <SidebarItem icon={LayoutDashboard} label={t('layout.dashboard')} path="/dashboard" active={location.pathname === '/dashboard'} />
          <SidebarItem icon={FileText} label={t('layout.invoices')} path="/invoices" active={location.pathname.startsWith('/invoices')} />
          <SidebarItem icon={AlertTriangle} label={t('layout.needs_attention')} path="/attention" active={location.pathname === '/attention'} />
          {userRole === 'SystemOperator' && (
            <SidebarItem icon={Shield} label={t('layout.system_admin')} path="/system-admin" active={location.pathname.startsWith('/system-admin')} />
          )}
          <SidebarItem icon={Settings} label={t('layout.settings')} path="/settings" active={location.pathname === '/settings'} />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-left text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="font-medium">{t('layout.sign_out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            {location.pathname === '/dashboard' ? t('layout.overview') : location.pathname.startsWith('/invoices') ? t('layout.invoices') : t('layout.settings')}
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200"
              >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-12 ltr:right-0 rtl:left-0 w-64 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-medium text-slate-900 truncate">{userEmail || 'User'}</p>
                    <p className="text-xs text-slate-500">{t('layout.tenant_admin')}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                      <UserIcon className="w-4 h-4 text-slate-400" /> {t('layout.account_profile')}
                    </Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                      <Settings className="w-4 h-4 text-slate-400" /> {t('layout.org_settings')}
                    </Link>
                  </div>
                  <div className="p-2 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                      <LogOut className="w-4 h-4 text-red-500" /> {t('layout.sign_out')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
