import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Package, ShoppingCart, Image, FileText, 
  TrendingUp, DollarSign, CheckCircle, Clock 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const statCards = [
    {
      title: 'إجمالي الطلبات',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'طلبات قيد الانتظار',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'طلبات مؤكدة',
      value: stats?.confirmed_orders || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'إجمالي المبيعات',
      value: `${stats?.total_revenue || 0} ريال`,
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  const menuItems = [
    {
      title: 'إدارة الطلبات',
      description: 'عرض وإدارة جميع الطلبات',
      icon: ShoppingCart,
      path: '/admin/orders',
      color: 'bg-blue-500'
    },
    {
      title: 'إدارة المنتجات',
      description: 'إضافة وتعديل المنتجات',
      icon: Package,
      path: '/admin/products',
      color: 'bg-green-500'
    },
    {
      title: 'معرض الصور',
      description: 'إدارة صور المعرض',
      icon: Image,
      path: '/admin/gallery',
      color: 'bg-purple-500'
    },
    {
      title: 'محتوى الموقع',
      description: 'تعديل نصوص الموقع',
      icon: FileText,
      path: '/admin/content',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
              <p className="text-gray-600 mt-1">منحل أحمد</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                عرض الموقع
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <stat.icon className="w-12 h-12 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-amber-400"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`${item.color} p-3 rounded-xl`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
