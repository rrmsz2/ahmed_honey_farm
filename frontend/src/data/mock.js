// Mock data for Ahmad Honey Farm Landing Page

export const siteContent = {
  ar: {
    nav: {
      home: 'الرئيسية',
      story: 'قصتنا',
      products: 'منتجاتنا',
      gallery: 'المعرض',
      contact: 'تواصل معنا'
    },
    hero: {
      title: 'عسل أحمد الطبيعي',
      subtitle: 'رحلة طالب في الصف الخامس نحو عالم النحل',
      description: 'من مدرسة زيد بن ثابت الابتدائية إلى منحل حقيقي ينتج أجود أنواع العسل الطبيعي',
      cta: 'اطلب الآن',
      learnMore: 'اعرف قصتي'
    },
    story: {
      title: 'قصة أحمد',
      subtitle: 'حلم صغير أصبح حقيقة',
      content: 'أنا أحمد، طالب في الصف الخامس الابتدائي بمدرسة زيد بن ثابت. منذ صغري وأنا مفتون بعالم النحل وكيف ينتج العسل. قررت أن أحول شغفي إلى مشروع حقيقي، وبدأت في تربية النحل وإنتاج العسل الطبيعي النقي. كل قطرة عسل تخرج من منحلي هي نتاج تفاني واهتمام وحب لهذا العالم الرائع.',
      stats: [
        { number: '50+', label: 'خلية نحل نشطة' },
        { number: '100%', label: 'عسل طبيعي نقي' },
        { number: '2024', label: 'بداية الإنتاج' }
      ]
    },
    products: {
      title: 'منتجاتنا',
      subtitle: 'عسل طبيعي 100% من المنحل مباشرة',
      items: [
        {
          id: 1,
          name: 'عسل الزهور البرية',
          description: 'عسل طبيعي من رحيق الزهور البرية، غني بالفيتامينات والمعادن',
          price: '120 ريال',
          weight: '1 كيلو'
        },
        {
          id: 2,
          name: 'عسل السدر',
          description: 'عسل السدر الفاخر، من أجود أنواع العسل العلاجية',
          price: '200 ريال',
          weight: '1 كيلو'
        },
        {
          id: 3,
          name: 'عسل الحمضيات',
          description: 'عسل بنكهة الحمضيات المنعشة، مثالي لتعزيز المناعة',
          price: '150 ريال',
          weight: '1 كيلو'
        }
      ]
    },
    gallery: {
      title: 'معرض الصور',
      subtitle: 'رحلة العسل من الخلية إلى منزلك'
    },
    contact: {
      title: 'تواصل معنا',
      subtitle: 'نسعد بطلباتكم واستفساراتكم',
      form: {
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        message: 'الرسالة',
        submit: 'إرسال',
        namePlaceholder: 'أدخل اسمك',
        emailPlaceholder: 'example@email.com',
        phonePlaceholder: '05xxxxxxxx',
        messagePlaceholder: 'اكتب رسالتك هنا...'
      }
    },
    footer: {
      tagline: 'عسل طبيعي من القلب',
      copyright: '© 2024 منحل أحمد. جميع الحقوق محفوظة.',
      school: 'مدرسة زيد بن ثابت الابتدائية'
    }
  },
  en: {
    nav: {
      home: 'Home',
      story: 'Our Story',
      products: 'Products',
      gallery: 'Gallery',
      contact: 'Contact'
    },
    hero: {
      title: "Ahmad's Natural Honey",
      subtitle: "A 5th Grader's Journey into the World of Bees",
      description: 'From Zaid Bin Thabit Elementary School to a real apiary producing the finest natural honey',
      cta: 'Order Now',
      learnMore: 'Learn My Story'
    },
    story: {
      title: "Ahmad's Story",
      subtitle: 'A Small Dream That Became Reality',
      content: "I'm Ahmad, a 5th-grade student at Zaid Bin Thabit Elementary School. Since I was young, I've been fascinated by the world of bees and how they produce honey. I decided to turn my passion into a real project and started beekeeping and producing pure natural honey. Every drop of honey from my apiary is the result of dedication, care, and love for this amazing world.",
      stats: [
        { number: '50+', label: 'Active Beehives' },
        { number: '100%', label: 'Pure Natural Honey' },
        { number: '2024', label: 'Production Start' }
      ]
    },
    products: {
      title: 'Our Products',
      subtitle: '100% Natural Honey Straight from the Apiary',
      items: [
        {
          id: 1,
          name: 'Wildflower Honey',
          description: 'Natural honey from wild flower nectar, rich in vitamins and minerals',
          price: 'SAR 120',
          weight: '1 kg'
        },
        {
          id: 2,
          name: 'Sidr Honey',
          description: 'Premium Sidr honey, one of the finest therapeutic honey varieties',
          price: 'SAR 200',
          weight: '1 kg'
        },
        {
          id: 3,
          name: 'Citrus Honey',
          description: 'Honey with refreshing citrus flavor, perfect for boosting immunity',
          price: 'SAR 150',
          weight: '1 kg'
        }
      ]
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'The Journey of Honey from Hive to Home'
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'We welcome your orders and inquiries',
      form: {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        message: 'Message',
        submit: 'Send',
        namePlaceholder: 'Enter your name',
        emailPlaceholder: 'example@email.com',
        phonePlaceholder: '05xxxxxxxx',
        messagePlaceholder: 'Write your message here...'
      }
    },
    footer: {
      tagline: 'Natural Honey from the Heart',
      copyright: '© 2024 Ahmad Apiary. All rights reserved.',
      school: 'Zaid Bin Thabit Elementary School'
    }
  }
};

export const heroImage = 'https://images.unsplash.com/photo-1590334280735-e8121293dbf6';

export const productImages = [
  'https://images.unsplash.com/photo-1645549826194-1956802d83c2',
  'https://images.unsplash.com/photo-1720765491527-2f57eaefdcbb',
  'https://images.pexels.com/photos/18231108/pexels-photo-18231108.jpeg'
];

export const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1751482820009-7e8a0cd07719', captionAr: 'خلايا النحل في المنحل', captionEn: 'Beehives at the Apiary' },
  { url: 'https://images.unsplash.com/photo-1634525979433-6533e5d64812', captionAr: 'النحل يجمع الرحيق', captionEn: 'Bees Collecting Nectar' },
  { url: 'https://images.pexels.com/photos/5247995/pexels-photo-5247995.jpeg', captionAr: 'العمل في المنحل', captionEn: 'Working at the Apiary' },
  { url: 'https://images.unsplash.com/photo-1697197897016-f9abb34cfeea', captionAr: 'عملية التلقيح', captionEn: 'Pollination Process' },
  { url: 'https://images.unsplash.com/photo-1758522965567-02aaa48cd510', captionAr: 'أحمد يفحص الخلايا', captionEn: 'Ahmad Inspecting Hives' },
  { url: 'https://images.unsplash.com/photo-1758522964581-a60c3e87a44e', captionAr: 'تسجيل بيانات الإنتاج', captionEn: 'Recording Production Data' }
];
