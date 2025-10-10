import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Gallery = () => {
  const { language } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/gallery`);
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedImages = showAll ? images : images.slice(0, 10);

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-white to-amber-50" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            {language === 'ar' ? 'معرض الصور' : 'Gallery'}
          </h2>
          <p className="section-subtitle">
            {language === 'ar' ? 'استكشف مجموعة من الصور الجميلة' : 'Explore our beautiful collection of images'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <p className="mt-4 text-gray-600">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {displayedImages.map((image, index) => (
            <div 
              key={index}
              className="gallery-item group cursor-pointer"
              onClick={() => setSelectedImage(image)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-square">
                <img 
                  src={`${image.url}?w=500&h=500&fit=crop&q=80`}
                  alt={language === 'ar' ? image.captionAr : image.captionEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-sm font-medium">
                      {language === 'ar' ? image.captionAr : image.captionEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="max-w-5xl max-h-[90vh] overflow-hidden">
              <img 
                src={`${selectedImage.url}?w=1200&q=90`}
                alt={language === 'ar' ? selectedImage.captionAr : selectedImage.captionEn}
                className="w-full h-full object-contain"
              />
              <p className="text-white text-center mt-4 text-lg">
                {language === 'ar' ? selectedImage.captionAr : selectedImage.captionEn}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
