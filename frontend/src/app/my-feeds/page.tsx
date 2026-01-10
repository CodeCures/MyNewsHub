'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useArticlesStore, usePreferencesStore } from '@/store';
import httpClient from '@/lib/httpClient';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';
import Select from 'react-select';

interface SelectOption {
  value: number | string;
  label: string;
}

export default function MyFeeds() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { personalizedFeed, personalizedPaginationData, isLoading, error, personalizedMessage, fetchPersonalizedFeed } = useArticlesStore();
  const { preferences, fetchPreferences } = usePreferencesStore();
  const [page, setPage] = useState(1);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Options from user preferences
  const [sources, setSources] = useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [authors, setAuthors] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Load filter options from user preferences
  useEffect(() => {
    if (preferences) {
      loadFilterOptions();
    }
  }, [preferences]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Fetch articles when filters change
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPersonalizedFeedWithFilters(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, selectedSource, selectedCategory, selectedAuthor, isAuthenticated]);

  const loadFilterOptions = async () => {
    if (!preferences) return;

    // Load sources
    if (preferences.preferred_sources?.length > 0) {
      try {
        const response = await httpClient.get('/admin/sources');
        const allSources = response.data.data || [];
        const userSources = allSources.filter((src: any) => 
          preferences.preferred_sources.includes(src.id)
        );
        setSources(userSources);
      } catch (err) {
        console.error('Failed to fetch sources', err);
      }
    }

    // Load categories
    if (preferences.preferred_categories?.length > 0) {
      try {
        const response = await httpClient.get('/categories');
        const allCategories = response.data.data || [];
        const userCategories = allCategories.filter((cat: any) => 
          preferences.preferred_categories.includes(cat.id)
        );
        setCategories(userCategories);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    }

    // Set authors from preferences
    if (preferences.preferred_authors?.length > 0) {
      setAuthors(preferences.preferred_authors);
    }
  };

  const fetchPersonalizedFeedWithFilters = async (currentPage: number) => {
    const filters: any = { page: currentPage };
    if (debouncedSearch) filters.search = debouncedSearch;
    if (selectedSource) {
      const source = sources.find(s => s.id === selectedSource);
      if (source) filters.source = source.id;
    }
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) filters.category = category.id;
    }
    if (selectedAuthor) filters.author = selectedAuthor;
    
    await fetchPersonalizedFeed(currentPage, filters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sourceOptions: SelectOption[] = sources.map(src => ({
    value: src.id,
    label: src.name,
  }));

  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  const authorOptions: SelectOption[] = authors.map(author => ({
    value: author,
    label: author,
  }));

  const handleClearFilters = () => {
    setSearch('');
    setSelectedSource(null);
    setSelectedCategory(null);
    setSelectedAuthor(null);
    setPage(1);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={() => fetchPersonalizedFeed(page)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Personalized Feed</h1>
        <p className="text-gray-600">Articles tailored to your preferences and interests</p>
      </div>

      {/* Filters - Always visible except when showing "No Preferences Set" */}
      {personalizedMessage !== 'no preferences' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            
            <Select
              options={sourceOptions}
              value={sourceOptions.find(opt => opt.value === selectedSource) || null}
              onChange={(selected) => {
                setSelectedSource(selected ? selected.value as number : null);
                setPage(1);
              }}
              placeholder="Filter by source..."
              className="text-gray-900"
              classNamePrefix="select"
              isClearable
              isSearchable
            />

            <Select
              options={categoryOptions}
              value={categoryOptions.find(opt => opt.value === selectedCategory) || null}
              onChange={(selected) => {
                setSelectedCategory(selected ? selected.value as number : null);
                setPage(1);
              }}
              placeholder="Filter by category..."
              className="text-gray-900"
              classNamePrefix="select"
              isClearable
              isSearchable
            />

            <Select
              options={authorOptions}
              value={authorOptions.find(opt => opt.value === selectedAuthor) || null}
              onChange={(selected) => {
                setSelectedAuthor(selected ? selected.value as string : null);
                setPage(1);
              }}
              placeholder="Filter by author..."
              className="text-gray-900"
              classNamePrefix="select"
              isClearable
              isSearchable
            />
          </div>
          
          {(search || selectedSource || selectedCategory || selectedAuthor) && (
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : personalizedFeed.length === 0 ? (
        personalizedMessage === 'no preferences' ? (
          <EmptyState
            title="No Preferences Set"
            message="Set your preferences to get personalized news recommendations."
            actionLabel="Set Preferences"
            onAction={() => router.push('/preferences')}
          />
        ) : (
          <EmptyState
            title="No Articles Found"
            message={search || selectedSource || selectedCategory || selectedAuthor 
              ? "No articles match your current filters. Try adjusting your search criteria." 
              : "No articles available for your preferences at the moment."}
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedFeed.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {personalizedPaginationData && personalizedPaginationData.last_page > 1 && (
            <Pagination
              currentPage={personalizedPaginationData.current_page}
              lastPage={personalizedPaginationData.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
