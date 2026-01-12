'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import Select from 'react-select';
import type { Article, PaginationMeta } from '@/types';
import { useAuthenticatedHttpClient } from '@/hooks/useAuthenticatedHttpClient';
import { sourceService } from '@/services/sourceService';
import { categoryService } from '@/services/categoryService';

interface FeedData {
  articles: Article[];
  meta: PaginationMeta | null;
  message: string;
}

interface FeedFilters {
  search?: string;
  source?: string;
  category?: string;
  author?: string;
  page?: number;
}

interface UserPreferences {
  sources: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: string[];
}

interface MyFeedsClientProps {
  initialData: FeedData;
  initialFilters: FeedFilters;
}

export default function MyFeedsClient({ initialData, initialFilters }: MyFeedsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { httpClient, isLoading: isAuthLoading } = useAuthenticatedHttpClient();
  
  // Preferences state - fetched once on mount
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    sources: [],
    categories: [],
    authors: [],
  });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  
  // Local UI state
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');
  const [selectedSource, setSelectedSource] = useState<string | null>(initialFilters.source || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialFilters.category || null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(initialFilters.author || null);

  // Fetch user preferences once on mount
  useEffect(() => {
    if (!httpClient || isAuthLoading) return;
    
    async function loadPreferences() {
      try {
        const response = await httpClient.get('/preferences');
        const preferences = response.data?.data || response.data || null;
        const preferredSourceIds = preferences?.preferred_sources || [];
        const preferredCategoryIds = preferences?.preferred_categories || [];
        const preferredAuthors = preferences?.preferred_authors || [];
        
        // Fetch all sources and categories in parallel
        const [allSources, allCategories] = await Promise.all([
          sourceService.getAll(),
          categoryService.getAll(),
        ]);
        
        // Filter to only user's preferences
        const sources = allSources.filter(s => preferredSourceIds.includes(s.id));
        const categories = allCategories.filter(c => preferredCategoryIds.includes(c.id));
        
        setUserPreferences({ sources, categories, authors: preferredAuthors });
        setPreferencesLoaded(true);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        setPreferencesLoaded(true); // Still mark as loaded to show UI
      }
    }
    
    loadPreferences();
  }, [httpClient, isAuthLoading]);

  // Update URL params which triggers server-side refetch
  const updateFilters = (newFilters: Partial<FeedFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove each filter
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change (unless it's a page change)
    if (!('page' in newFilters)) {
      params.delete('page');
    }
    
    // Navigate with new params (server component will refetch)
    startTransition(() => {
      router.push(`/my-feeds?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleSourceChange = (sourceId: string | null) => {
    setSelectedSource(sourceId);
    updateFilters({ source: sourceId || undefined });
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    updateFilters({ category: categoryId || undefined });
  };

  const handleAuthorChange = (author: string | null) => {
    setSelectedAuthor(author);
    updateFilters({ author: author || undefined });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedSource(null);
    setSelectedCategory(null);
    setSelectedAuthor(null);
    router.push('/my-feeds');
  };

  // Use static user preferences for filter options (never changes based on current articles)
  const sourceOptions = [
    { value: null, label: 'All Sources' },
    ...userPreferences.sources.map(s => ({ value: s.id, label: s.name }))
  ];

  const categoryOptions = [
    { value: null, label: 'All Categories' },
    ...userPreferences.categories.map(c => ({ value: c.id, label: c.name }))
  ];

  const authorOptions = [
    { value: null, label: 'All Authors' },
    ...userPreferences.authors.map(a => ({ value: a, label: a }))
  ];

  // Custom styles for react-select to make text more visible
  const selectStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      color: '#111827', // text-gray-900
      backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#DBEAFE' : 'white',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3B82F6' : '#DBEAFE',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#111827', // text-gray-900
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6B7280', // text-gray-500
    }),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My Personalized Feed</h1>
        {initialData.message && (
          <p className="text-gray-600">{initialData.message}</p>
        )}
      </div>

      {/* Show loading state while preferences are being fetched */}
      {!preferencesLoaded ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your preferences...</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 space-y-4 bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={isPending}
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <Select
              options={sourceOptions}
              value={sourceOptions.find(opt => opt.value === selectedSource) || sourceOptions[0]}
              onChange={(option) => handleSourceChange(option?.value || null)}
              isDisabled={isPending}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={selectStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select
              options={categoryOptions}
              value={categoryOptions.find(opt => opt.value === selectedCategory) || categoryOptions[0]}
              onChange={(option) => handleCategoryChange(option?.value || null)}
              isDisabled={isPending}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={selectStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <Select
              options={authorOptions}
              value={authorOptions.find(opt => opt.value === selectedAuthor) || authorOptions[0]}
              onChange={(option) => handleAuthorChange(option?.value || null)}
              isDisabled={isPending}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={selectStyles}
            />
          </div>
        </div>

        {(initialFilters.search || initialFilters.source || initialFilters.category || initialFilters.author) && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition"
              disabled={isPending}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Loading indicator during transition */}
      {isPending && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Articles Grid */}
      {initialData.articles.length === 0 ? (
        <EmptyState
          title="No Articles Found"
          message="No articles match your current preferences and filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ opacity: isPending ? 0.6 : 1 }}>
            {initialData.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {initialData.meta && initialData.meta.last_page > 1 && (
            <Pagination
              currentPage={initialData.meta.current_page}
              lastPage={initialData.meta.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
      </>
      )}
    </div>
  );
}
