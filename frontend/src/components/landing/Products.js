import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { useLanguage } from '../../context/LanguageContext';
import { siteContent, productImages } from '../../data/mock';
import { useToast } from '../../hooks/use-toast';

const Products = () => {
  const { language } = useLanguage();
  const content = siteContent[language];
  const { toast } = useToast();

  const handleAddToCart = (productName) => {
    toast({
      title: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to Cart',
      description: language === 'ar' 
        ? `تم إضافة ${productName} للسلة بنجاح`
        : `${productName} has been added to your cart`,
    });
  };

  return (
    <section id="products" className="py-24 bg-white" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{content.products.title}</h2>
          <p className="section-subtitle">{content.products.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.products.items.map((product, index) => (
            <Card 
              key={product.id} 
              className="product-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg h-64">
                  <img 
                    src={`${productImages[index]}?w=400&h=300&fit=crop&q=80`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.weight}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="text-2xl font-bold text-amber-600">{product.price}</div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full cta-button group"
                  onClick={() => handleAddToCart(product.name)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
