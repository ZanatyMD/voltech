import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [storedTheme, setStoredTheme] = useState(() => {
    return localStorage.getItem('voltech-theme') || 'dark';
  });

  // Admin dashboard stays in dark mode
  const effectiveTheme = isAdmin ? 'dark' : storedTheme;

  const toggleTheme = () => {
    if (isAdmin) return;
    setStoredTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('voltech-theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, toggleTheme, isDark: effectiveTheme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
