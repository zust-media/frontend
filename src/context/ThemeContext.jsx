import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEMES, DEFAULT_THEME, STORAGE_KEY, isValidTheme } from '../config/themes';

const ThemeContext = createContext(null);

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidTheme(stored)) return stored;
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_THEME;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const initial = getStoredTheme();
    applyTheme(initial);
    return initial;
  });

  const setTheme = useCallback((newTheme) => {
    if (!isValidTheme(newTheme)) return;
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      /* localStorage full or unavailable */
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY && e.newValue && isValidTheme(e.newValue)) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
