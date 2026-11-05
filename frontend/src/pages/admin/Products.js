import { useEffect, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout, { Empty, Loading } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { api, errorMessage } from '@/lib/api';
import { formatMoney, imageUrl } from '@/lib/format';

const EMPTY = {
  name_ar: '', name_en: '', description_ar: '', description_en: '',
  price: '', weight: '', image_url: '', available: true, sort_order: 0,
};
const FIELDS = Object.keys(EMPTY);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

const Products = () => {
  const [products, setProducts] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get('/admin/products')
      .then(({ data }) => setProducts(data.products))
      .catch((error) => {
        toast.error(errorMessage(error, 'فشل في تحميل المنتجات'));
        setProducts([]);
      });

  useEffect(() => {
    load();
  }, []);

  const set = (field) => (event) => setEditing((prev) => ({ ...prev, [field]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(FIELDS.map((f) => [f, editing[f]]));
    payload.price = Number(payload.price);
    payload.sort_order = Number(payload.sort_order) || 0;
    try {
      if (editing.id) {
        await api.put(`/admin/products/${editing.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      toast.success('تم حفظ المنتج');
      setEditing(null);
      load();
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في حفظ المنتج'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`حذف "${product.name_ar}" نهائياً؟`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      toast.success('تم حذف المنتج');
      load();
    } catch (error) {
      toast.error(errorMessage(error, 'فشل في حذف المنتج'));
    }
  };

  return (
    <AdminLayout
      title="المنتجات"
      actions={
        <Button onClick={() => setEditing({ ...EMPTY })} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          منتج جديد
        </Button>
      }
    >
      {products === null ? (
        <Loading />
      ) : products.length === 0 ? (
        <Empty>لا توجد منتجات بعد</Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-48">
                <img src={imageUrl(product.image_url, { w: 500, h: 380 })} alt={product.name_ar} className="w-full h-full object-cover" />
                <span className={`absolute top-3 start-3 px-3 py-1 rounded-full text-sm text-white ${product.available ? 'bg-green-500' : 'bg-red-500'}`}>
                  {product.available ? 'متوفر' : 'غير متوفر'}
                </span>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="text-lg font-bold">{product.name_ar}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description_ar}</p>
                <div className="flex justify-between">
                  <span className="text-xl font-bold text-amber-600">{formatMoney(product.price)}</span>
                  <span className="text-sm text-gray-500">{product.weight}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => setEditing({ ...EMPTY, ...product })}>
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(product)} aria-label="حذف">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'تعديل المنتج' : 'منتج جديد'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="الاسم بالعربية"><Input value={editing.name_ar} onChange={set('name_ar')} required /></Field>
                <Field label="الاسم بالإنجليزية"><Input value={editing.name_en} onChange={set('name_en')} required dir="ltr" /></Field>
              </div>
              <Field label="الوصف بالعربية"><Textarea value={editing.description_ar} onChange={set('description_ar')} rows={3} /></Field>
              <Field label="الوصف بالإنجليزية"><Textarea value={editing.description_en} onChange={set('description_en')} rows={3} dir="ltr" /></Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="السعر (ر.ع)"><Input type="number" min="0.001" step="0.001" value={editing.price} onChange={set('price')} required /></Field>
                <Field label="الوزن"><Input value={editing.weight} onChange={set('weight')} placeholder="1 كغ" /></Field>
                <Field label="الترتيب"><Input type="number" value={editing.sort_order} onChange={set('sort_order')} /></Field>
              </div>
              <Field label="رابط الصورة"><Input type="url" value={editing.image_url} onChange={set('image_url')} required dir="ltr" placeholder="https://" /></Field>
              {editing.image_url && <img src={imageUrl(editing.image_url, { w: 600, h: 300 })} alt="" className="w-full h-40 object-cover rounded-md border" />}
              <div className="flex items-center gap-3">
                <Switch id="available" checked={editing.available} onCheckedChange={(available) => setEditing((p) => ({ ...p, available }))} />
                <Label htmlFor="available">متوفر للبيع</Label>
              </div>
              <DialogFooter className="gap-2 pt-2">
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

export default Products;
