import { Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSection } from '@/context/SiteContentContext';

const Footer = () => {
  const { t } = useLanguage();
  const content = useSection('footer');

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-4">
            {t.brand}
          </div>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            {content.tagline}
            <Heart className="w-4 h-4 text-red-500" />
          </p>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p>
            {content.copyright} {new Date().getFullYear()}
          </p>
          <p>{content.school}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
