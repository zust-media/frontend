import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import LocalStorageBackend from 'i18next-localstorage-backend';

import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';
import { DEFAULT_LANGUAGE, LANGUAGE_KEY } from './constants';

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN }
};

i18n
  .use(LanguageDetector)
  .use(LocalStorageBackend)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    backend: {
      storageKey: LANGUAGE_KEY
    }
  });

export default i18n;