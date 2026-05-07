import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const MetadataContext = createContext(null);

export function MetadataProvider({ children }) {
  const [tagMap, setTagMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tagData, catData] = await Promise.all([
        api.getTags(),
        api.getCategories(),
      ]);

      const tList = tagData.tags || [];
      const cList = catData.categories || [];

      const tMap = {};
      tList.forEach((t) => { tMap[t.id] = t; });
      setTagMap(tMap);
      setTags(tList);

      const cMap = {};
      cList.forEach((c) => { cMap[c.id] = c; });
      setCategoryMap(cMap);
      setCategories(cList);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
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
      refresh: fetchAll, getTagName, getCategoryName,
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
