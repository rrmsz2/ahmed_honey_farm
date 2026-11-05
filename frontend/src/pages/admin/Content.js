import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout, { Loading } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api, errorMessage } from '@/lib/api';

/** Editable fields per section. `multiline` → textarea, `ltr` → left-to-right input. */
const SECTIONS = [
  {
    key: 'hero',
    label: 'الواجهة الرئيسية',
    fields: [
      { key: 'title', label: 'العنوان' },
      { key: 'subtitle', label: 'العنوان الفرعي' },
      { key: 'description', label: 'الوصف', multiline: true },
      { key: 'cta', label: 'زر الطلب' },
      { key: 'learnMore', label: 'زر القصة' },
      { key: 'image', label: 'رابط صورة الخلفية', ltr: true },
    ],
  },
  {
    key: 'story',
    label: 'القصة',
    fields: [
      { key: 'title', label: 'العنوان' },
      { key: 'subtitle', label: 'العنوان الفرعي' },
      { key: 'content', label: 'نص القصة', multiline: true, rows: 8 },
    ],
    stats: true,
  },
  {
    key: 'contact',
    label: 'التواصل',
    fields: [
      { key: 'title', label: 'العنوان' },
      { key: 'subtitle', label: 'العنوان الفرعي' },
      { key: 'phone', label: 'رقم الهاتف المعروض', ltr: true },
      { key: 'whatsapp', label: 'رقم واتساب (للزر)', ltr: true },
      { key: 'whatsappMessage', label: 'رسالة واتساب الافتراضية', multiline: true },
      { key: 'hoursDays', label: 'أيام العمل' },
      { key: 'hoursTime', label: 'ساعات العمل' },
      { key: 'hoursNote', label: 'ملاحظة ساعات العمل' },
    ],
  },
  {
    key: 'footer',
    label: 'التذييل',
    fields: [
      { key: 'tagline', label: 'الشعار' },
      { key: 'copyright', label: 'حقوق النشر' },
      { key: 'school', label: 'المدرسة' },
    ],
  },
];

const LANGS = [
  { key: 'ar', label: 'العربية', dir: 'rtl' },
  { key: 'en', label: 'English', dir: 'ltr' },
];

const Content = () => {
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    api
      .get('/admin/site-content')
      .then(({ data }) => setContent(data.content))
      .catch((error) => toast.error(errorMessage(error, 'فشل في تحميل المحتوى')));
  }, []);

  const update = (section, lang, field, value) =>
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], [lang]: { ...prev[section][lang], [field]: value } },
    }));

  const updateStat = (section, lang, index, field, value) => {
    const stats = [...(content[section][lang].stats || [])];
    while (stats.length < 3) stats.push({ number: '', label: '' });
    stats[index] = { ...stats[index], [field]: value };
    update(section, lang, 'stats', stats);
  };

  const save = async (section) => {
    setSaving(section);
    try {
      await api.put(`/admin/site-content/${section}`, {
        content_ar: content[section].ar,
        content_en: content[section].en,
      });
      toast.success('تم حفظ المحتوى');
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في حفظ المحتوى'));
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout title="محتوى الموقع">
      {!content ? (
        <Loading />
      ) : (
        <Tabs defaultValue="hero" dir="rtl">
          <TabsList className="flex flex-wrap h-auto mb-6">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>
            ))}
          </TabsList>

          {SECTIONS.map((section) => (
            <TabsContent key={section.key} value={section.key}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {LANGS.map((lang) => {
                  const values = content[section.key]?.[lang.key] || {};
                  return (
                    <Card key={lang.key}>
                      <CardHeader>
                        <CardTitle>{lang.label}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4" dir={lang.dir}>
                        {section.fields.map((field) => {
                          const Component = field.multiline ? Textarea : Input;
                          return (
                            <div key={field.key} className="space-y-2">
                              <Label>{field.label}</Label>
                              <Component
                                value={values[field.key] || ''}
                                onChange={(e) => update(section.key, lang.key, field.key, e.target.value)}
                                rows={field.multiline ? field.rows || 3 : undefined}
                                dir={field.ltr ? 'ltr' : undefined}
                              />
                            </div>
                          );
                        })}
                        {section.stats && (
                          <div className="space-y-2">
                            <Label>بطاقات الأرقام</Label>
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="grid grid-cols-3 gap-2">
                                <Input
                                  value={values.stats?.[i]?.number || ''}
                                  onChange={(e) => updateStat(section.key, lang.key, i, 'number', e.target.value)}
                                  placeholder="50+"
                                />
                                <Input
                                  className="col-span-2"
                                  value={values.stats?.[i]?.label || ''}
                                  onChange={(e) => updateStat(section.key, lang.key, i, 'label', e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Button onClick={() => save(section.key)} disabled={saving === section.key} className="mt-6 gap-2 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4" />
                {saving === section.key ? 'جاري الحفظ...' : `حفظ قسم ${section.label}`}
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </AdminLayout>
  );
};

export default Content;
