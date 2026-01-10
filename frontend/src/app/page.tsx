'use client';

import { useEffect, useState } from 'react';
import { useArticlesStore, useAuthStore } from '@/store';
import { ArticleFilters } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';

export default function Home() {
  const { articles, paginationData, isLoading, error, fetchArticles } = useArticlesStore();
  const { isAuthenticated, user } = useAuthStore();
  const [filters, setFilters] = useState<ArticleFilters>({
    page: 1,
    per_page: 12,
  });
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    // Check if user has preferences set
    const checkPreferences = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/preferences`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const prefs = await response.json();
            const hasAnyPreferences =
              (prefs.preferred_categories && prefs.preferred_categories.length > 0) ||
              (prefs.preferred_sources && prefs.preferred_sources.length > 0) ||
              (prefs.preferred_authors && prefs.preferred_authors.length > 0);
            setHasPreferences(hasAnyPreferences);
          }
        } catch (err) {
          console.error('Failed to fetch preferences:', err);
        }
      }
    };

    checkPreferences();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchArticles(filters);
  }, [filters]);

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category: category || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <ErrorAlert 
        message={error} 
        onRetry={() => fetchArticles(filters)} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Latest News</h1>
        <p className="text-gray-600">Stay informed with the latest headlines from around the world</p>
      </div>

      {isAuthenticated && hasPreferences && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Viewing Personalized Feed</h3>
              <p className="text-sm text-blue-700">Articles are filtered based on your preferences</p>
            </div>
            <button
              onClick={() => setFilters({ ...filters, personalized: false })}
              className="px-4 py-2 text-sm bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
            >
              View All Articles
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="mb-8">
        <CategoryFilter 
          selectedCategory={filters.category || ''} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : articles.length === 0 ? (
        <EmptyState
          title="No Articles Found"
          message="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Clear Filters"
          onAction={() => setFilters({ page: 1, per_page: 12 })}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {paginationData && (
            <Pagination
              currentPage={paginationData.current_page}
              lastPage={paginationData.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
