import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { formatMoney, imageUrl } from '@/lib/format';

const Products = () => {
  const { t, language, pick } = useLanguage();
  const { addItem } = useCart();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    api
      .get('/products')
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, []);

  const handleAdd = (product) => {
    addItem(product);
    toast.success(t.products.added, { description: pick(product, 'name') });
  };

  return (
    <section id="products" className="py-24 bg-white scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{t.products.title}</h2>
          <p className="section-subtitle">{t.products.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products === null &&
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-[28rem] rounded-xl" />)}

          {products?.map((product) => (
            <Card key={product.id} className="product-card group overflow-hidden flex flex-col">
              <div className="relative overflow-hidden h-64">
                <img
                  src={imageUrl(product.image_url, { w: 600, h: 450 })}
                  alt={pick(product, 'name')}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {product.weight && (
                  <span className="absolute top-4 end-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.weight}
                  </span>
                )}
              </div>
              <CardContent className="p-6 flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{pick(product, 'name')}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{pick(product, 'description')}</p>
                <div className="text-2xl font-bold text-amber-600">{formatMoney(product.price, language)}</div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full cta-button gap-2" onClick={() => handleAdd(product)}>
                  <ShoppingCart className="w-4 h-4" />
                  {t.products.add}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {products?.length === 0 && <p className="text-center text-gray-500">{t.products.empty}</p>}
      </div>
    </section>
  );
};

export default Products;
