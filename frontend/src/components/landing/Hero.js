import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSection } from '@/context/SiteContentContext';
import { imageUrl, scrollToSection } from '@/lib/format';

const Hero = () => {
  const content = useSection('hero');

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-amber-900 bg-cover bg-center"
        style={content.image ? { backgroundImage: `url("${imageUrl(content.image, { w: 1920 })}")` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl mx-auto text-center min-h-[16rem]">
          <h1 className="hero-title mb-6 animate-fade-in">{content.title}</h1>
          <p className="hero-subtitle mb-4 animate-fade-in-delay-1">{content.subtitle}</p>
          <p className="hero-description mb-10 animate-fade-in-delay-2">{content.description}</p>

          {content.cta && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-3">
              <Button size="lg" onClick={() => scrollToSection('products')} className="cta-button">
                {content.cta}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('story')}
                className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
              >
                {content.learnMore}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ArrowDown className="absolute bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 text-white/70 animate-bounce" />
    </section>
  );
};

export default Hero;
