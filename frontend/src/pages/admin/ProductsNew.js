import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        toast({
          title: 'خطأ',
          description: 'يجب تسجيل الدخول أولاً',
          variant: 'destructive',
        });
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Products loaded:', response.data.products?.length || 0);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      } else {
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل المنتجات',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingProduct({
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price: '',
      weight: '',
      image_url: '',
      available: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getToken();

      if (!token) {
        toast({
          title: 'خطأ',
          description: 'يجب تسجيل الدخول أولاً',
          variant: 'destructive',
        });
        navigate('/admin/login');
        return;
      }

      // Validate
      if (!editingProduct.name_ar || !editingProduct.name_en || !editingProduct.price) {
        toast({
          title: 'خطأ',
          description: 'الرجاء ملء جميع الحقول المطلوبة',
          variant: 'destructive',
        });
        return;
      }

      const productData = {
        name_ar: editingProduct.name_ar,
        name_en: editingProduct.name_en,
        description_ar: editingProduct.description_ar || '',
        description_en: editingProduct.description_en || '',
        price: parseFloat(editingProduct.price),
        weight: editingProduct.weight || '500g',
        image_url: editingProduct.image_url || '',
        available: editingProduct.available !== false
      };

      if (editingProduct.id) {
        // Update
        await axios.put(
          `${BACKEND_URL}/api/admin/products/${editingProduct.id}`,
          productData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث المنتج بنجاح',
        });
      } else {
        // Create
        await axios.post(
          `${BACKEND_URL}/api/admin/products`,
          productData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة المنتج بنجاح',
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.detail || 'فشل في حفظ المنتج',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const token = getToken();
      await axios.delete(`${BACKEND_URL}/api/admin/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المنتج بنجاح',
      });
      
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المنتج',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                العودة
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
            </div>
            <Button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600"
            >
              <Plus className="w-5 h-5" />
              إضافة منتج جديد
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">جاري التحميل...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600 mb-4">لا توجد منتجات حالياً</div>
            <Button onClick={handleAddNew} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-5 h-5 ml-2" />
              إضافة منتج جديد
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name_ar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name_ar}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description_ar}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-600">
                      {product.price} ر.ع
                    </span>
                    <span className="text-sm text-gray-500">{product.weight}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit/Add Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct?.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم بالعربية *</label>
                  <Input
                    value={editingProduct?.name_ar || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })}
                    placeholder="مثال: عسل السدر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Name in English *</label>
                  <Input
                    value={editingProduct?.name_en || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                    placeholder="Example: Sidr Honey"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوصف بالعربية</label>
                  <Textarea
                    value={editingProduct?.description_ar || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                    placeholder="وصف المنتج بالعربية"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description in English</label>
                  <Textarea
                    value={editingProduct?.description_en || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                    placeholder="Product description in English"
                    rows={3}
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">السعر (ريال) *</label>
                    <Input
                      type="number"
                      value={editingProduct?.price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      placeholder="35"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الوزن</label>
                    <Input
                      value={editingProduct?.weight || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                      placeholder="500g"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                  <Input
                    value={editingProduct?.image_url || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editingProduct?.available !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="available" className="text-sm font-medium">
                    متوفر للبيع
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-amber-500 hover:bg-amber-600"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
