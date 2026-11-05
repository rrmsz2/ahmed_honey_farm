import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, DollarSign, ShoppingCart, Truck } from 'lucide-react';
import AdminLayout, { ADMIN_NAV, Loading } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/orders/stats').then(({ data }) => setStats(data)).catch(() => setStats({ by_status: {} }));
  }, []);

  const cards = stats && [
    { title: 'إجمالي الطلبات المؤكدة', value: stats.total_orders ?? 0, icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
    { title: 'طلبات جديدة', value: stats.by_status.confirmed ?? 0, icon: Clock, color: 'from-yellow-500 to-amber-600' },
    { title: 'قيد التجهيز', value: stats.by_status.processing ?? 0, icon: Truck, color: 'from-indigo-500 to-indigo-600' },
    { title: 'تم التسليم', value: stats.by_status.delivered ?? 0, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { title: 'إجمالي المبيعات', value: formatMoney(stats.total_revenue, 'ar'), icon: DollarSign, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <AdminLayout title="نظرة عامة">
      {!stats ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {cards.map(({ title, value, icon: Icon, color }) => (
            <Card key={title} className="overflow-hidden">
              <CardContent className={`p-5 bg-gradient-to-l ${color} text-white flex items-center justify-between`}>
                <div>
                  <p className="text-sm opacity-90">{title}</p>
                  <p className="text-2xl font-bold mt-2">{value}</p>
                </div>
                <Icon className="w-10 h-10 opacity-80" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADMIN_NAV.slice(1).map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="hover:shadow-lg hover:border-amber-400 transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
