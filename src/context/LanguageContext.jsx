import { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_KEY } from '../i18n/constants';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE
  );

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem(LANGUAGE_KEY, langCode);
    setCurrentLanguage(langCode);
  };

  useEffect(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY);
    if (storedLang && storedLang !== currentLanguage) {
      setCurrentLanguage(storedLang);
      i18n.changeLanguage(storedLang);
    }
  }, []);

  const value = {
    currentLanguage,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}