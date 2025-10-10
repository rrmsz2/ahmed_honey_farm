import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { siteContent } from '../../data/mock';

const Footer = () => {
  const { language } = useLanguage();
  const content = siteContent[language];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-4">
              {language === 'ar' ? 'عسل أحمد' : "Ahmad's Honey"}
            </div>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              {content.footer.tagline}
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            </p>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                {content.footer.copyright}
              </p>
              <p className="text-gray-400 text-sm">
                {content.footer.school}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
