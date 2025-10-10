import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Gallery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [newImage, setNewImage] = useState({
    url: '',
    caption_ar: '',
    caption_en: '',
    order: 0
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/gallery`);
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المعرض',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImage.url || !newImage.caption_ar || !newImage.caption_en) {
      toast({
        title: 'خطأ',
        description: 'الرجاء ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing) {
        // Update existing image
        await axios.put(`${API}/admin/gallery/${editingImageId}`, newImage);
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الصورة بنجاح',
        });
      } else {
        // Add new image
        await axios.post(`${API}/admin/gallery`, newImage);
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة الصورة بنجاح',
        });
      }
      
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingImageId(null);
      setNewImage({ url: '', caption_ar: '', caption_en: '', order: 0 });
      fetchGallery();
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: 'خطأ',
        description: isEditing ? 'فشل في تحديث الصورة' : 'فشل في إضافة الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleEditImage = (image) => {
    setIsEditing(true);
    setEditingImageId(image.id);
    setNewImage({
      url: image.url,
      caption_ar: image.caption_ar,
      caption_en: image.caption_en,
      order: image.order
    });
    setIsDialogOpen(true);
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      await axios.delete(`${API}/admin/gallery/${imageId}`);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الصورة بنجاح',
      });
      fetchGallery();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الصورة',
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
              <h1 className="text-2xl font-bold text-gray-900">إدارة معرض الصور</h1>
            </div>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditingImageId(null);
                setNewImage({ url: '', caption_ar: '', caption_en: '', order: 0 });
                setIsDialogOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة صورة جديدة
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">جاري التحميل...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={`${image.url}?w=500&h=400&fit=crop`}
                    alt={image.caption_ar}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    الترتيب: {image.order}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">العربية:</p>
                    <p className="font-medium">{image.caption_ar}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">الإنجليزية:</p>
                    <p className="font-medium text-left" dir="ltr">{image.caption_en}</p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteImage(image.id)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة صورة جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">رابط الصورة</label>
              <Input
                value={newImage.url}
                onChange={(e) => setNewImage({...newImage, url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                يمكنك استخدام Unsplash أو Pexels للحصول على صور مجانية
              </p>
            </div>

            {newImage.url && (
              <div className="border rounded-lg p-2">
                <img 
                  src={newImage.url} 
                  alt="معاينة" 
                  className="w-full h-48 object-cover rounded"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+URL'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">الوصف بالعربية</label>
              <Input
                value={newImage.caption_ar}
                onChange={(e) => setNewImage({...newImage, caption_ar: e.target.value})}
                placeholder="أدخل وصف الصورة بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الوصف بالإنجليزية</label>
              <Input
                value={newImage.caption_en}
                onChange={(e) => setNewImage({...newImage, caption_en: e.target.value})}
                placeholder="Enter image description in English"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الترتيب</label>
              <Input
                type="number"
                value={newImage.order}
                onChange={(e) => setNewImage({...newImage, order: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                الصور ذات الأرقام الأقل تظهر أولاً
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddImage} className="flex-1">
                <Save className="w-4 h-4 ml-2" />
                حفظ الصورة
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
