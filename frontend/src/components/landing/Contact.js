import React from 'react';
import { MessageCircle, Phone, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { siteContent } from '../../data/mock';

const Contact = () => {
  const { language } = useLanguage();
  const content = siteContent[language];
  
  const whatsappNumber = '96895555386';
  const whatsappMessage = language === 'ar' 
    ? 'مرحباً، أرغب في الاستفسار عن منتجات عسل أحمد 🍯'
    : 'Hello, I would like to inquire about Ahmad\'s honey products 🍯';
  
  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-white to-green-50" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{content.contact.title}</h2>
          <p className="section-subtitle">{content.contact.subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 animate-bounce">
                <MessageCircle className="w-12 h-12 text-green-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                {language === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contact Us via WhatsApp'}
              </h3>
              <p className="text-green-50 text-lg mb-8">
                {language === 'ar' 
                  ? 'راسلنا الآن للاستفسار عن منتجاتنا وطلباتك' 
                  : 'Message us now to inquire about our products and orders'}
              </p>
              
              <Button 
                onClick={openWhatsApp}
                size="lg"
                className="whatsapp-button text-xl px-12 py-6 h-auto"
              >
                <MessageCircle className="w-6 h-6 ml-3" />
                {language === 'ar' ? 'راسلنا على واتساب' : 'Message on WhatsApp'}
              </Button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 space-x-reverse p-6 bg-green-50 rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all">
                  <div className="flex-shrink-0 w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </h3>
                    <p className="text-gray-700 font-semibold text-lg" style={{ direction: 'ltr' }}>
                      +968 9555 5386
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse p-6 bg-amber-50 rounded-2xl border-2 border-amber-100 hover:border-amber-300 transition-all">
                  <div className="flex-shrink-0 w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      {language === 'ar' ? 'ساعات العمل' : 'Business Hours'}
                    </h3>
                    <p className="text-gray-700 font-medium">
                      {language === 'ar' ? 'السبت - الخميس' : 'Saturday - Thursday'}
                    </p>
                    <p className="text-gray-600">
                      {language === 'ar' ? '3:00م - 8:00م' : '3:00 PM - 8:00 PM'}
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      {language === 'ar' ? '(بعد المدرسة)' : '(After School)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 text-center">
                <p className="text-gray-700 text-lg">
                  {language === 'ar' 
                    ? '💬 نرد على جميع الرسائل خلال دقائق!' 
                    : '💬 We reply to all messages within minutes!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
