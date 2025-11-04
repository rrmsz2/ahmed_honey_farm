import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import api from '../../utils/axios';

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المنتجات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct.id) {
        // Update existing product
        await axios.put(`${API}/admin/products/${editingProduct.id}`, editingProduct);
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث المنتج بنجاح',
        });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المنتج',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await axios.delete(`${API}/admin/products/${productId}`);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المنتج بنجاح',
      });
      fetchProducts();
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">جاري التحميل...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`${product.image_url}?w=400&h=300&fit=crop`}
                    alt={product.name_ar}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
                    product.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {product.available ? 'متوفر' : 'غير متوفر'}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-2">{product.name_ar}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description_ar}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-amber-600">{product.price} ريال</span>
                    <span className="text-sm text-gray-500">{product.weight}</span>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم بالعربية</label>
                  <Input
                    value={editingProduct.name_ar}
                    onChange={(e) => setEditingProduct({...editingProduct, name_ar: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم بالإنجليزية</label>
                  <Input
                    value={editingProduct.name_en}
                    onChange={(e) => setEditingProduct({...editingProduct, name_en: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الوصف بالعربية</label>
                <Textarea
                  value={editingProduct.description_ar}
                  onChange={(e) => setEditingProduct({...editingProduct, description_ar: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الوصف بالإنجليزية</label>
                <Textarea
                  value={editingProduct.description_en}
                  onChange={(e) => setEditingProduct({...editingProduct, description_en: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">السعر (ريال)</label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الوزن</label>
                  <Input
                    value={editingProduct.weight}
                    onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                <Input
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct.available}
                  onChange={(e) => setEditingProduct({...editingProduct, available: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">متوفر للبيع</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
