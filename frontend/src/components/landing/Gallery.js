import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { imageUrl } from '@/lib/format';

const INITIAL_COUNT = 9;

const Gallery = () => {
  const { t, pick } = useLanguage();
  const [images, setImages] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api
      .get('/gallery')
      .then(({ data }) => setImages(data.images))
      .catch(() => setImages([]));
  }, []);

  if (images?.length === 0) return null;
  const visible = showAll ? images : images?.slice(0, INITIAL_COUNT);

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-white to-amber-50 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{t.gallery.title}</h2>
          <p className="section-subtitle">{t.gallery.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {images === null && [0, 1, 2].map((i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
          {visible?.map((image) => (
            <button
              key={image.id}
              type="button"
              className="gallery-item group relative overflow-hidden rounded-lg shadow-lg aspect-square"
              onClick={() => setSelected(image)}
            >
              <img
                src={imageUrl(image.url, { w: 600, h: 600 })}
                alt={pick(image, 'caption')}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute inset-x-0 bottom-0 p-4 text-white text-sm font-medium bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {pick(image, 'caption')}
              </span>
            </button>
          ))}
        </div>

        {images?.length > INITIAL_COUNT && (
          <div className="text-center mt-12">
            <Button onClick={() => setShowAll((v) => !v)} className="bg-amber-600 hover:bg-amber-700 text-white px-8">
              {showAll ? t.gallery.less : t.gallery.more}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-5xl bg-black/95 border-none p-4">
          <DialogTitle className="sr-only">{selected && pick(selected, 'caption')}</DialogTitle>
          {selected && (
            <figure>
              <img
                src={imageUrl(selected.url, { w: 1600, q: 90 })}
                alt={pick(selected, 'caption')}
                className="w-full max-h-[80vh] object-contain"
              />
              <figcaption className="text-white text-center mt-4 text-lg">{pick(selected, 'caption')}</figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
