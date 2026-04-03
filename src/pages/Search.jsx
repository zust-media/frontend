import { useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/searchService';
import { categoryService } from '../services/categoryService';
import { tagService } from '../services/tagService';
import ImageGrid from '../components/ImageGrid';
import { useTranslation } from 'react-i18next';

function Search() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  const fetchFilters = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        categoryService.getCategories(),
        tagService.getTags(),
      ]);
      setCategories(catRes.data.data || catRes.data);
      setTags(tagRes.data.data || tagRes.data);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  };

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedTags.length > 0) params.tagIds = selectedTags.join(',');

      const response = await searchService.searchImages(params);
      const data = response.data.data || response.data;
      setResults(data.images || data);
      setResultCount(data.total || data.length || 0);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedTags]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery || selectedCategory || selectedTags.length > 0) {
        performSearch();
      } else {
        setResults([]);
        setResultCount(0);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, selectedTags, performSearch]);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('search.title')}</h1>

      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={t('search.placeholder')}
              className="input input-bordered flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary" onClick={performSearch}>
              {t('common.buttons.submit')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg">{t('search.filters.title')}</h3>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('search.filters.category')}</span>
              </label>
              <select
                className="select select-bordered"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">{t('common.labels.all')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('search.filters.tag')}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    <span className="ml-1 text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              {t('search.filters.clearAll')}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg">
              {t('common.labels.total')} <span className="font-bold">{resultCount}</span> {t('images.title').toLowerCase()}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <ImageGrid
              images={results}
              emptyMessage={
                searchQuery || selectedCategory || selectedTags.length > 0
                  ? t('search.results.noResults')
                  : t('search.placeholder')
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;