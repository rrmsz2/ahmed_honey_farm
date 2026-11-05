import { useEffect, useState } from 'react';
import { KeyRound, Lock, MessageCircle, Phone, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout, { Loading } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { api, errorMessage } from '@/lib/api';

const WhatsAppSettings = () => {
  const [settings, setSettings] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.get('/admin/settings/whatsapp').then(({ data }) => {
      setSettings(data);
      setPhone(data.admin_phone);
    });

  useEffect(() => {
    load().catch((error) => toast.error(errorMessage(error, 'فشل في تحميل الإعدادات')));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.put('/admin/settings/whatsapp', { admin_phone: phone, api_key: apiKey || null });
      setApiKey('');
      await load();
      toast.success('تم حفظ إعدادات واتساب');
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في حفظ الإعدادات'));
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    try {
      await api.post('/admin/settings/whatsapp/test');
      toast.success('تم إرسال رسالة تجريبية إلى رقم المشرف');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!settings) return <Loading />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          إعدادات واتساب (TextMeBot)
        </CardTitle>
        <CardDescription>تُستخدم لإرسال رموز التحقق، وتأكيد الطلب للعميل، وإشعار المشرف بكل طلب جديد.</CardDescription>
      </CardHeader>
      <CardContent>
        {settings.dry_run && (
          <p className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            وضع التجربة مفعّل (WHATSAPP_DRY_RUN): الرسائل تُكتب في سجلات الخادم ولا تُرسل فعلياً.
          </p>
        )}
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><KeyRound className="w-4 h-4" /> مفتاح API</Label>
            <Input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={settings.has_api_key ? `محفوظ: ${settings.api_key_masked} — اتركه فارغاً للإبقاء عليه` : 'أدخل مفتاح API'}
              dir="ltr"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> رقم المشرف (يستقبل إشعارات الطلبات)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+9689XXXXXXX" dir="ltr" className="font-mono" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy} className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" />
              حفظ
            </Button>
            <Button type="button" variant="outline" disabled={busy || !settings.admin_phone} onClick={test} className="gap-2">
              <Send className="w-4 h-4" />
              إرسال رسالة تجريبية
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PasswordSettings = () => {
  const { replaceToken } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (form.next !== form.confirm) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/admin/password', { current_password: form.current, new_password: form.next });
      replaceToken(data.access_token);
      setForm({ current: '', next: '', confirm: '' });
      toast.success('تم تغيير كلمة المرور');
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في تغيير كلمة المرور'));
    } finally {
      setBusy(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-600" />
          تغيير كلمة المرور
        </CardTitle>
        <CardDescription>10 أحرف على الأقل. ستنتهي جلسات الأجهزة الأخرى بعد التغيير.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>كلمة المرور الحالية</Label>
            <Input type="password" autoComplete="current-password" value={form.current} onChange={set('current')} required />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة</Label>
            <Input type="password" autoComplete="new-password" minLength={10} value={form.next} onChange={set('next')} required />
          </div>
          <div className="space-y-2">
            <Label>تأكيد كلمة المرور الجديدة</Label>
            <Input type="password" autoComplete="new-password" minLength={10} value={form.confirm} onChange={set('confirm')} required />
          </div>
          <Button type="submit" disabled={busy}>تغيير كلمة المرور</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const Settings = () => (
  <AdminLayout title="الإعدادات">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      <WhatsAppSettings />
      <PasswordSettings />
    </div>
  </AdminLayout>
);

export default Settings;
