import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك في لوحة التحكم',
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: result.error,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
          <p className="text-gray-600">منحل أحمد - إدارة الموقع</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-10 text-right"
                  placeholder="admin"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 text-right"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-6 text-lg"
              disabled={loading}
            >
              {loading ? (
                <span>جاري التحميل...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>المعلومات الافتراضية:</p>
            <p className="font-mono mt-1">admin / admin123</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← العودة إلى الموقع
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
