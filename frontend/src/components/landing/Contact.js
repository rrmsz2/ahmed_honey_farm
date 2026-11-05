import { Clock, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useSection } from '@/context/SiteContentContext';
import { whatsappLink } from '@/lib/format';

const Contact = () => {
  const { t } = useLanguage();
  const content = useSection('contact');
  const link = whatsappLink(content.whatsapp || content.phone, content.whatsappMessage);

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-white to-green-50 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{content.title}</h2>
          <p className="section-subtitle">{content.subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6">
              <MessageCircle className="w-12 h-12 text-green-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">{t.contact.cardTitle}</h3>
            <p className="text-green-50 text-lg mb-8">{t.contact.cardText}</p>
            {link && (
              <Button asChild size="lg" className="whatsapp-button text-xl px-12 py-6 h-auto gap-3">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-6 h-6" />
                  {t.contact.button}
                </a>
              </Button>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.phone && (
                <div className="flex items-start gap-4 p-6 bg-green-50 rounded-2xl border-2 border-green-100">
                  <div className="shrink-0 w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900">{t.contact.phone}</h4>
                    <a href={`tel:${content.phone}`} className="text-gray-700 font-semibold text-lg" dir="ltr">
                      {content.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-2xl border-2 border-amber-100">
                <div className="shrink-0 w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900">{t.contact.hours}</h4>
                  <p className="text-gray-700 font-medium">{content.hoursDays}</p>
                  <p className="text-gray-600">{content.hoursTime}</p>
                  {content.hoursNote && <p className="text-sm text-amber-600 mt-1">{content.hoursNote}</p>}
                </div>
              </div>
            </div>

            <p className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 text-center text-gray-700 text-lg">
              {t.contact.reply}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
