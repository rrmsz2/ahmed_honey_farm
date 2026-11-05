import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Menu, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { scrollToSection } from '@/lib/format';

const SECTIONS = ['home', 'story', 'products', 'gallery', 'contact'];

const CartButton = ({ count, label, onClick }) => (
  <Button variant="outline" size="sm" onClick={onClick} className="relative hover:bg-amber-50" aria-label={label}>
    <ShoppingCart className="w-4 h-4" />
    {count > 0 && (
      <span className="absolute -top-2 -end-2 bg-amber-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold">
        {count}
      </span>
    )}
  </Button>
);

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, toggleLanguage } = useLanguage();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goTo = (id) => {
    setMenuOpen(false);
    if (pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      scrollToSection(id);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 bg-white/95 backdrop-blur-md shadow-sm z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent"
          >
            🍯 {t.brand}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {SECTIONS.map((id) => (
              <button key={id} type="button" onClick={() => goTo(id)} className="nav-link">
                {t.nav[id]}
              </button>
            ))}
            <CartButton count={count} label={t.cart} onClick={() => navigate('/checkout')} />
            <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2 hover:bg-amber-50">
              <Globe className="w-4 h-4" />
              {t.switchLanguage}
            </Button>
          </nav>

          <div className="flex md:hidden items-center gap-2">
            <CartButton count={count} label={t.cart} onClick={() => navigate('/checkout')} />
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t flex flex-col gap-1">
            {SECTIONS.map((id) => (
              <button key={id} type="button" onClick={() => goTo(id)} className="nav-link-mobile text-start">
                {t.nav[id]}
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2 mt-2">
              <Globe className="w-4 h-4" />
              {t.switchLanguage}
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
