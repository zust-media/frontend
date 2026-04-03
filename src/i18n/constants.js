import config from '../config';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' }
];

export const DEFAULT_LANGUAGE = config.app.defaultLanguage;

export const LANGUAGE_KEY = 'i18nextLng';

export const LANGUAGE_STORAGE_KEY = 'language';