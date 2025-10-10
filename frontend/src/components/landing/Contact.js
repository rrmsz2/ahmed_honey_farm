import React, { useState } from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '../../context/LanguageContext';
import { siteContent } from '../../data/mock';
import { useToast } from '../../hooks/use-toast';

const Contact = () => {
  const { language } = useLanguage();
  const content = siteContent[language];
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    toast({
      title: language === 'ar' ? 'تم إرسال الرسالة!' : 'Message Sent!',
      description: language === 'ar' 
        ? 'شكراً لتواصلك معنا. سنرد عليك قريباً.' 
        : 'Thank you for contacting us. We will reply soon.',
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  return (
    <section id="contact" className="py-24 bg-white" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{content.contact.title}</h2>
          <p className="section-subtitle">{content.contact.subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </h3>
                  <p className="text-gray-600">ahmad.honey@example.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </h3>
                  <p className="text-gray-600" style={{ direction: 'ltr' }}>+966 5X XXX XXXX</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                <h3 className="font-bold text-xl mb-3 text-amber-900">
                  {language === 'ar' ? 'ساعات العمل' : 'Business Hours'}
                </h3>
                <p className="text-gray-700 mb-2">
                  {language === 'ar' ? 'السبت - الخميس: 3:00م - 8:00م' : 'Saturday - Thursday: 3:00 PM - 8:00 PM'}
                </p>
                <p className="text-gray-700">
                  {language === 'ar' ? '(بعد المدرسة)' : '(After School)'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {content.contact.form.name}
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={content.contact.form.namePlaceholder}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {content.contact.form.email}
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={content.contact.form.emailPlaceholder}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {content.contact.form.phone}
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={content.contact.form.phonePlaceholder}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {content.contact.form.message}
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={content.contact.form.messagePlaceholder}
                    required
                    rows={4}
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="w-full cta-button group">
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  {content.contact.form.submit}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
