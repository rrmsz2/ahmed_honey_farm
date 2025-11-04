import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Content = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    hero: { ar: {}, en: {} },
    story: { ar: {}, en: {} },
    contact: { ar: {}, en: {} },
    footer: { ar: {}, en: {} }
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/site-content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const contentData = response.data.content;
      
      // Default content structure
      const defaultContent = {
        hero: { ar: {}, en: {} },
        story: { ar: {}, en: {} },
        contact: { ar: {}, en: {} },
        footer: { ar: {}, en: {} }
      };
      
      // Transform the data structure
      const transformed = { ...defaultContent };
      
      if (contentData && Array.isArray(contentData)) {
        contentData.forEach(item => {
          if (item && item.section) {
            transformed[item.section] = {
              ar: item.content_ar || {},
              en: item.content_en || {}
            };
          }
        });
      }
      
      setContent(transformed);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المحتوى',
        variant: 'destructive',
      });
      
      // Set default content on error
      setContent({
        hero: { ar: {}, en: {} },
        story: { ar: {}, en: {} },
        contact: { ar: {}, en: {} },
        footer: { ar: {}, en: {} }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section) => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/site-content/${section}`, {
        content_ar: content[section]?.ar || {},
        content_en: content[section]?.en || {}
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast({
        title: 'تم الحفظ',
        description: `تم حفظ محتوى قسم ${getSectionName(section)} بنجاح`,
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المحتوى',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getSectionName = (section) => {
    const names = {
      hero: 'البطل',
      story: 'القصة',
      contact: 'التواصل',
      footer: 'التذييل'
    };
    return names[section] || section;
  };

  const updateContent = (section, lang, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [lang]: {
          ...prev[section][lang],
          [field]: value
        }
      }
    }));
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
            <h1 className="text-2xl font-bold text-gray-900">إدارة محتوى الموقع</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">قسم البطل</TabsTrigger>
            <TabsTrigger value="story">قسم القصة</TabsTrigger>
            <TabsTrigger value="contact">قسم التواصل</TabsTrigger>
            <TabsTrigger value="footer">التذييل</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>محتوى قسم البطل (Hero Section)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arabic */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">النسخة العربية</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الرئيسي</label>
                      <Input
                        value={content.hero?.ar?.title || ''}
                        onChange={(e) => updateContent('hero', 'ar', 'title', e.target.value)}
                        placeholder="عسل أحمد الطبيعي"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                      <Input
                        value={content.hero?.ar?.subtitle || ''}
                        onChange={(e) => updateContent('hero', 'ar', 'subtitle', e.target.value)}
                        placeholder="رحلة طالب في الصف الخامس"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">الوصف</label>
                      <Textarea
                        value={content.hero?.ar?.description || ''}
                        onChange={(e) => updateContent('hero', 'ar', 'description', e.target.value)}
                        rows={3}
                        placeholder="من مدرسة زيد بن ثابت..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">نص الزر</label>
                      <Input
                        value={content.hero?.ar?.cta || ''}
                        onChange={(e) => updateContent('hero', 'ar', 'cta', e.target.value)}
                        placeholder="اطلب الآن"
                      />
                    </div>
                  </div>

                  {/* English */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">English Version</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Main Title</label>
                      <Input
                        value={content.hero?.en?.title || ''}
                        onChange={(e) => updateContent('hero', 'en', 'title', e.target.value)}
                        placeholder="Ahmad's Natural Honey"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle</label>
                      <Input
                        value={content.hero?.en?.subtitle || ''}
                        onChange={(e) => updateContent('hero', 'en', 'subtitle', e.target.value)}
                        placeholder="A 5th Grader's Journey"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={content.hero?.en?.description || ''}
                        onChange={(e) => updateContent('hero', 'en', 'description', e.target.value)}
                        rows={3}
                        placeholder="From Zaid Bin Thabit..."
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Button Text</label>
                      <Input
                        value={content.hero?.en?.cta || ''}
                        onChange={(e) => updateContent('hero', 'en', 'cta', e.target.value)}
                        placeholder="Order Now"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSection('hero')} 
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Story Section */}
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle>محتوى قسم القصة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arabic */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">النسخة العربية</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان</label>
                      <Input
                        value={content.story?.ar?.title || ''}
                        onChange={(e) => updateContent('story', 'ar', 'title', e.target.value)}
                        placeholder="قصة أحمد"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                      <Input
                        value={content.story?.ar?.subtitle || ''}
                        onChange={(e) => updateContent('story', 'ar', 'subtitle', e.target.value)}
                        placeholder="حلم صغير أصبح حقيقة"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">محتوى القصة</label>
                      <Textarea
                        value={content.story?.ar?.content || ''}
                        onChange={(e) => updateContent('story', 'ar', 'content', e.target.value)}
                        rows={6}
                        placeholder="أنا أحمد، طالب في الصف الخامس..."
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium mb-3">البطاقات الإحصائية</label>
                      <div className="space-y-3">
                        {[0, 1, 2].map((index) => (
                          <div key={index} className="grid grid-cols-2 gap-2 p-3 bg-amber-50 rounded-lg">
                            <Input
                              value={content.story?.ar?.stats?.[index]?.number || ''}
                              onChange={(e) => {
                                const stats = content.story?.ar?.stats || [{}, {}, {}];
                                stats[index] = { ...stats[index], number: e.target.value };
                                updateContent('story', 'ar', 'stats', stats);
                              }}
                              placeholder="50+"
                            />
                            <Input
                              value={content.story?.ar?.stats?.[index]?.label || ''}
                              onChange={(e) => {
                                const stats = content.story?.ar?.stats || [{}, {}, {}];
                                stats[index] = { ...stats[index], label: e.target.value };
                                updateContent('story', 'ar', 'stats', stats);
                              }}
                              placeholder="خلية نحل نشطة"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* English */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">English Version</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={content.story?.en?.title || ''}
                        onChange={(e) => updateContent('story', 'en', 'title', e.target.value)}
                        placeholder="Ahmad's Story"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle</label>
                      <Input
                        value={content.story?.en?.subtitle || ''}
                        onChange={(e) => updateContent('story', 'en', 'subtitle', e.target.value)}
                        placeholder="A Small Dream That Became Reality"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Story Content</label>
                      <Textarea
                        value={content.story?.en?.content || ''}
                        onChange={(e) => updateContent('story', 'en', 'content', e.target.value)}
                        rows={6}
                        placeholder="I'm Ahmad, a 5th-grade student..."
                        dir="ltr"
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium mb-3">Stat Cards</label>
                      <div className="space-y-3">
                        {[0, 1, 2].map((index) => (
                          <div key={index} className="grid grid-cols-2 gap-2 p-3 bg-amber-50 rounded-lg">
                            <Input
                              value={content.story?.en?.stats?.[index]?.number || ''}
                              onChange={(e) => {
                                const stats = content.story?.en?.stats || [{}, {}, {}];
                                stats[index] = { ...stats[index], number: e.target.value };
                                updateContent('story', 'en', 'stats', stats);
                              }}
                              placeholder="50+"
                              dir="ltr"
                            />
                            <Input
                              value={content.story?.en?.stats?.[index]?.label || ''}
                              onChange={(e) => {
                                const stats = content.story?.en?.stats || [{}, {}, {}];
                                stats[index] = { ...stats[index], label: e.target.value };
                                updateContent('story', 'en', 'stats', stats);
                              }}
                              placeholder="Active Beehives"
                              dir="ltr"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSection('story')} 
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>محتوى قسم التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arabic */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">النسخة العربية</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان</label>
                      <Input
                        value={content.contact?.ar?.title || ''}
                        onChange={(e) => updateContent('contact', 'ar', 'title', e.target.value)}
                        placeholder="تواصل معنا"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                      <Input
                        value={content.contact?.ar?.subtitle || ''}
                        onChange={(e) => updateContent('contact', 'ar', 'subtitle', e.target.value)}
                        placeholder="نسعد بطلباتكم واستفساراتكم"
                      />
                    </div>
                  </div>

                  {/* English */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">English Version</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={content.contact?.en?.title || ''}
                        onChange={(e) => updateContent('contact', 'en', 'title', e.target.value)}
                        placeholder="Contact Us"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle</label>
                      <Input
                        value={content.contact?.en?.subtitle || ''}
                        onChange={(e) => updateContent('contact', 'en', 'subtitle', e.target.value)}
                        placeholder="We welcome your orders"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSection('contact')} 
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Section */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>محتوى التذييل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arabic */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">النسخة العربية</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">الشعار</label>
                      <Input
                        value={content.footer?.ar?.tagline || ''}
                        onChange={(e) => updateContent('footer', 'ar', 'tagline', e.target.value)}
                        placeholder="عسل طبيعي من القلب"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">حقوق النشر</label>
                      <Input
                        value={content.footer?.ar?.copyright || ''}
                        onChange={(e) => updateContent('footer', 'ar', 'copyright', e.target.value)}
                        placeholder="© 2024 منحل أحمد"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">اسم المدرسة</label>
                      <Input
                        value={content.footer?.ar?.school || ''}
                        onChange={(e) => updateContent('footer', 'ar', 'school', e.target.value)}
                        placeholder="مدرسة زيد بن ثابت الابتدائية"
                      />
                    </div>
                  </div>

                  {/* English */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">English Version</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tagline</label>
                      <Input
                        value={content.footer?.en?.tagline || ''}
                        onChange={(e) => updateContent('footer', 'en', 'tagline', e.target.value)}
                        placeholder="Natural Honey from the Heart"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Copyright</label>
                      <Input
                        value={content.footer?.en?.copyright || ''}
                        onChange={(e) => updateContent('footer', 'en', 'copyright', e.target.value)}
                        placeholder="© 2024 Ahmad Apiary"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">School Name</label>
                      <Input
                        value={content.footer?.en?.school || ''}
                        onChange={(e) => updateContent('footer', 'en', 'school', e.target.value)}
                        placeholder="Zaid Bin Thabit Elementary School"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSection('footer')} 
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Content;
