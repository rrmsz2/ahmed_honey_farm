import { useEffect, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout, { Empty, Loading } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, errorMessage } from '@/lib/api';
import { imageUrl } from '@/lib/format';

const EMPTY = { url: '', caption_ar: '', caption_en: '', order: 0 };

const Gallery = () => {
  const [images, setImages] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get('/admin/gallery')
      .then(({ data }) => setImages(data.images))
      .catch((error) => {
        toast.error(errorMessage(error, 'فشل في تحميل المعرض'));
        setImages([]);
      });

  useEffect(() => {
    load();
  }, []);

  const set = (field) => (event) => setEditing((prev) => ({ ...prev, [field]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = { url: editing.url, caption_ar: editing.caption_ar, caption_en: editing.caption_en, order: Number(editing.order) || 0 };
    try {
      if (editing.id) await api.put(`/admin/gallery/${editing.id}`, payload);
      else await api.post('/admin/gallery', payload);
      toast.success('تم حفظ الصورة');
      setEditing(null);
      load();
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في حفظ الصورة'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (image) => {
    if (!window.confirm('حذف هذه الصورة نهائياً؟')) return;
    try {
      await api.delete(`/admin/gallery/${image.id}`);
      toast.success('تم حذف الصورة');
      load();
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في حذف الصورة'));
    }
  };

  return (
    <AdminLayout
      title="معرض الصور"
      actions={
        <Button onClick={() => setEditing({ ...EMPTY, order: (images?.length || 0) + 1 })} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          صورة جديدة
        </Button>
      }
    >
      {images === null ? (
        <Loading />
      ) : images.length === 0 ? (
        <Empty>لا توجد صور بعد</Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative h-56">
                <img src={imageUrl(image.url, { w: 500, h: 420 })} alt={image.caption_ar} className="w-full h-full object-cover" />
                <span className="absolute top-3 start-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">#{image.order}</span>
              </div>
              <CardContent className="p-4 space-y-2">
                <p className="font-medium">{image.caption_ar}</p>
                <p className="text-sm text-gray-500" dir="ltr">{image.caption_en}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => setEditing(image)}>
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(image)} aria-label="حذف">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'تعديل الصورة' : 'صورة جديدة'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label>رابط الصورة</Label>
                <Input type="url" value={editing.url} onChange={set('url')} required dir="ltr" placeholder="https://" />
              </div>
              {editing.url && <img src={imageUrl(editing.url, { w: 600, h: 320 })} alt="" className="w-full h-44 object-cover rounded-md border" />}
              <div className="space-y-2">
                <Label>الوصف بالعربية</Label>
                <Input value={editing.caption_ar} onChange={set('caption_ar')} required />
              </div>
              <div className="space-y-2">
                <Label>الوصف بالإنجليزية</Label>
                <Input value={editing.caption_en} onChange={set('caption_en')} required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>الترتيب (الأصغر يظهر أولاً)</Label>
                <Input type="number" value={editing.order} onChange={set('order')} />
              </div>
              <DialogFooter className="gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Gallery;
