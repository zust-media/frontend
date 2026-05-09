import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

const MetadataContext = createContext(null);

const POLL_INTERVAL = 30000;

export function MetadataProvider({ children }) {
  const [tagMap, setTagMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const pollingRef = useRef(true);

  const updateState = useCallback((tList, cList) => {
    const tMap = {};
    tList.forEach((t) => { tMap[t.id] = t; });
    setTagMap(tMap);
    setTags(tList);

    const cMap = {};
    cList.forEach((c) => { cMap[c.id] = c; });
    setCategoryMap(cMap);
    setCategories(cList);
  }, []);

  const fetchAll = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [tagData, catData] = await Promise.all([
        api.getTags(),
        api.getCategories(),
      ]);
      updateState(tagData.tags || [], catData.categories || []);
    } catch {
      // ignore
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [updateState]);

  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!pollingRef.current) return;
      intervalRef.current = setInterval(() => fetchAll(false), POLL_INTERVAL);
    };

    const handleVisibility = () => {
      pollingRef.current = !document.hidden;
      if (document.hidden) {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      } else {
        fetchAll(false);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchAll]);

  const getTagName = useCallback((id) => {
    return tagMap[id]?.name || `#${id}`;
  }, [tagMap]);

  const getCategoryName = useCallback((id) => {
    return categoryMap[id]?.name || '未分类';
  }, [categoryMap]);

  return (
    <MetadataContext.Provider value={{
      tagMap, categoryMap, tags, categories, loading,
      refresh: () => fetchAll(true), getTagName, getCategoryName,
    }}>
      {children}
    </MetadataContext.Provider>
  );
}

export function useMetadata() {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within MetadataProvider');
  }
  return context;
}
