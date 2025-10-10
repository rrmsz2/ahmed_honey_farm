import React from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { siteContent, heroImage } from '../../data/mock';

const Hero = () => {
  const { language } = useLanguage();
  const content = siteContent[language];

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
            {content.hero.title}
          </h1>
          
          <p className="hero-subtitle mb-4 animate-fade-in-delay-1">
            {content.hero.subtitle}
          </p>
          
          <p className="hero-description mb-10 animate-fade-in-delay-2">
            {content.hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-3">
            <Button 
              size="lg" 
              onClick={() => scrollToSection('contact')}
              className="cta-button group"
            >
              {content.hero.cta}
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
