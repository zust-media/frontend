const config = {
  api: {
    baseUrl: process.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.VITE_API_TIMEOUT || import.meta.env.VITE_API_TIMEOUT, 10) || 30000,
  },
  app: {
    name: process.env.VITE_APP_NAME || import.meta.env.VITE_APP_NAME || 'ZUST Media Workstation',
    defaultLanguage: process.env.VITE_DEFAULT_LANGUAGE || import.meta.env.VITE_DEFAULT_LANGUAGE || 'zh-CN',
    supportedLanguages: ['en', 'zh-CN'],
  },
};

export default config;