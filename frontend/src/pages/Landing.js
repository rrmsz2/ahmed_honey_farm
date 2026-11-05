import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';
import Gallery from '@/components/landing/Gallery';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Products from '@/components/landing/Products';
import Story from '@/components/landing/Story';
import { scrollToSection } from '@/lib/format';

const Landing = () => {
  const { state } = useLocation();

  useEffect(() => {
    if (state?.scrollTo) setTimeout(() => scrollToSection(state.scrollTo), 50);
  }, [state]);

  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />
        <Story />
        <Products />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
