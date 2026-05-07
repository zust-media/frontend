import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppConfigContext = createContext(null);

const defaultConfig = {
  maxFileSizeMB: 20,
  maxFileSizeBytes: 20 * 1024 * 1024,
  maxBatchCount: 20,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
};

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConfig()
      .then((data) => setConfig(data))
      .catch(() => setConfig(defaultConfig))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext) || defaultConfig;
}
