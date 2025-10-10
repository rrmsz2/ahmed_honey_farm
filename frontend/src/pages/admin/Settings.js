import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Save, Key, Phone } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    api_key: '',
    admin_phone: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/settings/whatsapp`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings/whatsapp`, settings);
      
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات واتساب بنجاح',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              العودة
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              إعدادات واتساب
            </CardTitle>
            <CardDescription>
              إدارة API Key ورقم الهاتف لإشعارات الطلبات
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>ملاحظة:</strong> سيتم استخدام هذه الإعدادات لإرسال:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                <li>رموز التحقق (OTP) للعملاء</li>
                <li>تأكيدات الطلبات للعملاء</li>
                <li>إشعارات الطلبات الجديدة للمشرف</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Key className="w-4 h-4" />
                  API Key
                </label>
                <Input
                  value={settings.api_key}
                  onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                  placeholder="akcfvdN9YTRL"
                  dir="ltr"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  API Key من TextMeBot أو الخدمة المستخدمة
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Phone className="w-4 h-4" />
                  رقم هاتف المشرف
                </label>
                <Input
                  value={settings.admin_phone}
                  onChange={(e) => setSettings({...settings, admin_phone: e.target.value})}
                  placeholder="+96895555386"
                  dir="ltr"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الرقم الذي سيستقبل إشعارات الطلبات الجديدة (يجب أن يبدأ بـ +968)
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>للحصول على API Key:</strong>
              </p>
              <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>قم بزيارة موقع TextMeBot أو الخدمة المستخدمة</li>
                <li>قم بالتسجيل وربط رقم واتساب</li>
                <li>احصل على API Key من لوحة التحكم</li>
                <li>الصق API Key هنا</li>
              </ol>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 ml-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
