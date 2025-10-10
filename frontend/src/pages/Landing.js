import React from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import Story from '../components/landing/Story';
import Products from '../components/landing/Products';
import Gallery from '../components/landing/Gallery';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <Story />
      <Products />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
};

export default Landing;
