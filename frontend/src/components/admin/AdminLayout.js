import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ExternalLink, FileText, Image, LayoutDashboard, LogOut, Package, Settings, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const ADMIN_NAV = [
  { to: '/admin', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/gallery', label: 'المعرض', icon: Image },
  { to: '/admin/content', label: 'المحتوى', icon: FileText },
  { to: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

const AdminLayout = ({ title, actions, children }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" lang="ar">
      <header className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/admin" className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            🍯 لوحة تحكم منحل أحمد
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-gray-500">{admin?.username}</span>
            <Button variant="outline" size="sm" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">عرض الموقع</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-red-600 hover:text-red-700"
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
        <nav className="container mx-auto px-4 flex gap-1 overflow-x-auto">
          {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                  isActive ? 'border-amber-500 text-amber-700 font-semibold' : 'border-transparent text-gray-600 hover:text-gray-900',
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
};

export const Loading = () => <div className="text-center py-16 text-gray-500">جاري التحميل...</div>;
export const Empty = ({ children }) => <div className="text-center py-16 text-gray-500">{children}</div>;

export default AdminLayout;
