import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Story = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState({
    title: '',
    subtitle: '',
    content: '',
    stats: []
  });

  useEffect(() => {
    fetchContent();
  }, [language]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/site-content`);
      const storyContent = response.data.content.story;
      if (storyContent) {
        const data = storyContent[language] || {};
        setContent({
          title: data.title || '',
          subtitle: data.subtitle || '',
          content: data.content || '',
          stats: data.stats || [
            { number: '50+', label: language === 'ar' ? 'خلية نحل نشطة' : 'Active Beehives' },
            { number: '100%', label: language === 'ar' ? 'عسل طبيعي نقي' : 'Pure Natural Honey' },
            { number: '2024', label: language === 'ar' ? 'بداية الإنتاج' : 'Production Start' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching story content:', error);
      // Fallback
      setContent({
        title: language === 'ar' ? 'قصة أحمد' : "Ahmad's Story",
        subtitle: language === 'ar' ? 'حلم صغير أصبح حقيقة' : 'A Small Dream',
        content: language === 'ar' ? 'أنا أحمد...' : "I'm Ahmad...",
        stats: [
          { number: '50+', label: language === 'ar' ? 'خلية نحل نشطة' : 'Active Beehives' },
          { number: '100%', label: language === 'ar' ? 'عسل طبيعي نقي' : 'Pure Natural Honey' },
          { number: '2024', label: language === 'ar' ? 'بداية الإنتاج' : 'Production Start' }
        ]
      });
    }
  };

  return (
    <section id="story" className="py-24 bg-gradient-to-b from-amber-50 to-white" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">{content.story.title}</h2>
            <p className="section-subtitle">{content.story.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 transform hover:scale-[1.02] transition-transform duration-300">
            <p className="text-lg leading-relaxed text-gray-700">
              {content.story.content}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.stats.map((stat, index) => (
              <div 
                key={index}
                className="stat-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="stat-number group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="stat-label">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
