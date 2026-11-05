import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from './LanguageContext';

const SiteContentContext = createContext(null);

export const SiteContentProvider = ({ children }) => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/site-content')
      .then(({ data }) => active && setContent(data.content))
      .catch(() => active && setContent({}));
    return () => {
      active = false;
    };
  }, []);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
};

/** Localized content of one section (`{}` while loading or on error). */
export const useSection = (section) => {
  const content = useContext(SiteContentContext);
  const { language } = useLanguage();
  return useMemo(() => content?.[section]?.[language] || {}, [content, section, language]);
};
