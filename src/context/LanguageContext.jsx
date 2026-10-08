import { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en';
import ar from '../translations/ar';

const LanguageContext = createContext();

const translations = { en, ar };

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('voltech-lang') || 'en';
  });

  const t = translations[lang] || en;

  const toggleLanguage = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'ar' : 'en';
      localStorage.setItem('voltech-lang', next);
      return next;
    });
  };

  const isArabic = lang === 'ar';

  useEffect(() => {
    document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang, isArabic]);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, isArabic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
