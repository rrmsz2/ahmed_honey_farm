import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { strings } from '@/lib/i18n';

const STORAGE_KEY = 'language';
const LanguageContext = createContext(null);

const initialLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* storage unavailable */
  }
  return 'ar';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* storage unavailable */
    }
  }, [language]);

  const toggleLanguage = useCallback(() => setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar')), []);

  const value = useMemo(
    () => ({
      language,
      isArabic: language === 'ar',
      dir: language === 'ar' ? 'rtl' : 'ltr',
      t: strings[language],
      toggleLanguage,
      /** Pick the localized field of an API object, e.g. pick(product, 'name') → name_ar / name_en. */
      pick: (obj, field) => obj?.[`${field}_${language}`] ?? obj?.[`${field}_ar`] ?? '',
    }),
    [language, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
