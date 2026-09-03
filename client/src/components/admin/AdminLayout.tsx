import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Sliders,
  ClipboardList,
  Users,
  Ticket,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Crown,
  FileText,
  Folder,
  Scissors,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: Folder },
    { label: 'Fabrics Library', path: '/admin/fabrics', icon: Scissors },
    { label: 'Customization Options', path: '/admin/customizations', icon: Sliders },
    { label: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Journal & Blogs', path: '/admin/blogs', icon: BookOpen },
    { label: 'Site Content (CMS)', path: '/admin/content', icon: FileText },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_err) {
      // ignore
    }
    clearAuth();
    navigate('/login');
  };

  const currentNav = navItems.find((item) => item.path === location.pathname) || {
    label: 'Dashboard',
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 shadow-xs z-20">
        <div>
          {/* Admin Header / Brand Logo */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xs">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-sm tracking-wide text-slate-900">
                  STITCHX <span className="text-amber-600 font-sans text-xs">PLUS</span>
                </h1>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block -mt-0.5">
                  Sartorial Backoffice
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Management Portal
            </div>
            <nav className="space-y-1 mt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Admin User Info & Store Link */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-white transition-all border border-transparent hover:border-slate-200/60 font-medium"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> Live Storefront
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </Link>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-amber-600 font-semibold tracking-wider uppercase">
                  {user?.role || 'ADMIN'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/70 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                System Operational
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Active View:{' '}
              <strong className="text-slate-900 font-medium">{currentNav.label}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">
              Logged in as <strong className="text-slate-900 font-semibold">{user?.email}</strong>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Container */}
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
