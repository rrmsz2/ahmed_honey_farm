import React, { useState } from 'react';
import { Menu, X, Globe, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { getCartItemsCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartItemsCount();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3" style={{ direction: 'ltr' }}>
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'عسل أحمد' : "Ahmad's Honey"}
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            <button onClick={() => scrollToSection('home')} className="nav-link">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>
            <button onClick={() => scrollToSection('story')} className="nav-link">
              {language === 'ar' ? 'قصتنا' : 'Our Story'}
            </button>
            <button onClick={() => scrollToSection('products')} className="nav-link">
              {language === 'ar' ? 'منتجاتنا' : 'Products'}
            </button>
            <button onClick={() => scrollToSection('gallery')} className="nav-link">
              {language === 'ar' ? 'المعرض' : 'Gallery'}
            </button>
            <button onClick={() => scrollToSection('contact')} className="nav-link">
              {language === 'ar' ? 'تواصل معنا' : 'Contact'}
            </button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/checkout')}
              className="relative flex items-center gap-2 hover:bg-amber-50 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleLanguage}
              className="flex items-center gap-2 hover:bg-amber-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'EN' : 'عربي'}
            </Button>
          </nav>

          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            <nav className="flex flex-col space-y-3">
              <button onClick={() => scrollToSection('home')} className="nav-link-mobile">{content.nav.home}</button>
              <button onClick={() => scrollToSection('story')} className="nav-link-mobile">{content.nav.story}</button>
              <button onClick={() => scrollToSection('products')} className="nav-link-mobile">{content.nav.products}</button>
              <button onClick={() => scrollToSection('gallery')} className="nav-link-mobile">{content.nav.gallery}</button>
              <button onClick={() => scrollToSection('contact')} className="nav-link-mobile">{content.nav.contact}</button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleLanguage}
                className="flex items-center gap-2 justify-center"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'English' : 'عربي'}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
