const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 30000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'ZUST Media Workstation',
    defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'zh-CN',
    supportedLanguages: ['en', 'zh-CN'],
  },
};

export default config;