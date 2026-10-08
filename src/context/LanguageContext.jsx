import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import en from '../translations/en';
import ar from '../translations/ar';

const LanguageContext = createContext();

const translations = { en, ar };

export function LanguageProvider({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [storedLang, setStoredLang] = useState(() => {
    return localStorage.getItem('voltech-lang') || 'en';
  });

  // In admin dashboard, always enforce English
  const effectiveLang = isAdmin ? 'en' : storedLang;
  const t = translations[effectiveLang] || en;
  const isArabic = effectiveLang === 'ar';

  const toggleLanguage = () => {
    if (isAdmin) return;
    setStoredLang(prev => {
      const next = prev === 'en' ? 'ar' : 'en';
      localStorage.setItem('voltech-lang', next);
      return next;
    });
  };

  useEffect(() => {
    if (isAdmin) {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    } else {
      document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', effectiveLang);
    }
  }, [effectiveLang, isArabic, isAdmin]);

  return (
    <LanguageContext.Provider value={{ lang: effectiveLang, t, toggleLanguage, isArabic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
