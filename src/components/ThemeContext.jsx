import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Helper: detectează tema sistemului (light/dark)
const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  // themeMode: 'auto' | 'light' | 'dark' (ce alege userul)
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'auto';

    // Nou: salvăm explicit modul (auto/light/dark)
    const savedMode = localStorage.getItem('app-theme-mode');
    if (savedMode === 'auto' || savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }

    // Compatibilitate cu vechiul `app-theme` (doar light/dark)
    const legacyTheme = localStorage.getItem('app-theme');
    if (legacyTheme === 'light' || legacyTheme === 'dark') {
      return legacyTheme;
    }

    // Implicit: AUTO (folosește sistemul)
    return 'auto';
  });

  // Tema efectivă aplicată (light/dark), derivată din themeMode + sistem
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    if (themeMode === 'auto') {
      return getSystemTheme();
    }
    return themeMode;
  });

  // Aplică tema la document și salvează modul ales
  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('app-theme-mode', themeMode);

    const appliedTheme = themeMode === 'auto' ? getSystemTheme() : themeMode;
    setEffectiveTheme(appliedTheme);

    if (appliedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Ascultă schimbarea temei de sistem DOAR când suntem în modul AUTO
  useEffect(() => {
    if (typeof window === 'undefined' || themeMode !== 'auto' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const newTheme = media.matches ? 'dark' : 'light';
      setEffectiveTheme(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Setează imediat la mount
    handleChange();

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Păstrăm toggleTheme pentru compatibilitate (doar light/dark)
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveTheme,   // light/dark efectiv
        themeMode,               // auto/light/dark ales
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};