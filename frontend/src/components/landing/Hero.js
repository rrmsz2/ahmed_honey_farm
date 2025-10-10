import React, { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const heroImage = 'https://images.unsplash.com/photo-1590334280735-e8121293dbf6';

const Hero = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState({
    title: '',
    subtitle: '',
    description: '',
    cta: '',
    learnMore: ''
  });

  useEffect(() => {
    fetchContent();
  }, [language]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/site-content`);
      const heroContent = response.data.content.hero;
      if (heroContent) {
        setContent(heroContent[language] || {});
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
      // Fallback content
      setContent({
        title: language === 'ar' ? 'عسل أحمد الطبيعي' : "Ahmad's Natural Honey",
        subtitle: language === 'ar' ? 'رحلة طالب في الصف الخامس نحو عالم النحل' : "A 5th Grader's Journey",
        description: language === 'ar' ? 'من مدرسة زيد بن ثابت الابتدائية إلى منحل حقيقي' : 'From school to a real apiary',
        cta: language === 'ar' ? 'اطلب الآن' : 'Order Now',
        learnMore: language === 'ar' ? 'اعرف قصتي' : 'Learn My Story'
      });
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage}?w=1920&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="hero-title mb-6 animate-fade-in">
            {content.title}
          </h1>
          
          <p className="hero-subtitle mb-4 animate-fade-in-delay-1">
            {content.subtitle}
          </p>
          
          <p className="hero-description mb-10 animate-fade-in-delay-2">
            {content.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-3">
            <Button 
              size="lg" 
              onClick={() => scrollToSection('contact')}
              className="cta-button group"
            >
              {content.cta}
              <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollToSection('story')}
              className="border-white text-white hover:bg-white hover:text-gray-900 transition-all"
            >
              {content.hero.learnMore}
            </Button>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-8 h-8 text-white opacity-70" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
