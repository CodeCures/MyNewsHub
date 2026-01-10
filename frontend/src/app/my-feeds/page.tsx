'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useArticlesStore, usePreferencesStore } from '@/store';
import { fetchUserSources, fetchUserCategories, buildFeedFilters } from './feeds.service';
import { sourcesToOptions, categoriesToOptions, stringsToOptions } from '@/lib/utils/selectOptions';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';
import Select from 'react-select';
import type { SelectOption, Source, Category } from '@/types';

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
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

    try {
      const [userSources, userCategories] = await Promise.all([
        fetchUserSources(preferences.preferred_sources || []),
        fetchUserCategories(preferences.preferred_categories || []),
      ]);

      setSources(userSources);
      setCategories(userCategories);
      
      if (preferences.preferred_authors?.length > 0) {
        setAuthors(preferences.preferred_authors);
      }
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  const fetchPersonalizedFeedWithFilters = async (currentPage: number) => {
    const filters = buildFeedFilters(
      debouncedSearch,
      selectedSource,
      selectedCategory,
      selectedAuthor,
      sources,
      categories,
      currentPage
    );
    
    await fetchPersonalizedFeed(currentPage, filters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sourceOptions = sourcesToOptions(sources);
  const categoryOptions = categoriesToOptions(categories);
  const authorOptions = stringsToOptions(authors);

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
              value={findSelectedOption(sourceOptions, selectedSource)}
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
              value={findSelectedOption(categoryOptions, selectedCategory)}
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
              value={findSelectedOption(authorOptions, selectedAuthor)}
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
